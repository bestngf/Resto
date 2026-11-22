"use client";
import { useMemo, useState } from "react";
import type { Restaurant } from "@/lib/types";
import { isOpenNow } from "@/lib/format";
import RestaurantCard from "./RestaurantCard";

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function RestaurantList({ restaurants }: { restaurants: Restaurant[] }) {
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [openOnly, setOpenOnly] = useState(false);

  const cuisines = useMemo(() => Array.from(new Set(restaurants.map((r) => r.cuisine).filter(Boolean) as string[])).sort(), [restaurants]);

  const shown = useMemo(() => {
    const needle = norm(q.trim());
    return restaurants.filter((r) => {
      if (cuisine && r.cuisine !== cuisine) return false;
      if (openOnly && isOpenNow(r.resto_opening_hours) !== true) return false;
      if (!needle) return true;
      // La recherche couvre le nom, la cuisine, l'adresse (quartier) et le repère.
      return norm([r.name, r.cuisine, r.address, r.landmark].filter(Boolean).join(" ")).includes(needle);
    });
  }, [restaurants, q, cuisine, openOnly]);

  const chip = (on: boolean) => `min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium ${on ? "border-[var(--r-brand)] bg-[var(--r-brand)] text-[var(--r-brand-ink)]" : "border-[var(--r-line)] bg-white"}`;

  return (
    <div>
      <label className="sr-only" htmlFor="recherche">Rechercher un restaurant, un plat ou un quartier</label>
      <input id="recherche" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Restaurant, cuisine ou quartier" className="min-h-12 w-full rounded-xl border border-[var(--r-line)] bg-white px-4 text-base" />
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <button type="button" aria-pressed={openOnly} onClick={() => setOpenOnly((v) => !v)} className={chip(openOnly)}>Ouvert maintenant</button>
        {cuisines.map((c) => (
          <button key={c} type="button" aria-pressed={cuisine === c} onClick={() => setCuisine(cuisine === c ? null : c)} className={chip(cuisine === c)}>{c}</button>
        ))}
      </div>
      <p className="mt-3 text-sm text-[var(--r-muted)]" aria-live="polite">{shown.length} restaurant{shown.length > 1 ? "s" : ""}</p>
      {shown.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--r-line)] bg-white p-6 text-center">
          <p className="font-semibold">Aucun restaurant ne correspond</p>
          <p className="mt-1 text-sm text-[var(--r-muted)]">Essaie un autre mot ou enlève un filtre.</p>
          <button type="button" onClick={() => { setQ(""); setCuisine(null); setOpenOnly(false); }} className="mt-3 min-h-11 rounded-xl bg-[var(--r-brand)] px-4 text-sm font-semibold text-[var(--r-brand-ink)]">Tout afficher</button>
        </div>
      ) : (
        <ul className="mt-3 space-y-4">
          {shown.map((r) => (<li key={r.id}><RestaurantCard r={r} /></li>))}
        </ul>
      )}
    </div>
  );
}
