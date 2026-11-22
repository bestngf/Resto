import type { SiteHour } from "./types";
// Lomé est à UTC+0 toute l'année (pas d'heure d'été) : on lit l'heure en UTC.
// weekday % 7 => 0 = dimanche, que la base utilise 0-6 ou 1-7 (ISO).
export const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const toMin = (t: string | null) => { if (!t) return null; const [h, m] = t.split(":"); return parseInt(h) * 60 + parseInt(m || "0"); };
export const hhmm = (t: string | null) => (t ? t.slice(0, 5).replace(":", "h") : "");

export function openNow(hours: SiteHour[], now = new Date()): { open: boolean; label: string } | null {
  if (!hours.length) return null;
  const dow = now.getUTCDay(), cur = now.getUTCHours() * 60 + now.getUTCMinutes();
  const today = hours.filter((h) => h.weekday % 7 === dow && !h.closed);
  for (const h of today) {
    const o = toMin(h.opens), c = toMin(h.closes);
    if (o == null || c == null) continue;
    if (c > o ? cur >= o && cur < c : cur >= o || cur < c) return { open: true, label: `Ouvert jusqu'à ${hhmm(h.closes)}` };
  }
  const later = today.map((h) => toMin(h.opens)).filter((o): o is number => o != null && o > cur).sort((a, b) => a - b)[0];
  if (later != null) { const h = today.find((x) => toMin(x.opens) === later)!; return { open: false, label: `Fermé · ouvre à ${hhmm(h.opens)}` }; }
  return { open: false, label: "Fermé pour le moment" };
}
