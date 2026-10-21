export const orderStatuses = [
  "RECEBIDO",
  "EM_PREPARO",
  "SAIU_PARA_ENTREGA",
  "ENTREGUE",
  "CANCELADO",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];
export interface OrderItemInput {
  name: string;
  quantity: number;
  unitPrice: number;
}
export interface OrderInput {
  customerName: string;
  deliveryAddress: string;
  items: OrderItemInput[];
}
export interface Order extends OrderInput {
  id: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
export interface OrderPage {
  content: Order[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
export const statusLabels: Record<OrderStatus, string> = {
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em preparo",
  SAIU_PARA_ENTREGA: "Saiu para entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};
export interface DraftItem {
  id: string;
  name: string;
  quantity: string;
  price: string;
}
