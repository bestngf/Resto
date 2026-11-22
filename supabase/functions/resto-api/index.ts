// resto-api : commandes, paiement, réservations et assistant vocal de Resto.
// Cette fonction tourne chez Supabase et garde elle-même les clés secrètes : le site (Netlify) n'a aucune variable à régler.
// Aucun montant n'est jamais accepté du navigateur ; aucune donnée personnelle n'est écrite dans les journaux.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const SB_URL = (Deno.env.get("SUPABASE_URL") || "").replace(/\/+$/, "");
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || (() => { try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").default || ""; } catch { return ""; } })();
const ANON = Deno.env.get("SUPABASE_ANON_KEY") || "";
const VOICE_SECRET = Deno.env.get("VOICE_WEBHOOK_SECRET") || "";
const SALT = "resto-api";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info, x-signature", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };

class ApiError extends Error { constructor(public code: string, public status: number) { super(code); } }
const TABLE: Record<string, number> = {
  non_connecte: 401, non_autorise: 403, commande_introuvable: 404, paiement_introuvable: 404, restaurant_indisponible: 404,
  mode_indisponible: 409, creneau_indisponible: 409, limite_reservations: 409, plat_indisponible: 409, minimum_non_atteint: 409, deja_paye: 409,
  commande_annulee: 409, annulation_impossible: 409, contact_requis: 400, panier_invalide: 400, table_invalide: 400, zone_invalide: 400,
  adresse_requise: 400, donnees_invalides: 400, paiement_invalide: 400, cible_invalide: 400, trop_de_commandes: 429, trop_de_demandes: 429,
  trop_de_requetes: 429, trop_de_tentatives: 429, paiement_indisponible: 502, not_configured: 503, return_url_invalide: 400, montant_invalide: 400,
};
const MESSAGES: Record<string, string> = {
  non_connecte: "Connexion requise.", non_autorise: "Action non autorisée.", commande_introuvable: "Commande introuvable.", paiement_introuvable: "Paiement introuvable.",
  restaurant_indisponible: "Restaurant indisponible.", mode_indisponible: "Ce mode de commande n'est pas proposé.", creneau_indisponible: "Ce créneau n'est plus disponible.",
  limite_reservations: "Ce restaurant ne prend plus de réservations ce mois-ci.", plat_indisponible: "Un plat n'est plus disponible.", minimum_non_atteint: "Le minimum de commande pour la livraison n'est pas atteint.",
  deja_paye: "Cette commande est déjà payée.", commande_annulee: "Cette commande est annulée.", annulation_impossible: "Cette commande ne peut plus être annulée.",
  contact_requis: "Nom et téléphone valides requis.", panier_invalide: "Panier invalide.", table_invalide: "Table invalide.", zone_invalide: "Zone de livraison invalide.",
  adresse_requise: "Adresse ou repère requis pour la livraison.", donnees_invalides: "Données invalides.", trop_de_commandes: "Trop de commandes, réessayez plus tard.",
  trop_de_demandes: "Trop de demandes, réessayez plus tard.", trop_de_requetes: "Trop de requêtes, réessayez plus tard.", paiement_indisponible: "Le paiement est momentanément indisponible.",
};
const toErr = (e: unknown): ApiError => {
  if (e instanceof ApiError) return e;
  const m = e && typeof (e as any).message === "string" ? (e as any).message : "";
  return m in TABLE ? new ApiError(m, TABLE[m]) : new ApiError("erreur_serveur", 500);
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const logFailure = (scope: string, code: string, status: number) => { try { console.error(JSON.stringify({ level: "error", scope, code, status })); } catch { /* rien */ } };
async function guarded(scope: string, fn: () => Promise<Response>) {
  try { return await fn(); } catch (e) { const er = toErr(e); logFailure(scope, er.code, er.status); return json({ error: er.code, message: MESSAGES[er.code] || "Une erreur est survenue." }, er.status); }
}

// ---- validation ----
const bad = () => new ApiError("donnees_invalides", 400);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);
const uuid = (v: unknown) => { if (!isUuid(v)) throw bad(); return v.toLowerCase(); };
const optUuid = (v: unknown) => (v == null || v === "" ? null : uuid(v));
const str = (v: unknown, min: number, max: number) => { if (typeof v !== "string") throw bad(); const s = v.trim(); if (s.length < min || s.length > max) throw bad(); return s; };
const optStr = (v: unknown, max: number) => (v == null || v === "" ? null : str(v, 1, max));
const int = (v: unknown, min: number, max: number) => { if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) throw bad(); return v; };
const oneOf = <T extends string>(v: unknown, l: readonly T[]): T => { if (typeof v !== "string" || !l.includes(v as T)) throw bad(); return v as T; };
const phone = (v: unknown) => { const s = str(v, 8, 20).replace(/\s+/g, " "); if (!/^\+?[0-9 ]{8,16}$/.test(s)) throw bad(); return s; };
const optNum = (v: unknown, min: number, max: number) => { if (v == null || v === "") return null; if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) throw bad(); return v; };
const dateYmd = (v: unknown) => { const s = str(v, 10, 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s + "T00:00:00Z"))) throw bad(); return s; };
const isoDate = (v: unknown) => { const t = Date.parse(str(v, 10, 40)); if (Number.isNaN(t)) throw bad(); return new Date(t).toISOString(); };
const trackingCode = (v: unknown) => { const s = str(v, 20, 20); if (!/^[0-9a-f]{20}$/.test(s)) throw bad(); return s; };

