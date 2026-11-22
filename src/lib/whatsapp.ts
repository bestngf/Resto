import type { Cart } from "./cart/cart";
import { cartTotal } from "./cart/cart";
import { formatFcfa } from "./format";

/** Secours : message de commande prêt à envoyer au restaurant par WhatsApp (lien wa.me gratuit). */
export function whatsappOrderLink(whatsapp: string | null | undefined, cart: Cart, note?: string): string | null {
  const num = (whatsapp ?? "").replace(/\D/g, "");
  if (!num) return null;
  const lines = cart.lines.map((l) => `- ${l.qty} x ${l.name}`).join("\n");
  const text = `Bonjour, je voudrais commander :\n${lines}\nTotal des plats : ${formatFcfa(cartTotal(cart))}${note ? `\nNote : ${note}` : ""}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
