// Message WhatsApp prêt à envoyer (lien wa.me gratuit, aucune API payante).
import type { Order } from "@/lib/dashboard/types";

/** Numéro au format international sans « + ». 8 chiffres = numéro togolais (+228). */
export function normalizePhone(p: string | null | undefined, cc = "228"): string | null {
  let d = (p ?? "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (!d) return null;
  if (d.length === 8) d = cc + d;
  return d;
}

export function whatsappLink(phone: string | null | undefined, text: string) {
  return `https://wa.me/${normalizePhone(phone) ?? ""}?text=${encodeURIComponent(text)}`;
}

export function orderMessage(kind: "prete" | "retard", o: Order, restaurantName: string, delayMin = 10): string {
  const ref = o.id.slice(-4).toUpperCase();
  const plats = o.resto_order_items.map((i) => `${i.quantity} x ${i.name_snapshot}`).join(", ");
  if (kind === "prete") {
    const suite = o.mode === "livraison" ? "Notre livreur part tout de suite." : o.mode === "emporter" ? "Vous pouvez venir la récupérer." : "Elle arrive à votre table.";
    return `Bonjour, votre commande n°${ref} chez ${restaurantName} est prête (${plats}). ${suite} Merci !`;
  }
  return `Bonjour, votre commande n°${ref} chez ${restaurantName} a un peu de retard, environ ${delayMin} minutes de plus. Merci de votre patience et toutes nos excuses !`;
}
