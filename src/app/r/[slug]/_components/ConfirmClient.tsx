"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadLastOrder, type LastOrder } from "@/lib/site/cart";
import { fcfa } from "@/lib/site/safe";

const MODES: Record<string, string> = { sur_place: "Sur place", emporter: "À emporter", livraison: "Livraison" };

export default function ConfirmClient({ slug, id, name, currency, hasWhatsApp, waBase }: { slug: string; id: string; name: string; currency: string; hasWhatsApp: boolean; waBase: string }) {
  const [o, setO] = useState<LastOrder | null | undefined>(undefined);
  useEffect(() => setO(loadLastOrder(id)), [id]);
  if (o === undefined) return <p aria-busy="true" className="r-pulse">Chargement…</p>;

  const msg = o ? [
    `Bonjour ${name} ! Voici ma commande n°${id.slice(0, 8)} :`,
    ...o.lines.map((l) => `• ${l.qty} × ${l.name}`),
    `Mode : ${MODES[o.mode] ?? o.mode}`,
    o.landmark ? `Repère : ${o.landmark}` : "",
    `Total : ${fcfa(o.total + o.fee, currency)} (espèces)`,
  ].filter(Boolean).join("\n") : "";

  return (
    <div className="text-center">
      <p className="r-pop text-6xl" aria-hidden>✅</p>
      <h1 className="mt-3 text-2xl font-bold">Commande envoyée !</h1>
      <p className="mt-1 text-neutral-700">{name} l&apos;a reçue. Garde ton téléphone près de toi.</p>
      {o ? (
        <ul className="mx-auto mt-6 max-w-sm divide-y divide-neutral-100 rounded-2xl border border-neutral-200 text-left">
          {o.lines.map((l) => <li key={l.id} className="flex justify-between p-3 text-sm"><span>{l.qty} × {l.name}</span><span>{fcfa(l.price * l.qty, currency)}</span></li>)}
          <li className="flex justify-between p-3 font-bold"><span>Total ({MODES[o.mode] ?? o.mode})</span><span>{fcfa(o.total + o.fee, currency)}</span></li>
        </ul>
      ) : <p className="mt-4 text-sm text-neutral-600">Le détail est enregistré chez le restaurant.</p>}
      <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
        {hasWhatsApp && o && <a href={`${waBase}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[var(--brand)] font-bold text-[var(--on-brand)]">Confirmer sur WhatsApp</a>}
        <Link href={`/r/${slug}/menu`} className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-neutral-300 font-semibold">Retour au menu</Link>
      </div>
    </div>
  );
}
