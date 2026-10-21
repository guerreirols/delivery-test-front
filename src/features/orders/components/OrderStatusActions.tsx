import { useState } from "react";
import { Button } from "../../../shared/ui/Button";
import { Feedback } from "../../../shared/ui/Feedback";
import { errorMessage } from "../../../shared/api/client";
import { updateOrderStatus } from "../services/orders";
import { statusLabels } from "../types/order";
import type { OrderStatus } from "../types/order";

interface OrderStatusActionsProps {
  orderId: string;
  status: OrderStatus;
  onUpdated: () => void;
}

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  RECEBIDO: "EM_PREPARO",
  EM_PREPARO: "SAIU_PARA_ENTREGA",
  SAIU_PARA_ENTREGA: "ENTREGUE",
};
const actionLabels: Partial<Record<OrderStatus, string>> = {
  RECEBIDO: "Iniciar preparo",
  EM_PREPARO: "Enviar para entrega",
  SAIU_PARA_ENTREGA: "Marcar como entregue",
};

export function OrderStatusActions({ orderId, status, onUpdated }: OrderStatusActionsProps) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const next = nextStatus[status];
  const canCancel = status === "RECEBIDO" || status === "EM_PREPARO";

  async function update(target: OrderStatus) {
    if (busy || success) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await updateOrderStatus(orderId, target);
      setConfirming(false);
      setSuccess(`Status atualizado: ${statusLabels[target]}.`);
      onUpdated();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  return <div className="order-status-actions" aria-label={`Ações do pedido #${orderId.slice(-8).toUpperCase()}`}>
    {success && <Feedback tone="success">{success}</Feedback>}
    {error && <Feedback>{error}</Feedback>}
    {confirming ? <div className="order-cancel-confirmation">
      <p>Cancelar este pedido? Essa ação não pode ser desfeita.</p>
      <div className="order-action-buttons">
        <Button variant="secondary" busy={busy} onClick={() => void update("CANCELADO")}>Confirmar cancelamento</Button>
        <Button variant="text" disabled={busy} onClick={() => setConfirming(false)}>Manter pedido</Button>
      </div>
    </div> : <div className="order-action-buttons">
      {next && <Button variant="secondary" busy={busy} disabled={Boolean(success)} onClick={() => void update(next)}>{actionLabels[status]}</Button>}
      {canCancel && <Button variant="text" disabled={busy || Boolean(success)} onClick={() => { setError(""); setSuccess(""); setConfirming(true); }}>Cancelar pedido</Button>}
    </div>}
  </div>;
}


