"use client";
import { useEffect, useState } from "react";
import { btnDanger, btnGhost, btnPrimary } from "@/components/dashboard/ui";
import { describeOptions, fcfa, hhmm, minutesSince } from "@/lib/dashboard/format";
import type { Order, OrderStatus, Role } from "@/lib/dashboard/types";

/** Horloge partagée : met à jour les compteurs d'attente toutes les 30 s. */
export function useNow(ms = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}

const NEXT: Record<string, { to: (o: Order) => OrderStatus; label: (o: Order) => string; roles: Role[] } | undefined> = {
  recue: { to: () => "en_preparation", label: () => "✅ Accepter", roles: ["patron", "gerant", "cuisinier", "serveur"] },
  en_preparation: { to: () => "prete", label: () => "🍽️ C'est prêt", roles: ["patron", "gerant", "cuisinier"] },
  prete: {
    to: (o) => (o.mode === "livraison" ? "en_route" : "servie"),
    label: (o) => (o.mode === "livraison" ? "🛵 Part en livraison" : o.mode === "emporter" ? "🛍️ Remise au client" : "✅ Servie"),
    roles: ["patron", "gerant", "serveur", "caissier"],
  },
  en_route: { to: () => "livree", label: () => "📦 Livrée", roles: ["patron", "gerant", "serveur", "caissier"] },
};
export const STATUS_TITLE: Record<string, string> = {
  recue: "Reçues", en_preparation: "En préparation", prete: "Prêtes", en_route: "En route",
  servie: "Servies", livree: "Livrées", annulee: "Annulées",
};
const MODE: Record<string, string> = { sur_place: "🍽️ Sur place", emporter: "🛍️ À emporter", livraison: "🛵 Livraison" };

export function OrderCard(props: {
  order: Order; role: Role | null; now: number;
  onNext: (o: Order, to: OrderStatus) => void;
  onCancel: (o: Order) => void;
  onCash: (o: Order) => void;
  onWhatsApp: (o: Order, kind: "prete" | "retard") => void;
}) {
  const { order: o, role, now } = props;
  const wait = minutesSince(o.created_at, now);
  const active = ["recue", "en_preparation", "prete", "en_route"].includes(o.status);
  const next = NEXT[o.status];
  const canNext = next && role && next.roles.includes(role);
  const canCancel = active && o.status !== "en_route" && role && ["patron", "gerant", "caissier"].includes(role);
  const canCash = o.payment_method === "especes" && o.payment_status === "en_attente" && o.status !== "annulee" && role && ["patron", "gerant", "caissier"].includes(role);
  const late = active && wait >= 20;
  const warn = active && wait >= 10;
  const where = o.mode === "sur_place" ? (o.resto_tables?.label ? `Table ${o.resto_tables.label}` : "Sur place") : MODE[o.mode];
  const pay = o.payment_status === "paye" ? ["Payé", "bg-emerald-100 text-emerald-900"]
    : o.payment_method === "especes" ? ["Espèces à encaisser", "bg-amber-100 text-amber-900"]
    : o.payment_status === "echoue" ? ["Paiement échoué", "bg-red-100 text-red-900"]
    : o.payment_status === "annule" ? ["Paiement annulé", "bg-stone-200 text-stone-800"]
    : ["Mobile money en attente", "bg-amber-100 text-amber-900"];
  const mapUrl = o.delivery_lat != null && o.delivery_lng != null
    ? `https://www.openstreetmap.org/?mlat=${o.delivery_lat}&mlon=${o.delivery_lng}#map=18/${o.delivery_lat}/${o.delivery_lng}` : null;

  return (
    <article className={`fade-in rounded-2xl border-2 bg-white p-4 shadow-sm ${o.status === "recue" ? "border-red-500 ring-pulse" : late ? "border-red-400" : warn ? "border-amber-400" : "border-stone-200"}`}>
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-extrabold">{where} <span className="font-mono text-sm font-semibold text-stone-600">#{o.id.slice(-4).toUpperCase()}</span></p>
          <p className="text-xs text-stone-600">Reçue à {hhmm(o.created_at)}</p>
        </div>
        {active && (
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${late ? "bg-red-100 text-red-900" : warn ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-800"}`}>
            ⏱ {wait} min
          </span>
        )}
      </header>

      <ul className="mt-3 space-y-1.5">
        {o.resto_order_items.map((i) => (
          <li key={i.id} className="text-base">
            <span className="font-bold">{i.quantity} ×</span> {i.name_snapshot}
            {describeOptions(i.options).length > 0 && <span className="block pl-6 text-sm text-stone-600">{describeOptions(i.options).join(" · ")}</span>}
          </li>
        ))}
      </ul>
      {o.note && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-950">📝 {o.note}</p>}
      {o.mode === "livraison" && (
        <p className="mt-2 text-sm text-stone-800">
          📍 {[o.delivery_address, o.delivery_landmark].filter(Boolean).join(" — ") || "Position GPS envoyée"}
          {mapUrl && <> · <a className="font-semibold underline" href={mapUrl} target="_blank" rel="noopener noreferrer">Voir sur la carte</a></>}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-lg font-bold">{fcfa(o.total)}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${pay[1]}`}>{pay[0]}</span>
        {!active && <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold">{STATUS_TITLE[o.status]}</span>}
      </div>

      {(canNext || canCancel || canCash || o.status === "prete" || late) && (
        <div className="mt-3 grid gap-2">
          {canNext && <button className={`${btnPrimary} min-h-14 text-base`} onClick={() => props.onNext(o, next!.to(o))}>{next!.label(o)}</button>}
          <div className="flex flex-wrap gap-2">
            {canCash && <button className={btnGhost} onClick={() => props.onCash(o)}>💵 Espèces encaissées</button>}
            {(o.status === "prete" || late) && o.status !== "recue" && (
              <button className={btnGhost} onClick={() => props.onWhatsApp(o, o.status === "prete" ? "prete" : "retard")}>
                💬 {o.status === "prete" ? "Prévenir le client" : "Prévenir du retard"}
              </button>
            )}
            {canCancel && <button className={`${btnDanger} ml-auto`} onClick={() => props.onCancel(o)}>Annuler</button>}
          </div>
        </div>
      )}
    </article>
  );
}
