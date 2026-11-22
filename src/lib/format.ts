import type { OpeningHour } from "./types";

export function formatFcfa(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} FCFA`;
}

function toMinutes(t: string | null): number | null {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/** true / false, ou null si le restaurant n'a pas renseigné ses horaires. */
export function isOpenNow(hours: OpeningHour[] | undefined, now: Date = new Date()): boolean | null {
  if (!hours || hours.length === 0) return null;
  const today = hours.filter((h) => h.weekday === now.getDay());
  if (today.length === 0) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  return today.some((h) => {
    if (h.closed) return false;
    const o = toMinutes(h.opens);
    const c = toMinutes(h.closes);
    if (o === null || c === null) return false;
    return c > o ? current >= o && current < c : current >= o || current < c; // passe minuit
  });
}

/** Couleur de texte lisible (noir ou blanc) sur une couleur de fond hexadécimale. */
export function readableText(hex: string | null | undefined): string {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return "#ffffff";
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum > 0.4 ? "#14201A" : "#ffffff";
}

export function directionsUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/directions?to=${lat}%2C${lng}`;
}
