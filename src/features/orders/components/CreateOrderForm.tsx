import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ApiError, errorMessage } from "../../../shared/api/client";
import { Button } from "../../../shared/ui/Button";
import { Field } from "../../../shared/ui/Field";
import { Feedback } from "../../../shared/ui/Feedback";
import { createOrder } from "../services/orders";
import { formatMoney, parsePrice } from "../services/money";
import { OrderItemsFields } from "./OrderItemsFields";
import { validateOrderDraft } from "../services/orderDraft";
import type { DraftItem, Order } from "../types/order";

interface CreateOrderFormProps {
  onCreated: (order: Order) => void;
  onCancel: () => void;
  onBusyChange?: (busy: boolean) => void;
}
function newItem(): DraftItem {
  return { id: crypto.randomUUID(), name: "", quantity: "1", price: "" };
}

export function CreateOrderForm({
  onCreated,
  onCancel,
  onBusyChange,
}: CreateOrderFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [items, setItems] = useState<DraftItem[]>([newItem()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (Object.keys(errors).length)
      formRef.current
        ?.querySelector<HTMLInputElement>('input[aria-invalid="true"]')
        ?.focus();
  }, [errors]);
  const total = items.reduce(
    (sum, item) =>
      sum + (parsePrice(item.price) ?? 0) * (Number(item.quantity) || 0),
    0,
  );
  function clearItemErrors() {
    setErrors((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([key]) => !key.startsWith("items[")),
      ),
    );
  }
  function changeItem(
    id: string,
    field: "name" | "quantity" | "price",
    value: string,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const customerName = String(form.get("customerName") ?? "").trim();
    const deliveryAddress = String(form.get("deliveryAddress") ?? "").trim();
    const result = validateOrderDraft(customerName, deliveryAddress, items);
    setError("");
    if (!result.valid) {
      setErrors(result.errors);
      setError("Confira os campos indicados antes de continuar.");
      return;
    }
    setErrors({});
    setBusy(true);
    onBusyChange?.(true);
    try {
      onCreated(await createOrder(result.input));
    } catch (failure) {
      setError(errorMessage(failure));
      if (failure instanceof ApiError) setErrors(failure.fieldErrors);
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }
  return (
    <form ref={formRef} className="order-form" onSubmit={submit}>
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="step-number">01</span>
            <h2>Dados da entrega</h2>
          </div>
          <span className="required-note">
            Todos os campos são obrigatórios
          </span>
        </div>
        <div className="delivery-fields">
          <Field
            label="Nome do cliente"
            name="customerName"
            autoComplete="name"
            required
            maxLength={200}
            disabled={busy}
            error={errors.customerName}
            placeholder="Quem vai receber o pedido?"
          />
          <Field
            label="Endereço de entrega"
            name="deliveryAddress"
            autoComplete="street-address"
            required
            maxLength={500}
            disabled={busy}
            error={errors.deliveryAddress}
            placeholder="Rua, número, bairro e complemento"
          />
        </div>
      </section>
      <OrderItemsFields
        items={items}
        errors={errors}
        disabled={busy}
        onChange={changeItem}
        onAdd={() => {
          clearItemErrors();
          setItems((current) => [...current, newItem()]);
        }}
        onRemove={(id) => {
          clearItemErrors();
          setItems((current) => current.filter((item) => item.id !== id));
        }}
      />
      {error && <Feedback>{error}</Feedback>}
      <footer className="form-footer">
        <div>
          <span>Total do pedido</span>
          <strong>{formatMoney(total)}</strong>
        </div>
        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button type="submit" busy={busy}>
            {busy ? "Criando pedido…" : "Criar pedido"}
            <span aria-hidden="true">↗</span>
          </Button>
        </div>
      </footer>
    </form>
  );
}
