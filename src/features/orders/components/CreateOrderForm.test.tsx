import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateOrderForm } from "./CreateOrderForm";
import * as orders from "../services/orders";
import { ApiError } from "../../../shared/api/client";
import type { Order } from "../types/order";

const order: Order = {
  id: "test-order-12345678",
  customerName: "Cliente",
  deliveryAddress: "Rua das Flores, 10",
  status: "RECEBIDO",
  items: [{ name: "Produto", quantity: 2, unitPrice: 12.5 }],
  createdAt: "2026-01-01T12:00:00",
  updatedAt: "2026-01-01T12:00:00",
};
afterEach(() => vi.restoreAllMocks());
async function fillOrder() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nome do cliente"), "Cliente");
  await user.type(
    screen.getByLabelText("Endereço de entrega"),
    "Rua das Flores, 10",
  );
  await user.type(screen.getByLabelText("Produto"), "Produto");
  await user.clear(screen.getByLabelText("Quantidade"));
  await user.type(screen.getByLabelText("Quantidade"), "2");
  await user.type(screen.getByLabelText("Preço unitário (R$)"), "12,50");
  return user;
}

describe("Create order", () => {
  it("creates with decimal price and calculates the total in BRL", async () => {
    const create = vi.spyOn(orders, "createOrder").mockResolvedValue(order);
    const onCreated = vi.fn();
    render(<CreateOrderForm onCreated={onCreated} onCancel={vi.fn()} />);
    const user = await fillOrder();
    expect(screen.getAllByText(/R\$.*25,00/)).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: /^Criar pedido/ }));
    expect(create).toHaveBeenCalledWith({
      customerName: "Cliente",
      deliveryAddress: "Rua das Flores, 10",
      items: [{ name: "Produto", quantity: 2, unitPrice: 12.5 }],
    });
    expect(onCreated).toHaveBeenCalledWith(order);
  });
  it("adds and removes items with stable identity", async () => {
    const user = userEvent.setup();
    render(<CreateOrderForm onCreated={vi.fn()} onCancel={vi.fn()} />);
    await user.type(screen.getByLabelText("Produto"), "Primeiro");
    await user.click(screen.getByRole("button", { name: /Adicionar item/ }));
    const second = screen.getByRole("group", { name: "Item 2" });
    await user.type(within(second).getByLabelText("Produto"), "Segundo");
    await user.click(screen.getByRole("button", { name: "Remover item 1" }));
    expect(screen.getByLabelText("Produto")).toHaveValue("Segundo");
    expect(
      screen.getByRole("button", { name: "Remover item 1" }),
    ).toBeDisabled();
  });
  it("rejects more than two decimals instead of silently rounding", async () => {
    const create = vi.spyOn(orders, "createOrder").mockResolvedValue(order);
    render(<CreateOrderForm onCreated={vi.fn()} onCancel={vi.fn()} />);
    const user = await fillOrder();
    await user.clear(screen.getByLabelText("Preço unitário (R$)"));
    await user.type(screen.getByLabelText("Preço unitário (R$)"), "12,345");
    await user.click(screen.getByRole("button", { name: /^Criar pedido/ }));
    expect(
      await screen.findByText(
        "Informe um valor positivo com até duas casas decimais.",
      ),
    ).toBeVisible();
    expect(create).not.toHaveBeenCalled();
  });
  it("preserves fields and associates indexed backend errors", async () => {
    vi.spyOn(orders, "createOrder").mockRejectedValue(
      new ApiError(400, "Dados inválidos", {
        "items[0].unitPrice": "Preço inválido",
      }),
    );
    render(<CreateOrderForm onCreated={vi.fn()} onCancel={vi.fn()} />);
    const user = await fillOrder();
    await user.click(screen.getByRole("button", { name: /^Criar pedido/ }));
    expect(await screen.findByText("Preço inválido")).toBeVisible();
    expect(
      screen.getByLabelText("Preço unitário (R$)"),
    ).toHaveAccessibleDescription("Preço inválido");
    expect(screen.getByLabelText("Nome do cliente")).toHaveValue("Cliente");
    await user.click(screen.getByRole("button", { name: /Adicionar item/ }));
    expect(screen.queryByText("Preço inválido")).not.toBeInTheDocument();
  });
  it("prevents duplicate submissions and cancellation while sending", async () => {
    const create = vi
      .spyOn(orders, "createOrder")
      .mockReturnValue(new Promise(() => undefined));
    const onBusyChange = vi.fn();
    render(
      <CreateOrderForm
        onBusyChange={onBusyChange}
        onCreated={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const user = await fillOrder();
    await user.click(screen.getByRole("button", { name: /^Criar pedido/ }));
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Criando pedido/ }),
    ).toBeDisabled();
    expect(onBusyChange).toHaveBeenCalledWith(true);
    expect(create).toHaveBeenCalledTimes(1);
  });
});
