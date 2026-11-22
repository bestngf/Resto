const inRange = (lat: number, lng: number) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

/** Extrait une latitude/longitude d'une position collée depuis WhatsApp, Google Maps ou OpenStreetMap. */
export function parseSharedLocation(text: string): { lat: number; lng: number } | null {
  const t = decodeURIComponent(text.trim());
  const patterns = [
    /[?&](?:q|ll|query|destination)=(-?\d+(?:\.\d+)?)[, ]+(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /geo:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /mlat=(-?\d+(?:\.\d+)?)&mlon=(-?\d+(?:\.\d+)?)/,
    /^\s*(-?\d+\.\d+)\s*[, ]\s*(-?\d+\.\d+)\s*$/,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (inRange(lat, lng)) return { lat, lng };
    }
  }
  return null;
}
