"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Restaurant } from "@/lib/types";
import { DEFAULT_MAP_CENTER } from "@/config/app";
import { directionsUrl } from "@/lib/format";

// Leaflet + tuiles OpenStreetMap (gratuit). Le contenu des bulles est construit en texte pur (aucun HTML injecté).
export default function RestaurantMap({ restaurants }: { restaurants: Restaurant[] }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current) return;
      map = L.map(el.current).setView(DEFAULT_MAP_CENTER, 12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© les contributeurs d'OpenStreetMap",
      }).addTo(map);

      const points: [number, number][] = [];
      for (const r of restaurants) {
        if (r.latitude == null || r.longitude == null) continue;
        const pos: [number, number] = [Number(r.latitude), Number(r.longitude)];
        points.push(pos);
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:22px;height:22px;border-radius:50%;background:${/^#[0-9a-fA-F]{6}$/.test(r.primary_color ?? "") ? r.primary_color : "#0e6b4a"};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        const box = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = r.name;
        const sub = document.createElement("div");
        sub.textContent = r.cuisine ?? "";
        const fiche = document.createElement("a");
        fiche.href = `/restaurant/${r.slug}`;
        fiche.textContent = "Voir la fiche";
        fiche.style.cssText = "display:inline-block;margin:6px 10px 0 0";
        const go = document.createElement("a");
        go.href = directionsUrl(pos[0], pos[1]);
        go.target = "_blank";
        go.rel = "noopener noreferrer";
        go.textContent = "Y aller";
        box.append(title, sub, fiche, go);
        L.marker(pos, { icon, title: r.name }).addTo(map).bindPopup(box);
      }
      if (points.length > 1) map.fitBounds(points, { padding: [32, 32], maxZoom: 15 });
      else if (points.length === 1) map.setView(points[0], 15);
    })();
    return () => { cancelled = true; map?.remove(); };
  }, [restaurants]);

  return <div ref={el} role="region" aria-label="Carte des restaurants" className="h-[55dvh] w-full rounded-2xl border border-[var(--r-line)]" />;
}
