import { describe, expect, it } from "vitest";
import { validateOrderDraft } from "./orderDraft";

const item = { id: "draft-1", name: " Prato ", quantity: "2", price: "10,50" };
describe("Order draft validation", () => {
  it("normalizes text and creates a typed order payload", () => {
    expect(validateOrderDraft(" Cliente ", " Rua 1 ", [item])).toEqual({
      valid: true,
      input: {
        customerName: "Cliente",
        deliveryAddress: "Rua 1",
        items: [{ name: "Prato", quantity: 2, unitPrice: 10.5 }],
      },
    });
  });
  it("rejects missing delivery data and an empty item list", () => {
    expect(validateOrderDraft(" ", "", [])).toEqual({
      valid: false,
      errors: {
        customerName: "Informe o nome do cliente.",
        deliveryAddress: "Informe o endereço de entrega.",
        items: "Adicione ao menos um item.",
      },
    });
  });
  it.each(["0", "-1", "1.5", "10000"])(
    "rejects invalid quantity %s",
    (quantity) => {
      expect(
        validateOrderDraft("Cliente", "Rua 1", [{ ...item, quantity }]),
      ).toMatchObject({
        valid: false,
        errors: {
          "items[0].quantity": "Use uma quantidade inteira de 1 a 9999.",
        },
      });
    },
  );
});
