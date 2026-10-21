import { describe, expect, it } from "vitest";
import { formatMoney, orderTotal, parsePrice } from "./money";

describe("money", () => {
  it.each([
    ["12,50", 1250],
    ["12.50", 1250],
    ["1", 100],
    ["0,01", 1],
    [" 2,5 ", 250],
  ])("parses %s as integer cents", (input, expected) => {
    expect(parsePrice(input)).toBe(expected);
  });
  it.each([
    "",
    "-1",
    "0",
    "0.00",
    "1,234",
    "1.000,00",
    "Infinity",
    "12abc",
    "1e3",
  ])("rejects invalid price %s", (input) => {
    expect(parsePrice(input)).toBeNull();
  });
  it("calculates totals in cents without floating point accumulation", () => {
    expect(
      orderTotal([
        { quantity: 3, unitPrice: 0.1 },
        { quantity: 1, unitPrice: 0.2 },
      ]),
    ).toBe(50);
  });
  it("formats Brazilian currency", () => {
    expect(formatMoney(123450).replace(/\s/g, " ")).toBe("R$ 1.234,50");
  });
});
