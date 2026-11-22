// Distance à vol d'oiseau et liens d'itinéraire gratuits (l'application de cartes du téléphone guide pas à pas).
export type Pt = { lat: number; lng: number };
export function distanceKm(a: Pt, b: Pt): number {
  const R = 6371, rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export const prettyKm = (km: number) => (km < 1 ? `${Math.max(50, Math.round(km * 10) * 100)} m` : `${km.toFixed(1).replace(".", ",")} km`);
/** Itinéraire en voiture/moto vers un point (GPS) ou, à défaut, une adresse écrite. */
export function routeLink(dest: { lat: number | null; lng: number | null; text?: string | null }): string | null {
  if (dest.lat != null && dest.lng != null) return `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=driving`;
  const t = (dest.text ?? "").trim(); return t ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(t + ", Lomé, Togo")}&travelmode=driving` : null;
}
