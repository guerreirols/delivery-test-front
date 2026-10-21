import { Button } from "../../../shared/ui/Button";
import { Field } from "../../../shared/ui/Field";
import { formatMoney, parsePrice } from "../services/money";

import type { DraftItem } from "../types/order";

interface OrderItemsFieldsProps {
  items: DraftItem[];
  errors: Record<string, string>;
  disabled: boolean;
  onChange: (
    id: string,
    field: "name" | "quantity" | "price",
    value: string,
  ) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}
export function OrderItemsFields({
  items,
  errors,
  disabled,
  onChange,
  onAdd,
  onRemove,
}: OrderItemsFieldsProps) {
  return (
    <section className="form-section">
      <div className="section-heading">
        <div>
          <span className="step-number">02</span>
          <h2>Itens do pedido</h2>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={onAdd}
          disabled={disabled}
        >
          + Adicionar item
        </Button>
      </div>
      <div className="items-fields">
        {items.map((item, index) => (
          <fieldset key={item.id} className="item-fields" disabled={disabled}>
            <legend>Item {index + 1}</legend>
            <div className="item-fields-grid">
              <Field
                label="Produto"
                value={item.name}
                onChange={(event) =>
                  onChange(item.id, "name", event.target.value)
                }
                placeholder="Nome do produto"
                required
                maxLength={200}
                error={errors[`items[${index}].name`]}
              />
              <Field
                label="Quantidade"
                type="number"
                min="1"
                max="9999"
                step="1"
                value={item.quantity}
                onChange={(event) =>
                  onChange(item.id, "quantity", event.target.value)
                }
                required
                error={errors[`items[${index}].quantity`]}
              />
              <Field
                label="Preço unitário (R$)"
                inputMode="decimal"
                value={item.price}
                onChange={(event) =>
                  onChange(item.id, "price", event.target.value)
                }
                placeholder="0,00"
                required
                error={errors[`items[${index}].unitPrice`]}
              />
              <div className="item-subtotal">
                <span>Subtotal</span>
                <strong>
                  {formatMoney(
                    (parsePrice(item.price) ?? 0) *
                      (Number(item.quantity) || 0),
                  )}
                </strong>
              </div>
              <Button
                type="button"
                variant="text"
                aria-label={`Remover item ${index + 1}`}
                onClick={() => onRemove(item.id)}
                disabled={items.length === 1}
              >
                ×
              </Button>
            </div>
          </fieldset>
        ))}
      </div>
    </section>
  );
}
