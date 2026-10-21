import { ApiError, isRecord } from "../../../shared/api/client";
import { session } from "../../auth";
import { orderStatuses } from "../types/order";
import type { Order, OrderInput, OrderPage, OrderStatus } from "../types/order";

function isStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    orderStatuses.some((status) => status === value)
  );
}
function parseOrder(value: unknown): Order {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.customerName !== "string" ||
    typeof value.deliveryAddress !== "string" ||
    !isStatus(value.status) ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    !Array.isArray(value.items)
  )
    throw new ApiError(
      502,
      "Não foi possível interpretar os pedidos recebidos.",
    );
  const items = value.items.map((item: unknown) => {
    if (
      !isRecord(item) ||
      typeof item.name !== "string" ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 0 ||
      typeof item.unitPrice !== "number" ||
      !Number.isFinite(item.unitPrice) ||
      item.unitPrice < 0
    )
      throw new ApiError(502, "Um pedido recebido possui itens inválidos.");
    return {
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    };
  });
  return {
    id: value.id,
    customerName: value.customerName,
    deliveryAddress: value.deliveryAddress,
    status: value.status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    items,
  };
}
export async function listOrders(
  page: number,
  signal?: AbortSignal,
): Promise<OrderPage> {
  const body = await session.authorized(
    `/orders?page=${page}&size=8&sort=createdAt,desc`,
    { signal },
  );
  if (
    !isRecord(body) ||
    !Array.isArray(body.content) ||
    typeof body.totalElements !== "number" ||
    typeof body.totalPages !== "number" ||
    typeof body.number !== "number" ||
    typeof body.size !== "number"
  )
    throw new ApiError(502, "Não foi possível interpretar a lista de pedidos.");
  return {
    content: body.content.map(parseOrder),
    totalElements: body.totalElements,
    totalPages: body.totalPages,
    number: body.number,
    size: body.size,
  };
}
export async function createOrder(input: OrderInput): Promise<Order> {
  return parseOrder(
    await session.authorized("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await session.authorized(`/orders/${encodeURIComponent(id)}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}
