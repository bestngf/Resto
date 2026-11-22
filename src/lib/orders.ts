import { createOrderApi } from "./resto-api";
import type { Cart } from "./cart/cart";

export type Mode = "sur_place" | "emporter" | "livraison";
export type Method = "mobile_money" | "especes";

export type OrderInput = {
  cart: Cart;
  mode: Mode;
  method: Method;
  tableId?: string | null;
  zoneId?: string | null;
  address?: string;
  landmark?: string;
  lat?: number | null;
  lng?: number | null;
  note?: string;
  name: string;
  phone: string;
};

export type OrderResult = { order_id: string; payment_id: string; total: number; delivery_fee: number; tracking_code: string };

/** Crée la commande via le serveur Resto : prix et totaux recalculés côté serveur ; le client peut être connecté ou non. */
export async function createOrder(i: OrderInput): Promise<OrderResult> {
  return createOrderApi({ restaurantId: i.cart.restaurantId, mode: i.mode, method: i.method, name: i.name, phone: i.phone, tableId: i.tableId, zoneId: i.zoneId,
    address: i.address, landmark: i.landmark, lat: i.lat, lng: i.lng, note: i.note, items: i.cart.lines.map((l) => ({ menuItemId: l.itemId, qty: l.qty })) });
}

export const STEPS: Record<Mode, { key: string; label: string }[]> = {
  sur_place: [
    { key: "recue", label: "Commande reçue" },
    { key: "en_preparation", label: "En préparation" },
    { key: "prete", label: "Prête" },
    { key: "servie", label: "Servie" },
  ],
  emporter: [
    { key: "recue", label: "Commande reçue" },
    { key: "en_preparation", label: "En préparation" },
    { key: "prete", label: "Prête à récupérer" },
    { key: "servie", label: "Récupérée" },
  ],
  livraison: [
    { key: "recue", label: "Commande reçue" },
    { key: "en_preparation", label: "En préparation" },
    { key: "prete", label: "Prête" },
    { key: "en_route", label: "En route" },
    { key: "livree", label: "Livrée" },
  ],
};
