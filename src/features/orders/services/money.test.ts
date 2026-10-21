import { describe, expect, it } from "vitest";
import { formatMoney, formatPriceInput, orderTotal, parsePrice } from "./money";

describe("money", () => {
  it.each([
    ["12,50", 1250],
    ["R$ 1.234,56", 123456],
    ["1.000,00", 100000],
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
    "1.00,00",
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

describe("Live BRL input formatting", () => {
  it.each([
    ["1", "R$ 0,01"],
    ["12", "R$ 0,12"],
    ["1250", "R$ 12,50"],
    ["R$ 1.234,56", "R$ 1.234,56"],
    ["0001", "R$ 0,01"],
    ["0", "R$ 0,00"],
    ["999999999", "R$ 9.999.999,99"],
    ["", ""],
  ])("formats %s immediately", (value, expected) => {
    expect(formatPriceInput(value)?.replace(/\s/g, " ")).toBe(expected);
  });
  it.each(["-10", "abc", "1000000000"])("rejects invalid or excessive input %s", value => {
    expect(formatPriceInput(value)).toBeNull();
  });
});
