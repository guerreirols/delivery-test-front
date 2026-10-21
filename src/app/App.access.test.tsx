import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

const state = vi.hoisted(() => ({ status: "anonymous" }));
const restore = vi.hoisted(() => vi.fn());
vi.mock("../features/auth/hooks/useSession", () => ({ useSession: () => state.status }));
vi.mock("../features/auth/services/session", () => ({
  session: { restore, login: vi.fn(), register: vi.fn(), logout: vi.fn() },
}));

describe("Application authentication guard", () => {
  beforeEach(() => {
    restore.mockClear();
  });
  it("opens login without rendering orders when unauthenticated", () => {
    state.status = "anonymous";
    render(<App />);
    expect(screen.getByLabelText("E-mail")).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Todos os pedidos" })).not.toBeInTheDocument();
    expect(restore).toHaveBeenCalledOnce();
  });
  it("opens login with a connection notice when session verification is unavailable", () => {
    state.status = "unavailable";
    render(<App />);
    expect(screen.getByLabelText("E-mail")).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível verificar sua sessão");
    expect(screen.queryByRole("heading", { name: "Todos os pedidos" })).not.toBeInTheDocument();
  });
  it("does not expose protected content before session verification completes", () => {
    state.status = "restoring";
    render(<App />);
    expect(screen.getByRole("status")).toHaveTextContent("Preparando seu espaço");
    expect(screen.queryByRole("heading", { name: "Todos os pedidos" })).not.toBeInTheDocument();
  });
});

