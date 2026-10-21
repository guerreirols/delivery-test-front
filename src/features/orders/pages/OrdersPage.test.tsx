import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrdersPage } from "./OrdersPage";
import * as service from "../services/orders";
import { ApiError } from "../../../shared/api/client";
import type { OrderPage } from "../types/order";

const page: OrderPage = {
  content: [
    {
      id: "01order-12345678",
      customerName: "Cliente de Teste",
      deliveryAddress: "Rua Exemplo, 10",
      status: "EM_PREPARO",
      items: [{ name: "Prato", quantity: 2, unitPrice: 15.5 }],
      createdAt: "2026-01-01T12:00:00",
      updatedAt: "2026-01-01T12:00:00",
    },
  ],
  totalElements: 9,
  totalPages: 2,
  number: 0,
  size: 8,
};
afterEach(() => {
  vi.restoreAllMocks();
  history.replaceState(null, "", "/");
});
describe("Order workspace", () => {
  it("shows initial loading and then real order status, items and total", async () => {
    vi.spyOn(service, "listOrders").mockResolvedValue(page);
    render(<OrdersPage />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Buscando seus pedidos",
    );
    expect(await screen.findByText("Cliente de Teste")).toBeVisible();
    expect(screen.getByText("Em preparo")).toBeVisible();
    expect(screen.getAllByText(/R\$.*31,00/)[0]).toBeVisible();
    await userEvent.click(screen.getByText("Ver itens do pedido"));
    expect(screen.getByText("2 × Prato")).toBeVisible();
  });
  it("shows empty state and offers first order creation", async () => {
    vi.spyOn(service, "listOrders").mockResolvedValue({
      ...page,
      content: [],
      totalElements: 0,
      totalPages: 0,
    });
    render(<OrdersPage />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Criar primeiro pedido" }),
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Uma nova entrega",
    );
    expect(screen.getByLabelText("Nome do cliente")).toBeVisible();
  });
  it("offers recovery and keeps existing orders visible after update failure", async () => {
    vi.spyOn(service, "listOrders")
      .mockResolvedValueOnce(page)
      .mockRejectedValueOnce(new ApiError(0, "Sem conexão"))
      .mockResolvedValueOnce(page);
    render(<OrdersPage />);
    await screen.findByText("Cliente de Teste");
    await userEvent.click(
      screen.getByRole("button", { name: "Atualizar pedidos" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Sem conexão");
    expect(screen.getByText("Cliente de Teste")).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: "Tentar novamente" }),
    );
    await vi.waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
    );
  });
  it("requests the next server page and stores pagination in the URL", async () => {
    const list = vi
      .spyOn(service, "listOrders")
      .mockResolvedValueOnce(page)
      .mockResolvedValueOnce({ ...page, number: 1 })
      .mockResolvedValueOnce(page);
    render(<OrdersPage />);
    await screen.findByText("Cliente de Teste");
    await userEvent.click(
      screen.getByRole("button", { name: "Próxima página" }),
    );
    await vi.waitFor(() =>
      expect(list).toHaveBeenLastCalledWith(1, expect.any(AbortSignal)),
    );
    expect(location.search).toBe("?page=1");
    expect(await screen.findByText("P\u00e1gina 2 de 2")).toBeVisible();
    expect(screen.getByText("9\u20139 de 9 pedidos")).toBeVisible();
    expect(screen.getByRole("button", { name: "Pr\u00f3xima p\u00e1gina" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "P\u00e1gina anterior" }));
    expect(await screen.findByText("P\u00e1gina 1 de 2")).toBeVisible();
    expect(screen.getByRole("button", { name: "P\u00e1gina anterior" })).toBeDisabled();
    expect(list).toHaveBeenLastCalledWith(0, expect.any(AbortSignal));
    expect(location.search).toBe("");
  });
  it.each(["1.5", "Infinity", "-2"])(
    "normalizes invalid page %s",
    async (value) => {
      history.replaceState(null, "", `/?page=${value}`);
      const list = vi.spyOn(service, "listOrders").mockResolvedValue(page);
      render(<OrdersPage />);
      await screen.findByText("Cliente de Teste");
      expect(list).toHaveBeenCalledWith(0, expect.any(AbortSignal));
    },
  );
});
