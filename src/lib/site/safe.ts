// Tout ce qui vient du restaurateur est validé ici avant d'être utilisé (couleurs, liens, numéros).
// React échappe déjà le texte : on n'utilise JAMAIS dangerouslySetInnerHTML avec ces données.
import { siteOrigin } from "@/config/public";
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function safeHex(v: string | null | undefined, fallback: string): string {
  const s = (v ?? "").trim();
  if (!HEX.test(s)) return fallback;
  return s.length === 4 ? "#" + [...s.slice(1)].map((c) => c + c).join("") : s.toLowerCase();
}
export function safeUrl(v: string | null | undefined): string | null {
  if (!v) return null;
  try { const u = new URL(v); return u.protocol === "https:" ? u.toString() : null; } catch { return null; }
}
export const digits = (p: string | null | undefined) => (p ?? "").replace(/\D/g, "");

/** Lien WhatsApp gratuit (wa.me). Numéro togolais à 8 chiffres => indicatif 228 ajouté. */
export function waLink(phone: string | null | undefined, text?: string): string | null {
  const d = digits(phone);
  if (d.length < 8) return null;
  const full = d.length === 8 ? "228" + d : d;
  return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
export function fcfa(n: number, currency = "FCFA") {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(n))} ${currency}`;
}
export function siteBase() {
  return siteOrigin() || "http://localhost:3000";
}
/** Seul endroit à changer pour passer plus tard en sous-domaine (slug.domaine.tg). */
export function restaurantUrl(slug: string, path = "") {
  return `${siteBase()}/r/${slug}${path}`;
}
/** Itinéraire gratuit : ouvre l'app de cartes du téléphone. */
export function mapsLink(r: { latitude: number | null; longitude: number | null; address: string | null; name: string }) {
  const dest = r.latitude != null && r.longitude != null ? `${r.latitude},${r.longitude}` : encodeURIComponent(`${r.name} ${r.address ?? "Lomé"}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}
/** Extrait lat/lng d'une position WhatsApp / Google Maps collée par le client. */
export function parseLocation(text: string): { lat: number; lng: number } | null {
  const m = text.match(/(-?\d{1,2}\.\d{3,})\s*[,;]\s*(-?\d{1,3}\.\d{3,})/);
  if (!m) return null;
  const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
}
export function validPhone(p: string) { const d = digits(p); return d.length >= 8 && d.length <= 15; }
