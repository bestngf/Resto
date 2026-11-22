import { siteOrigin } from "@/config/public";
export const fcfa = (n: number, cur = "FCFA") => `${new Intl.NumberFormat("fr-FR").format(Math.round(n || 0))} ${cur}`;

const TZ = "Africa/Lome";
export const hhmm = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
export const dayLabel = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(new Date(iso));
/** Clé jour AAAA-MM-JJ (Lomé = UTC+0, sans heure d'été). */
export const dayKey = (iso: string) => new Date(iso).toISOString().slice(0, 10);
export const todayStartIso = () => `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`;
export const minutesSince = (iso: string, now = Date.now()) => Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));

/** Affiche les options d'un plat commandé quel que soit leur format. */
export function describeOptions(o: unknown): string[] {
  if (!o) return [];
  if (Array.isArray(o)) return o.flatMap((x) => describeOptions(x));
  if (typeof o === "string") return [o];
  if (typeof o === "object") {
    return Object.entries(o as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== "" && v !== false)
      .map(([k, v]) => (v === true ? k : `${k} : ${Array.isArray(v) ? v.join(", ") : String(v)}`));
  }
  return [String(o)];
}

export const toSlug = (name: string) =>
  name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30);

export const siteUrl = () => siteOrigin();

// Contraste (WCAG) pour choisir un texte lisible sur une couleur de fond.
function lum(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);
export function readableText(bg: string): "#ffffff" | "#111111" {
  if (!isHex(bg)) return "#111111";
  const L = lum(bg);
  return 1.05 / (L + 0.05) >= (L + 0.05) / 0.0722 ? "#ffffff" : "#111111";
}
export function contrastRatio(bg: string, fg: string) {
  if (!isHex(bg) || !isHex(fg)) return 1;
  const a = lum(bg), b = lum(fg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
