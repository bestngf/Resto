"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createOrderApi, startPayment } from "@/lib/resto-api";
import { MOBILE_MONEY_ENABLED } from "@/config/app";
import { loadTable, saveLastOrder, useSiteCart } from "@/lib/site/cart";
import { humanError } from "@/lib/site/errors";
import { fcfa, parseLocation, validPhone } from "@/lib/site/safe";
import type { OrderMode, SiteZone } from "@/lib/site/types";

type R = { id: string; slug: string; name: string; currency: string; dineIn: boolean; takeaway: boolean; delivery: boolean };

export default function CheckoutClient({ restaurant: r, zones }: { restaurant: R; zones: SiteZone[] }) {
  const router = useRouter();
  const cart = useSiteCart(r.slug);
  const [table, setTable] = useState<{ id: string; label: string } | null>(null);
  const [mode, setMode] = useState<OrderMode | null>(null);
  const [zoneId, setZoneId] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pasted, setPasted] = useState("");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [phone, setPhone] = useState("");
  const [who, setWho] = useState("");
  const [method, setMethod] = useState<"especes" | "mobile_money">("especes");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { const t = loadTable(r.slug); setTable(t); }, [r.slug]);
  useEffect(() => { if (!mode) setMode(table && r.dineIn ? "sur_place" : r.takeaway ? "emporter" : r.delivery ? "livraison" : r.dineIn ? "sur_place" : null); }, [table, mode, r]);

  if (!cart.lines.length) return (
    <div className="rounded-2xl bg-[var(--brand-soft)] p-6 text-center">
      <p className="text-lg font-semibold">Ton panier est vide</p>
      <p className="mt-1 text-sm text-neutral-700">Choisis quelques plats dans le menu.</p>
      <Link href={`/r/${r.slug}/menu`} className="mt-4 inline-flex min-h-12 items-center rounded-2xl bg-[var(--brand)] px-6 font-semibold text-[var(--on-brand)]">Voir le menu</Link>
    </div>
  );

  const zone = zones.find((z) => z.id === zoneId);
  const fee = mode === "livraison" ? zone?.fee_fcfa ?? 0 : 0;
  const needPhone = true; // le restaurant a besoin de joindre le client (sur place compris, ex. paiement ou changement)
  const chips: { m: OrderMode; label: string; ok: boolean }[] = [
    { m: "sur_place", label: "Sur place", ok: r.dineIn }, { m: "emporter", label: "À emporter", ok: r.takeaway }, { m: "livraison", label: "Livraison", ok: r.delivery },
  ];

  function locate() {
    setErr("");
    navigator.geolocation?.getCurrentPosition(
      (p) => setGps({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setErr("Position impossible à lire. Écris un repère à la place (ex. « en face de la pharmacie »)."),
      { timeout: 8000 },
    );
  }
  function usePasted(v: string) { setPasted(v); const p = parseLocation(v); if (p) setGps(p); }

  async function submit() {
    setErr("");
    if (!mode) return setErr("Choisis comment tu veux être servi.");
    if (mode === "sur_place" && !table) return setErr("Scanne le QR code de ta table pour commander sur place.");
    if (who.trim().length < 2) return setErr("Indique ton nom.");
    if (needPhone && !validPhone(phone)) return setErr("Indique un numéro de téléphone pour que le restaurant puisse te joindre.");
    if (mode === "livraison") {
      if (!zone) return setErr("Choisis ta zone de livraison.");
      if (cart.total < zone.min_order_fcfa) return setErr(`Commande minimum pour cette zone : ${fcfa(zone.min_order_fcfa, r.currency)}.`);
      if (!landmark.trim() && !gps) return setErr("Ajoute un repère écrit ou ta position pour le livreur.");
    }
    setBusy(true);
    try {
      const res = await createOrderApi({ restaurantId: r.id, mode, method, name: who, phone, tableId: mode === "sur_place" ? table!.id : null, zoneId: mode === "livraison" ? zone!.id : null,
        landmark: mode === "livraison" ? landmark : undefined, lat: gps?.lat, lng: gps?.lng, note, items: cart.lines.map((l) => ({ menuItemId: l.id, qty: l.qty })) });
      saveLastOrder({ id: res.order_id, mode, lines: cart.lines, total: res.total, fee: res.delivery_fee, landmark: landmark.trim() || undefined, at: new Date().toISOString() });
      cart.clear();
      if (method === "mobile_money") {
        try { const pay = await startPayment(res.payment_id, res.tracking_code); window.location.href = pay.url; return; }
        catch { /* la page de suivi propose de reprendre le paiement */ }
      }
      router.push(`/suivi/${res.tracking_code}`);
    } catch (e) { setBusy(false); setErr(humanError(e)); }
  }

  const field = "min-h-12 w-full rounded-xl border border-neutral-300 px-3 text-base";
  return (
    <div className="space-y-6">
      <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200">
        {cart.lines.map((l) => (
          <li key={l.id} className="flex items-center justify-between gap-2 p-3">
            <span className="min-w-0"><span className="block truncate font-medium">{l.name}</span><span className="text-sm text-neutral-600">{fcfa(l.price * l.qty, r.currency)}</span></span>
            <span className="flex items-center gap-2">
              <button type="button" aria-label={`Retirer un ${l.name}`} onClick={() => cart.setQty(l.id, l.qty - 1)} className="h-11 w-11 rounded-xl border border-neutral-300 text-lg">−</button>
              <span className="w-6 text-center font-semibold">{l.qty}</span>
              <button type="button" aria-label={`Ajouter un ${l.name}`} onClick={() => cart.setQty(l.id, l.qty + 1)} className="h-11 w-11 rounded-xl bg-[var(--brand)] text-lg text-[var(--on-brand)]">+</button>
            </span>
          </li>
        ))}
      </ul>

      <fieldset>
        <legend className="mb-2 font-semibold">Comment veux-tu être servi ?</legend>
        <div className="grid grid-cols-3 gap-2">
          {chips.filter((c) => c.ok).map((c) => (
            <button key={c.m} type="button" aria-pressed={mode === c.m} onClick={() => setMode(c.m)} className={`min-h-12 rounded-xl border-2 text-sm font-semibold ${mode === c.m ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)]" : "border-neutral-300"}`}>{c.label}</button>
          ))}
        </div>
        {mode === "sur_place" && <p className="mt-2 text-sm text-neutral-700">{table ? `Ta table : ${table.label}` : "Scanne le QR code posé sur ta table pour commander sur place."}</p>}
      </fieldset>

      <label className="block"><span className="mb-1 block font-semibold">Ton nom</span>
        <input className={field} autoComplete="name" placeholder="Ama" value={who} onChange={(e) => setWho(e.target.value)} maxLength={120} /></label>

      {needPhone && (
        <label className="block"><span className="mb-1 block font-semibold">Ton numéro de téléphone</span>
          <input className={field} inputMode="tel" autoComplete="tel" placeholder="90 00 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
      )}

      {mode === "livraison" && (
        <div className="space-y-3">
          <label className="block"><span className="mb-1 block font-semibold">Zone de livraison</span>
            <select className={field} value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
              <option value="">Choisir…</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name} · {fcfa(z.fee_fcfa, r.currency)}</option>)}
            </select></label>
          {!zones.length && <p className="text-sm text-neutral-700">Ce restaurant n&apos;a pas encore configuré de zone. Choisis « à emporter » ou écris-lui sur WhatsApp.</p>}
          <label className="block"><span className="mb-1 block font-semibold">Repère pour le livreur</span>
            <input className={field} placeholder="En face de la pharmacie, portail bleu…" value={landmark} onChange={(e) => setLandmark(e.target.value)} maxLength={200} /></label>
          <button type="button" onClick={locate} className="min-h-12 w-full rounded-xl border-2 border-[var(--brand)] font-semibold text-[var(--brand-text)]">{gps ? "Position enregistrée ✓" : "Utiliser ma position"}</button>
          <label className="block"><span className="mb-1 block text-sm text-neutral-700">Ou colle ici une position reçue sur WhatsApp / Google Maps</span>
            <input className={field} value={pasted} onChange={(e) => usePasted(e.target.value)} placeholder="6.1725, 1.2314" /></label>
        </div>
      )}

      <label className="block"><span className="mb-1 block font-semibold">Un message pour la cuisine ? (facultatif)</span>
        <textarea className={`${field} py-2`} rows={2} maxLength={200} placeholder="Peu de piment, sans oignon…" value={note} onChange={(e) => setNote(e.target.value)} /></label>

      <div className="space-y-2">
        <p className="font-semibold">Paiement</p>
        <button type="button" aria-pressed={method === "especes"} onClick={() => setMethod("especes")} className={`block min-h-12 w-full rounded-xl border-2 p-3 text-left ${method === "especes" ? "border-[var(--brand)]" : "border-neutral-300"}`}>💵 Espèces (au restaurant ou à la livraison)</button>
        {MOBILE_MONEY_ENABLED && <button type="button" aria-pressed={method === "mobile_money"} onClick={() => setMethod("mobile_money")} className={`block min-h-12 w-full rounded-xl border-2 p-3 text-left ${method === "mobile_money" ? "border-[var(--brand)]" : "border-neutral-300"}`}>📱 Mobile money (Moov, Yas…)</button>}
      </div>

      <div className="rounded-2xl bg-[var(--brand-soft)] p-4">
        <p className="flex justify-between"><span>Sous-total</span><span>{fcfa(cart.total, r.currency)}</span></p>
        {mode === "livraison" && <p className="flex justify-between"><span>Livraison</span><span>{zone ? fcfa(fee, r.currency) : "—"}</span></p>}
        <p className="mt-1 flex justify-between text-lg font-bold"><span>Total</span><span>{fcfa(cart.total + fee, r.currency)}</span></p>
        <p className="mt-1 text-xs text-neutral-600">Le total final est recalculé par le restaurant à l&apos;envoi.</p>
      </div>

      {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{err}</p>}
      <button type="button" disabled={busy} onClick={submit} className="min-h-14 w-full rounded-2xl bg-[var(--brand)] text-lg font-bold text-[var(--on-brand)] disabled:opacity-60">{busy ? "Envoi en cours…" : method === "mobile_money" ? "Commander et payer" : "Envoyer ma commande"}</button>
    </div>
  );
}
