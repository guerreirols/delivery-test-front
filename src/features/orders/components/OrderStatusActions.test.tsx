import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderStatusActions } from "./OrderStatusActions";
import * as service from "../services/orders";
import { ApiError } from "../../../shared/api/client";
import type { OrderStatus } from "../types/order";

afterEach(() => vi.restoreAllMocks());
describe("Order status actions", () => {
  it.each<[OrderStatus, string, OrderStatus]>([
    ["RECEBIDO", "Iniciar preparo", "EM_PREPARO"],
    ["EM_PREPARO", "Enviar para entrega", "SAIU_PARA_ENTREGA"],
    ["SAIU_PARA_ENTREGA", "Marcar como entregue", "ENTREGUE"],
  ])("advances %s using the backend", async (status, label, target) => {
    const update = vi.spyOn(service, "updateOrderStatus").mockResolvedValue(undefined);
    const onUpdated = vi.fn();
    render(<OrderStatusActions orderId="order-123" status={status} onUpdated={onUpdated} />);
    await userEvent.click(screen.getByRole("button", { name: label }));
    expect(update).toHaveBeenCalledWith("order-123", target);
    expect(onUpdated).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: label })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Status atualizado");
  });
  it("requires explicit confirmation before cancellation", async () => {
    const update = vi.spyOn(service, "updateOrderStatus").mockResolvedValue(undefined);
    render(<OrderStatusActions orderId="order-123" status="RECEBIDO" onUpdated={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancelar pedido" }));
    expect(update).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Manter pedido" }));
    expect(update).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Cancelar pedido" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirmar cancelamento" }));
    expect(update).toHaveBeenCalledWith("order-123", "CANCELADO");
  });
  it("keeps errors visible and permits retry without claiming success", async () => {
    vi.spyOn(service, "updateOrderStatus").mockRejectedValue(new ApiError(409, "Transição inválida"));
    const onUpdated = vi.fn();
    render(<OrderStatusActions orderId="order-123" status="RECEBIDO" onUpdated={onUpdated} />);
    await userEvent.click(screen.getByRole("button", { name: "Iniciar preparo" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Transição inválida");
    expect(onUpdated).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Iniciar preparo" })).toBeEnabled();
  });
  it("prevents duplicate submissions", async () => {
    let complete: () => void = () => {};
    const pending = new Promise<void>(resolve => { complete = resolve; });
    const update = vi.spyOn(service, "updateOrderStatus").mockReturnValue(pending);
    render(<OrderStatusActions orderId="order-123" status="RECEBIDO" onUpdated={vi.fn()} />);
    const button = screen.getByRole("button", { name: "Iniciar preparo" });
    await userEvent.click(button);
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(update).toHaveBeenCalledOnce();
    complete();
    await screen.findByRole("status");
  });
  it.each<OrderStatus>(["ENTREGUE", "CANCELADO"])("offers no transitions for terminal status %s", status => {
    render(<OrderStatusActions orderId="order-123" status={status} onUpdated={vi.fn()} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});


