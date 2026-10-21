import { parsePrice } from "./money";
import type { DraftItem, OrderInput } from "../types/order";

type OrderDraftResult =
  | { valid: true; input: OrderInput }
  | { valid: false; errors: Record<string, string> };

export function validateOrderDraft(
  customerName: string,
  deliveryAddress: string,
  items: DraftItem[],
): OrderDraftResult {
  const errors: Record<string, string> = {};
  if (!customerName.trim()) errors.customerName = "Informe o nome do cliente.";
  if (!deliveryAddress.trim())
    errors.deliveryAddress = "Informe o endereço de entrega.";
  if (!items.length) errors.items = "Adicione ao menos um item.";
  const parsedItems = items.map((item, index) => {
    const cents = parsePrice(item.price);
    const quantity = Number(item.quantity);
    if (!item.name.trim())
      errors[`items[${index}].name`] = "Informe o nome do produto.";
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9999)
      errors[`items[${index}].quantity`] =
        "Use uma quantidade inteira de 1 a 9999.";
    if (cents === null)
      errors[`items[${index}].unitPrice`] =
        "Informe um valor positivo com até duas casas decimais.";
    return { name: item.name.trim(), quantity, unitPrice: (cents ?? 0) / 100 };
  });
  if (Object.keys(errors).length) return { valid: false, errors };
  return {
    valid: true,
    input: {
      customerName: customerName.trim(),
      deliveryAddress: deliveryAddress.trim(),
      items: parsedItems,
    },
  };
}
