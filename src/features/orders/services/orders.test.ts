import { afterEach, describe, expect, it, vi } from "vitest";
import { session } from "../../auth";
import { createOrder, listOrders, updateOrderStatus } from "./orders";

const order = {
  id: "test-order",
  customerName: "Cliente",
  deliveryAddress: "Rua Exemplo",
  status: "RECEBIDO",
  items: [{ name: "Prato", quantity: 1, unitPrice: 20.5 }],
  createdAt: "2026-01-01T12:00:00",
  updatedAt: "2026-01-01T12:00:00",
};
afterEach(() => vi.restoreAllMocks());
describe("Order API contracts", () => {
  it("consumes the backend page and requests explicit server ordering", async () => {
    const authorized = vi.spyOn(session, "authorized").mockResolvedValue({
      content: [order],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 8,
    });
    const result = await listOrders(0);
    expect(authorized).toHaveBeenCalledWith(
      "/orders?page=0&size=8&sort=createdAt,desc",
      { signal: undefined },
    );
    expect(result.content[0]).toEqual(order);
  });
  it("lists persisted zero quantities and prices without rejecting the page", async () => {
    const persistedOrder = {
      ...order,
      items: [{ name: "Item legado", quantity: 0, unitPrice: 0 }],
    };
    vi.spyOn(session, "authorized").mockResolvedValue({
      content: [persistedOrder, order],
      totalElements: 2,
      totalPages: 1,
      number: 0,
      size: 8,
    });
    const result = await listOrders(0);
    expect(result.content).toEqual([persistedOrder, order]);
  });
  it("requests the selected server page and preserves its pagination metadata", async () => {
    const authorized = vi.spyOn(session, "authorized").mockResolvedValue({
      content: [order],
      totalElements: 9,
      totalPages: 2,
      number: 1,
      size: 8,
    });
    const result = await listOrders(1);
    expect(authorized).toHaveBeenCalledWith(
      "/orders?page=1&size=8&sort=createdAt,desc",
      { signal: undefined },
    );
    expect(result).toMatchObject({ totalElements: 9, totalPages: 2, number: 1, size: 8 });
  });
  it("rejects unexpected response formats instead of reporting an empty list", async () => {
    vi.spyOn(session, "authorized").mockResolvedValue({ wrong: [] });
    await expect(listOrders(0)).rejects.toMatchObject({ status: 502 });
  });
  it.each([
    { ...order, status: "UNKNOWN" },
    { ...order, items: [{ name: "Prato", quantity: -1, unitPrice: 20 }] },
  ])("rejects invalid order data", async (invalidOrder) => {
    vi.spyOn(session, "authorized").mockResolvedValue({
      content: [invalidOrder],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 8,
    });
    await expect(listOrders(0)).rejects.toMatchObject({ status: 502 });
  });
  it("serializes the creation contract and accepts the backend 200 response", async () => {
    const authorized = vi.spyOn(session, "authorized").mockResolvedValue(order);
    const input = {
      customerName: order.customerName,
      deliveryAddress: order.deliveryAddress,
      items: order.items,
    };
    await expect(createOrder(input)).resolves.toEqual(order);
    expect(authorized).toHaveBeenCalledWith("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  });
});

describe("Order status API", () => {
  it("sends only the selected status and accepts an empty response", async () => {
    const authorized = vi.spyOn(session, "authorized").mockResolvedValue(undefined);
    await expect(updateOrderStatus("order/id", "EM_PREPARO")).resolves.toBeUndefined();
    expect(authorized).toHaveBeenCalledWith("/orders/order%2Fid/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "EM_PREPARO" }),
    });
  });
});
