import { afterEach, describe, expect, it, vi } from "vitest";
import { request } from "./client";

afterEach(() => vi.unstubAllGlobals());
describe("HTTP client", () => {
  it("accepts empty successful responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );
    await expect(request("/auth/logout")).resolves.toBeUndefined();
  });
  it("maps backend field errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({
              message: "Dados inválidos",
              fieldErrors: [{ field: "email", message: "E-mail inválido" }],
            }),
            { status: 400 },
          ),
        ),
    );
    await expect(request("/auth/register")).rejects.toMatchObject({
      status: 400,
      message: "Dados inválidos",
      fieldErrors: { email: "E-mail inválido" },
    });
  });
  it("hides internal server messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ message: "database internals" }), {
            status: 500,
          }),
        ),
    );
    await expect(request("/orders")).rejects.toThrow(
      "O serviço está indisponível.",
    );
  });
  it("keeps abort distinct from a network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("cancelled", "AbortError")),
    );
    await expect(request("/orders")).rejects.toMatchObject({
      name: "AbortError",
    });
  });
  it("handles invalid JSON on HTTP error without crashing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("bad gateway", { status: 502 })),
    );
    await expect(request("/orders")).rejects.toMatchObject({ status: 502 });
  });
});

describe("Backend error contract", () => {
  it.each([400, 401, 403, 404, 409])("preserves HTTP %i and the public message", async status => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 500,
      message: "Mensagem pública do backend",
    }), { status })));
    await expect(request("/orders")).rejects.toMatchObject({
      status,
      message: "Mensagem pública do backend",
      fieldErrors: {},
    });
  });
  it("maps nested validation fields using the backend property names", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 400,
      message: "Dados inválidos",
      fieldErrors: [{ field: "items[0].quantity", message: "Quantidade inválida" }],
    }), { status: 400 })));
    await expect(request("/orders")).rejects.toMatchObject({
      status: 400,
      fieldErrors: { "items[0].quantity": "Quantidade inválida" },
    });
  });
  it.each([500, 502, 503])("preserves HTTP %i while hiding infrastructure details", async status => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status,
      message: "database internals",
    }), { status })));
    await expect(request("/orders")).rejects.toMatchObject({
      status,
      message: "O serviço está indisponível. Tente novamente em instantes.",
    });
  });
});
