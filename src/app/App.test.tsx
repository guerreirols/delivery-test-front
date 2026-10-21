import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import type { Order } from "../features/orders/types/order";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("Application flow through HTTP boundary", () => {
  it("restores anonymously, logs in, creates an order, lists it and logs out", async () => {
    let authenticated = false;
    const orders: Order[] = [];
    const fetchMock = vi.fn<typeof fetch>(async (input, options) => {
      const path = new URL(String(input)).pathname;
      if (path === "/auth/refresh")
        return json({ message: "Sessão expirada" }, 401);
      if (path === "/auth/login") {
        authenticated = true;
        return json({
          accessToken: "test-access",
          tokenType: "Bearer",
          expiresIn: 3600,
        });
      }
      if (path === "/auth/logout") {
        authenticated = false;
        return new Response(null, { status: 204 });
      }
      if (path === "/users/me" && authenticated) return json({ name: "Maria Silva" });
      if (path === "/orders" && authenticated) {
        if (options?.method === "POST") {
          const order: Order = {
            id: "test-order-12345678",
            customerName: "Cliente",
            deliveryAddress: "Rua Exemplo, 10",
            status: "RECEBIDO",
            items: [{ name: "Prato", quantity: 1, unitPrice: 20.5 }],
            createdAt: "2026-01-01T12:00:00",
            updatedAt: "2026-01-01T12:00:00",
          };
          orders.push(order);
          return json(order);
        }
        return json({
          content: orders,
          totalElements: orders.length,
          totalPages: orders.length ? 1 : 0,
          number: 0,
          size: 8,
        });
      }
      throw new Error("Unexpected request");
    });
    vi.stubGlobal("fetch", fetchMock);
    const storage = vi.spyOn(Storage.prototype, "setItem");
    const user = userEvent.setup();
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    await user.type(
      await screen.findByLabelText("E-mail"),
      "person@example.test",
    );
    await user.type(screen.getByLabelText("Senha"), "example123");
    await user.click(
      screen.getByRole("button", { name: /Entrar na minha conta/ }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Criar primeiro pedido" }),
    );
    expect(await screen.findByText("Maria Silva")).toBeVisible();
    await user.type(screen.getByLabelText("Nome do cliente"), "Cliente");
    await user.type(
      screen.getByLabelText("Endereço de entrega"),
      "Rua Exemplo, 10",
    );
    await user.type(screen.getByLabelText("Produto"), "Prato");
    await user.type(screen.getByLabelText("Preço unitário (R$)"), "20,50");
    await user.click(screen.getByRole("button", { name: /^Criar pedido/ }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "criado com sucesso",
    );
    expect(await screen.findByText("Recebido")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Sair" }));
    expect(
      await screen.findByRole("heading", { name: "Bom ter você aqui." }),
    ).toBeVisible();
    expect(screen.queryByText("Cliente")).not.toBeInTheDocument();
    expect(screen.queryByText("Maria Silva")).not.toBeInTheDocument();
    expect(storage).not.toHaveBeenCalled();
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith("/auth/refresh"),
      ),
    ).toHaveLength(1);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
});