// ---- accès Supabase ----
const svcHeaders = (): Record<string, string> => { if (!KEY || !SB_URL) throw new ApiError("not_configured", 503); const h: Record<string, string> = { apikey: KEY, "Content-Type": "application/json" }; if (!KEY.startsWith("sb_secret_")) h.Authorization = "Bearer " + KEY; return h; };
async function call(path: string, init: RequestInit) {
  let r: Response; try { r = await fetch(SB_URL + path, { ...init, signal: AbortSignal.timeout(15000) }); } catch { throw new ApiError("paiement_indisponible", 502); }
  const t = await r.text(); let d: any = null; try { d = JSON.parse(t); } catch { /* vide */ }
  if (!r.ok) throw toErr({ message: d && d.message }); return d;
}
const rpc = (fn: string, args: unknown) => call(`/rest/v1/rpc/${fn}`, { method: "POST", headers: svcHeaders(), body: JSON.stringify(args) });
const rest = (p: string) => call(`/rest/v1/${p}`, { method: "GET", headers: svcHeaders() });
const rpcUser = (req: Request, fn: string, args: unknown) => call(`/rest/v1/rpc/${fn}`, { method: "POST", headers: { apikey: ANON || KEY, Authorization: req.headers.get("authorization") || "", "Content-Type": "application/json" }, body: JSON.stringify(args) });
async function optionalUserId(req: Request): Promise<string | null> {
  const a = req.headers.get("authorization") || ""; if (!a.startsWith("Bearer ")) return null;
  if (a === "Bearer " + ANON || (ANON && a.slice(7) === ANON)) return null; // clé publique seule : visiteur sans compte
  let r: Response; try { r = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: ANON || KEY, Authorization: a }, signal: AbortSignal.timeout(10000) }); } catch { throw new ApiError("paiement_indisponible", 502); }
  if (!r.ok) { const p = a.slice(7).split(".")[1]; try { if (JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/"))).role === "anon") return null; } catch { /* jeton illisible */ } throw new ApiError("non_connecte", 401); }
  const u: any = await r.json().catch(() => null); if (!u || typeof u.id !== "string") throw new ApiError("non_connecte", 401); return u.id;
}
// ---- limitation (clé = empreinte de l'adresse réseau) ----
const hashOf = (s: string) => createHash("sha256").update(SALT + "|" + s).digest("hex").slice(0, 24);
const clientKey = (req: Request) => hashOf((req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "inconnu").split(",")[0].trim());
async function limit(name: string, key: string, max: number, windowS: number) {
  const ok = await rpc("resto_rate_hit", { p_key: `${name}:${key}`.slice(0, 100), p_limit: max, p_window_s: windowS });
  if (ok !== true) throw new ApiError("trop_de_requetes", 429);
}
async function readJson(req: Request, max = 20_000): Promise<Record<string, unknown>> {
  const t = await req.text(); if (t.length > max) throw new ApiError("donnees_invalides", 413);
  let v: unknown; try { v = JSON.parse(t); } catch { throw bad(); } if (!v || typeof v !== "object" || Array.isArray(v)) throw bad(); return v as Record<string, unknown>;
}
const whatsappLink = (w: string | null | undefined, code: string, origin: string, total?: number) => {
  const d = String(w || "").replace(/[^0-9]/g, ""); if (d.length < 8) return null; const full = d.length === 8 ? "228" + d : d;
  return `https://wa.me/${full}?text=${encodeURIComponent(`Bonjour, j'ai passé une commande${total ? " de " + total + " FCFA" : ""}. Suivi : ${origin}/suivi/${code}`)}`;
};
const originOf = (req: Request, b?: Record<string, unknown>) => { const o = (b && typeof b.origin === "string" ? b.origin : req.headers.get("origin") || "").replace(/\/$/, ""); try { const u = new URL(o); return u.protocol === "https:" ? u.origin : ""; } catch { return ""; } };

// ---- commandes ----
async function createOrder(req: Request) {
  await limit("orders", clientKey(req), 20, 600);
  const b = await readJson(req); const customer = await optionalUserId(req);
  const items = b.items; if (!Array.isArray(items) || items.length < 1 || items.length > 50) throw new ApiError("panier_invalide", 400);
  const clean = items.map((it: any) => {
    if (!it || typeof it !== "object") throw new ApiError("panier_invalide", 400);
    const options = it.options == null ? {} : it.options;
    if (typeof options !== "object" || Array.isArray(options) || JSON.stringify(options).length > 500) throw new ApiError("panier_invalide", 400);
    return { menu_item_id: uuid(it.menu_item_id), quantite: int(it.quantite, 1, 50), options };
  });
  const r: any = await rpc("resto_create_order_srv", { p_customer: customer, p_restaurant: uuid(b.restaurant_id), p_mode: oneOf(b.mode, ["sur_place", "emporter", "livraison"] as const), p_table: optUuid(b.table_id), p_items: clean,
    p_method: oneOf(b.payment_method, ["mobile_money", "especes"] as const), p_name: str(b.name, 2, 120), p_phone: phone(b.phone), p_address: optStr(b.address, 300), p_lat: optNum(b.lat, -90, 90), p_lng: optNum(b.lng, -180, 180),
    p_landmark: optStr(b.landmark, 200), p_note: optStr(b.note, 500), p_zone: optUuid(b.zone_id) });
  const o = originOf(req, b);
  return json({ order_id: r.order_id, payment_id: r.payment_id, total: r.total, delivery_fee: r.delivery_fee, tracking_code: r.tracking_code, tracking_url: o ? `${o}/suivi/${r.tracking_code}` : null }, 201);
}
async function orderState(orderId: string | null, code: string | null, customerId: string | null, origin: string) {
  const v: any = await rpc("resto_order_view", { p_order: orderId, p_code: code, p_customer: customerId });
  const canRetry = v.payment_method === "mobile_money" && v.status !== "annulee" && (v.payment_status === "echoue" || v.payment_status === "en_attente");
  return { ...v, can_retry: canRetry, whatsapp_link: code && origin ? whatsappLink(v.restaurant && v.restaurant.whatsapp, code, origin, v.total) : null };
}
async function viewOrder(req: Request, url: URL) {
  await limit("orders_view", clientKey(req), 120, 600);
  const code = url.searchParams.get("code"); const id = url.searchParams.get("id"); const o = originOf(req);
  if (code) return json(await orderState(null, trackingCode(code), null, o));
  if (id && isUuid(id)) { const c = await optionalUserId(req); if (!c) throw new ApiError("non_connecte", 401); return json(await orderState(id.toLowerCase(), null, c, o)); }
  throw bad();
}
async function cancelOrder(req: Request) {
  await limit("orders_cancel", clientKey(req), 20, 600); const b = await readJson(req);
  if (b.code) return json(await rpc("resto_order_cancel", { p_order: null, p_code: trackingCode(b.code), p_customer: null }));
  if (isUuid(b.order_id)) { const c = await optionalUserId(req); if (!c) throw new ApiError("non_connecte", 401); return json(await rpc("resto_order_cancel", { p_order: String(b.order_id).toLowerCase(), p_code: null, p_customer: c })); }
  throw bad();
}
// ---- paiement : le montant est calculé par la base puis par app-pay, jamais reçu ----
async function initPayment(req: Request) {
  await limit("pay_init", clientKey(req), 10, 600);
  const b = await readJson(req); const paymentId = uuid(b.payment_id); const user = await optionalUserId(req); const code = b.code ? trackingCode(b.code) : null;
  if (!user && !code) throw new ApiError("non_connecte", 401);
  const origin = originOf(req, b); if (!origin) throw new ApiError("return_url_invalide", 400);
  const rows = (await rest(`resto_payments?id=eq.${paymentId}&select=order_id,resto_orders(tracking_code)`)) as any[];
  const tc = rows && rows[0] && rows[0].resto_orders && rows[0].resto_orders.tracking_code; if (!tc) throw new ApiError("paiement_introuvable", 404);
  let r: Response;
  try { r = await fetch(SB_URL + "/functions/v1/app-pay", { method: "POST", headers: { apikey: ANON || KEY, "Content-Type": "application/json", Authorization: user ? (req.headers.get("authorization") as string) : "Bearer " + (ANON || KEY) },
    signal: AbortSignal.timeout(25000), body: JSON.stringify({ app: "resto", purpose: "ORDER", target: "o:" + paymentId, return_url: `${origin}/suivi/${tc}?paiement=retour`, guest_code: user ? null : code }) }); }
  catch { throw new ApiError("paiement_indisponible", 502); }
  const d: any = await r.json().catch(() => ({}));
  if (!r.ok || !d.url) throw toErr({ message: typeof d.error === "string" && d.error in TABLE ? d.error : "paiement_indisponible" });
  return json({ url: String(d.url), amount: Number(d.amount) });
}
async function paymentStatus(req: Request, url: URL) {
  await limit("pay_status", clientKey(req), 120, 600);
  const code = url.searchParams.get("code"); const id = url.searchParams.get("order_id");
  let s: any;
  if (code) s = await orderState(null, trackingCode(code), null, "");
  else if (id && isUuid(id)) { const c = await optionalUserId(req); if (!c) throw new ApiError("non_connecte", 401); s = await orderState(id.toLowerCase(), null, c, ""); }
  else throw bad();
  return json({ order_status: s.status, payment_status: s.payment_status, payment_id: s.payment_id, total: s.total, can_retry: s.can_retry });
}
// ---- réservations ----
async function createReservation(req: Request) {
  await limit("resa", clientKey(req), 15, 600);
  const b = await readJson(req); const ph = phone(b.phone); await limit("resa_tel", hashOf(ph), 5, 3600);
  const args = { p_restaurant: uuid(b.restaurant_id), p_name: str(b.name, 2, 120), p_phone: ph, p_party: int(b.people, 1, 50), p_start: isoDate(b.start), p_note: optStr(b.note, 300), p_source: b.source === "app" ? "app" : "site" };
  const user = await optionalUserId(req);
  return json(user ? await rpcUser(req, "resto_create_reservation", args) : await rpc("resto_create_reservation", args), 201);
}
// ---- assistant vocal ----
function verifySignature(raw: string, header: string | null): boolean {
  if (!VOICE_SECRET || !header) return false;
  const exp = createHmac("sha256", VOICE_SECRET).update(raw).digest("hex"); const got = header.replace(/^sha256=/, "");
  return got.length === exp.length && timingSafeEqual(new TextEncoder().encode(got), new TextEncoder().encode(exp));
}
// À ADAPTER avec la documentation du fournisseur vocal : signature ci-dessus et format ci-dessous.
function parseProviderPayload(b: Record<string, unknown>) {
  const type = b.type === "booking" ? "booking" : "availability";
  const time = b.time == null || b.time === "" ? null : str(b.time, 5, 5);
  if (time !== null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw bad();
  const r = { type, restaurant: str(b.restaurant, 3, 80), date: dateYmd(b.date), time, people: int(b.people, 1, 50), name: b.name == null ? null : str(b.name, 2, 120), phone: b.phone == null ? null : phone(b.phone), note: optStr(b.note, 300) };
  if (type === "booking" && (!r.time || !r.name || !r.phone)) throw bad(); return r;
}
const addDays = (d: string, n: number) => new Date(Date.parse(d + "T00:00:00Z") + n * 86400000).toISOString().slice(0, 10);
const hhmm = (iso: string) => String(iso).slice(11, 16); // Lomé = UTC+0 toute l'année
const slotsOf = async (rid: string, date: string, people: number) => ((await rpc("get_availability", { p_restaurant: rid, p_date: date, p_people: people })) as any[]) || [];
function nearest(free: any[], time: string | null) {
  if (!time) return free.slice(0, 3); const m = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)); const t0 = m(time);
  return [...free].sort((a, b) => Math.abs(m(hhmm(a.slot)) - t0) - Math.abs(m(hhmm(b.slot)) - t0)).slice(0, 3).sort((a, b) => String(a.slot).localeCompare(String(b.slot)));
}
async function alternatives(rid: string, r: any, why: string, sameDay?: any[]) {
  const alts: { iso: string; time: string }[] = sameDay && sameDay.length ? nearest(sameDay, r.time).map((s: any) => ({ iso: s.slot, time: hhmm(s.slot) })) : [];
  if (alts.length === 0) for (let i = 1; i <= 3 && alts.length < 3; i++) { const f = (await slotsOf(rid, addDays(r.date, i), r.people)).filter((s) => s.available); if (f.length) alts.push({ iso: f[0].slot, time: hhmm(f[0].slot) }); }
  if (alts.length === 0) return { ok: true, status: "no_slot", slots: [], message: why + " Je n'ai pas d'autre créneau dans les prochains jours." };
  return { ok: true, status: "no_slot", slots: alts, message: why + " Je peux proposer : " + alts.map((s) => (s.iso.slice(0, 10) === r.date ? "" : s.iso.slice(0, 10) + " ") + s.time).join(", ") + "." };
}
async function handleVoice(r: any) {
  const rid = isUuid(r.restaurant) ? r.restaurant.toLowerCase() : (((await rest(`resto_restaurants?slug=eq.${encodeURIComponent(r.restaurant)}&status=eq.actif&select=id`)) as any[])[0] || {}).id;
  if (!rid) throw new ApiError("restaurant_indisponible", 404);
  const free = (await slotsOf(rid, r.date, r.people)).filter((s) => s.available); const wanted = r.time ? free.find((s) => hhmm(s.slot) === r.time) : null;
  if (r.type === "availability") {
    if (free.length === 0) return alternatives(rid, r, "Aucune table n'est libre ce jour-là.");
    const list = (wanted ? [wanted] : nearest(free, r.time)).map((s: any) => ({ iso: s.slot, time: hhmm(s.slot) }));
    return { ok: true, status: "available", slots: list, message: wanted ? `Oui, il y a de la place à ${r.time}.` : `Voici les horaires libres : ${list.map((s: any) => s.time).join(", ")}.` };
  }
  if (!wanted) return alternatives(rid, r, r.time ? `Il n'y a plus de place à ${r.time}.` : "Aucun horaire choisi.", free);
  await rpc("resto_create_reservation", { p_restaurant: rid, p_name: r.name, p_phone: r.phone, p_party: r.people, p_start: wanted.slot, p_note: r.note, p_source: "assistant_vocal" });
  await rpc("resto_voice_charge", { p_restaurant: rid, p_ref: "voice:" + new Date().toISOString().slice(0, 13) }).catch(() => undefined);
  return { ok: true, status: "booked", slots: [{ iso: wanted.slot, time: r.time }], message: `C'est réservé pour ${r.people} personne(s) à ${r.time}.` };
}
async function voice(req: Request) {
  await limit("voice", clientKey(req), 120, 60);
  const raw = await req.text(); if (raw.length > 10_000) throw bad();
  if (!VOICE_SECRET) throw new ApiError("not_configured", 503);
  if (!verifySignature(raw, req.headers.get("x-signature"))) throw new ApiError("non_autorise", 401);
  let b: any; try { b = JSON.parse(raw); } catch { throw bad(); } if (!b || typeof b !== "object" || Array.isArray(b)) throw bad();
  return json(await handleVoice(parseProviderPayload(b)));
}

export async function handle(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  const url = new URL(req.url); const path = url.pathname.replace(/\/+$/, "").replace(/^.*\/resto-api/, "") || "/";
  const m = req.method;
  if (m === "GET" && path === "/health") return json({ ok: true });
  if (m === "POST" && path === "/orders") return guarded("orders.create", () => createOrder(req));
  if (m === "GET" && path === "/orders") return guarded("orders.view", () => viewOrder(req, url));
  if (m === "POST" && path === "/orders/cancel") return guarded("orders.cancel", () => cancelOrder(req));
  if (m === "POST" && path === "/payments/init") return guarded("payments.init", () => initPayment(req));
  if (m === "GET" && path === "/payments/status") return guarded("payments.status", () => paymentStatus(req, url));
  if (m === "POST" && path === "/reservations") return guarded("reservations.create", () => createReservation(req));
  if (m === "POST" && path === "/voice") return guarded("voice", () => voice(req));
  return json({ error: "not_found" }, 404);
}
Deno.serve(handle);
