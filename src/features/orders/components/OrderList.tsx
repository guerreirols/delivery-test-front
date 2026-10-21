import { OrderStatusActions } from "./OrderStatusActions";
import { formatMoney, orderTotal } from "../services/money";
import { statusLabels } from "../types/order";
import type { Order } from "../types/order";

interface OrderListProps {
  orders: Order[]; onUpdated: () => void;
}
function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Data indisponível"
    : new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}
export function OrderList({ orders, onUpdated }: OrderListProps) {
  return (
    <div className="order-list">
      <div className="order-table-head" aria-hidden="true">
        <span>Pedido / Cliente</span>
        <span>Entrega</span>
        <span>Criado em</span>
        <span>Valor</span>
        <span>Status atual</span>
      </div>
      <ul>
        {orders.map((order) => (
          <li key={order.id} className="order-row">
            <div className="order-customer">
              <span className="order-symbol" aria-hidden="true">
                ↗
              </span>
              <div>
                <span className="order-id" title={order.id}>
                  #{order.id.slice(-8).toUpperCase()}
                </span>
                <h3>{order.customerName}</h3>
                <span className="order-item-count">
                  {order.items.reduce(
                    (count, item) => count + item.quantity,
                    0,
                  )}{" "}
                  itens
                </span>
              </div>
            </div>
            <span className="order-address">{order.deliveryAddress}</span>
            <time dateTime={order.createdAt}>
              {formatDate(order.createdAt)}
            </time>
            <strong className="order-price">
              {formatMoney(orderTotal(order.items))}
            </strong>
            <span className={`status status--${order.status.toLowerCase()}`}>
              <span aria-hidden="true" />
              {statusLabels[order.status]}
            </span>
            <details className="order-details">
              <summary>Ver itens do pedido</summary>
              <ul>
                {order.items.map((item, index) => (
                  <li key={`${item.name}-${index}`}>
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <strong>
                      {formatMoney(
                        Math.round(item.unitPrice * 100) * item.quantity,
                      )}
                    </strong>
                  </li>
                ))}
              </ul>
            </details><OrderStatusActions key={`${order.id}-${order.status}`} orderId={order.id} status={order.status} onUpdated={onUpdated} />
          </li>
        ))}
      </ul>
    </div>
  );
}


