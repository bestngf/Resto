"use client";
// Carte Leaflet + OpenStreetMap (gratuit). À charger avec next/dynamic { ssr: false }.
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LOME: [number, number] = [6.1725, 1.2314];

export default function LocationPicker({ lat, lng, onChange, height = 260 }: {
  lat: number | null; lng: number | null; onChange: (lat: number, lng: number) => void; height?: number;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    if (!el.current || map.current) return;
    const start: [number, number] = lat != null && lng != null ? [lat, lng] : LOME;
    const m = L.map(el.current).setView(start, lat != null ? 16 : 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(m);
    const icon = L.divIcon({ html: '<div class="resto-pin">📍</div>', className: "", iconSize: [30, 30], iconAnchor: [15, 30] });
    const put = (la: number, ln: number) => {
      if (!marker.current) {
        marker.current = L.marker([la, ln], { icon, draggable: true }).addTo(m);
        marker.current.on("dragend", () => { const p = marker.current!.getLatLng(); cb.current(p.lat, p.lng); });
      } else marker.current.setLatLng([la, ln]);
    };
    if (lat != null && lng != null) put(lat, lng);
    m.on("click", (e: L.LeafletMouseEvent) => { put(e.latlng.lat, e.latlng.lng); cb.current(e.latlng.lat, e.latlng.lng); });
    map.current = m;
    return () => { m.remove(); map.current = null; marker.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Position changée de l'extérieur (bouton « Ma position »)
  useEffect(() => {
    if (!map.current || lat == null || lng == null) return;
    if (!marker.current) {
      const icon = L.divIcon({ html: '<div class="resto-pin">📍</div>', className: "", iconSize: [30, 30], iconAnchor: [15, 30] });
      marker.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map.current);
      marker.current.on("dragend", () => { const p = marker.current!.getLatLng(); cb.current(p.lat, p.lng); });
    } else marker.current.setLatLng([lat, lng]);
    map.current.setView([lat, lng], Math.max(map.current.getZoom(), 16));
  }, [lat, lng]);

  return <div ref={el} style={{ height }} className="z-0 w-full overflow-hidden rounded-2xl border border-stone-300" role="application" aria-label="Carte : touchez pour placer votre restaurant" />;
}
