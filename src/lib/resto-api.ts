"use client";
// Appels à la fonction serveur "resto-api" (Supabase). Aucune clé secrète ici : seulement la clé publique et, si le client est connecté, sa session.
import { API_URL, SUPABASE_ANON_KEY, siteOrigin } from "@/config/public";
import { getSupabase } from "@/lib/supabase/client";

export class ApiFail extends Error {
  constructor(public code: string, public status: number, public userMessage: string) { super(code); } // message = code : compris par humanError()
}
async function headers(): Promise<Record<string, string>> {
  let token = "";
  try { token = (await getSupabase().auth.getSession()).data.session?.access_token ?? ""; } catch { /* visiteur sans compte */ }
  return { "content-type": "application/json", apikey: SUPABASE_ANON_KEY, authorization: "Bearer " + (token || SUPABASE_ANON_KEY) };
}
async function call<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  let r: Response;
  try { r = await fetch(API_URL + path, { method: init?.method ?? "GET", headers: await headers(), body: init?.body ? JSON.stringify(init.body) : undefined }); }
  catch { throw new ApiFail("reseau", 0, "Pas de connexion. Réessaie dès que le réseau revient."); }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiFail(String(d.error ?? "erreur"), r.status, String(d.message ?? "Une erreur est survenue."));
  return d as T;
}
const phoneOf = (p: string) => p.replace(/[^\d+ ]/g, "").trim();

export type NewOrder = {
  restaurantId: string; mode: "sur_place" | "emporter" | "livraison"; method: "mobile_money" | "especes"; name: string; phone: string;
  items: { menuItemId: string; qty: number }[]; tableId?: string | null; zoneId?: string | null; address?: string; landmark?: string; lat?: number | null; lng?: number | null; note?: string;
};
export type OrderCreated = { order_id: string; payment_id: string; total: number; delivery_fee: number; tracking_code: string; tracking_url: string | null };
export const createOrderApi = (o: NewOrder) => call<OrderCreated>("/orders", { method: "POST", body: {
  restaurant_id: o.restaurantId, mode: o.mode, payment_method: o.method, name: o.name.trim(), phone: phoneOf(o.phone), table_id: o.tableId ?? null, zone_id: o.zoneId ?? null,
  address: o.address?.trim() || null, landmark: o.landmark?.trim() || null, lat: o.lat ?? null, lng: o.lng ?? null, note: o.note?.trim() || null,
  items: o.items.map((i) => ({ menu_item_id: i.menuItemId, quantite: i.qty })), origin: siteOrigin() } });

export type OrderView = {
  order_id: string; status: string; mode: string; payment_method: string; payment_status: string; payment_id: string | null; subtotal: number; delivery_fee: number; total: number; created_at: string;
  items: { name: string; quantity: number; unit_price: number; line_total: number }[]; restaurant: { name: string; phone: string | null; whatsapp: string | null; slug: string };
  can_retry: boolean; whatsapp_link: string | null;
};
export const getOrderByCode = (code: string) => call<OrderView>("/orders?code=" + encodeURIComponent(code));
export const cancelOrderByCode = (code: string) => call<{ ok: true }>("/orders/cancel", { method: "POST", body: { code } });
/** Lance (ou reprend) le paiement mobile money : renvoie l'adresse de la page de paiement. */
export const startPayment = (paymentId: string, code?: string) => call<{ url: string; amount: number }>("/payments/init", { method: "POST", body: { payment_id: paymentId, code: code ?? null, origin: siteOrigin() } });
export const createReservationApi = (r: { restaurantId: string; name: string; phone: string; people: number; startIso: string; note?: string }) =>
  call<{ id: string }>("/reservations", { method: "POST", body: { restaurant_id: r.restaurantId, name: r.name.trim(), phone: phoneOf(r.phone), people: r.people, start: r.startIso, note: r.note?.trim() || null, source: "site" } });
