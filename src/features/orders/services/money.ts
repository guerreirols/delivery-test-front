export function parsePrice(value: string): number | null {
  const amount = value.trim().replace(/^R\$\s*/, "");
  const ungrouped = /^\d{1,7}([.,]\d{1,2})?$/.test(amount);
  const grouped = /^\d{1,3}(\.\d{3})+,\d{2}$/.test(amount);
  if (!ungrouped && !grouped) return null;
  const normalized = (grouped ? amount.replace(/\./g, "") : amount).replace(",", ".");
  const [whole, fraction = ""] = normalized.split(".");
  if (whole.length > 7) return null;
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return cents > 0 && Number.isSafeInteger(cents) ? cents : null;
}
export function formatPriceInput(value: string): string | null {
  const amount = value.trim().replace(/^R\$\s*/, "");
  if (!/^[\d.,\s]*$/.test(amount)) return null;
  const digits = amount.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  if (digits.length > 9) return null;
  return formatMoney(Number(digits));
}
export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}
export function orderTotal(
  items: { quantity: number; unitPrice: number }[],
): number {
  return items.reduce(
    (total, item) => total + Math.round(item.unitPrice * 100) * item.quantity,
    0,
  );
}

