"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { clearCart, cartTotal, type Cart } from "@/lib/cart/cart";
import { createOrder, type Method, type Mode } from "@/lib/orders";
import { humanError } from "@/lib/errors";
import { formatFcfa } from "@/lib/format";
import { parseSharedLocation } from "@/lib/geo";
import { whatsappOrderLink } from "@/lib/whatsapp";
import { MOBILE_MONEY_ENABLED } from "@/config/app";
import { useSession } from "@/lib/useSession";
import { startPayment } from "@/lib/resto-api";

type Resto = { id: string; accepts_dine_in: boolean; accepts_takeaway: boolean; accepts_delivery: boolean; whatsapp: string | null };
type Zone = { id: string; name: string; fee_fcfa: number; min_order_fcfa: number };
export type TableInfo = { restaurant_id: string; table_id: string; label: string } | null;

const field = "min-h-12 w-full rounded-xl border border-[var(--r-line)] bg-white px-4 text-base";

export default function Checkout({ cart, table }: { cart: Cart; table: TableInfo }) {
  const router = useRouter();
  const { user } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [resto, setResto] = useState<Resto | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [mode, setMode] = useState<Mode | null>(null);
  const [method, setMethod] = useState<Method>("especes");
  const [zoneId, setZoneId] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pasted, setPasted] = useState("");
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getSupabase().from("resto_profiles").select("full_name,phone").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.full_name) setName((n) => n || data.full_name);
      if (data?.phone) setPhone((p) => p || data.phone);
    });
  }, [user]);

  const tableHere = table && table.restaurant_id === cart.restaurantId ? table : null;

  useEffect(() => {
    (async () => {
      const sb = getSupabase();
      const [r, z] = await Promise.all([
        sb.from("resto_restaurants").select("id,accepts_dine_in,accepts_takeaway,accepts_delivery,whatsapp").eq("id", cart.restaurantId).maybeSingle(),
        sb.from("resto_delivery_zones").select("id,name,fee_fcfa,min_order_fcfa").eq("restaurant_id", cart.restaurantId).eq("active", true).order("name"),
      ]);
      if (r.data) setResto(r.data as Resto);
      setZones((z.data ?? []) as Zone[]);
    })().catch(() => setError("Impossible de charger les options de commande. Vérifie ta connexion."));
  }, [cart.restaurantId]);

  const modes: { id: Mode; label: string }[] = [];
  if (resto?.accepts_dine_in && tableHere) modes.push({ id: "sur_place", label: `Sur place (table ${tableHere.label})` });
  if (resto?.accepts_takeaway) modes.push({ id: "emporter", label: "À emporter" });
  if (resto?.accepts_delivery && zones.length > 0) modes.push({ id: "livraison", label: "Livraison" });
  const current = mode && modes.some((m) => m.id === mode) ? mode : modes[0]?.id ?? null;

  const zone = zones.find((z) => z.id === zoneId);
  const fee = current === "livraison" && zone ? zone.fee_fcfa : 0;
  const subtotal = cartTotal(cart);

  function locate() {
    setGeoMsg(null);
    if (!navigator.geolocation) { setGeoMsg("Ton téléphone ne permet pas de te localiser."); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeoMsg("Position enregistrée."); },
      () => setGeoMsg("Position impossible à lire. Écris un repère à la place."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function onPaste(v: string) {
    setPasted(v);
    const p = parseSharedLocation(v);
    if (p) { setPos(p); setGeoMsg("Position WhatsApp reconnue."); }
    else if (v.trim()) setGeoMsg("Je ne reconnais pas cette position. Colle le lien reçu sur WhatsApp.");
  }

  async function submit() {
    if (!current) return;
    setError(null);
    if (current === "livraison" && !zone) { setError("Choisis ta zone de livraison."); return; }
    if (current === "livraison" && !address.trim() && !landmark.trim() && !pos) { setError("Indique un repère, une adresse ou ta position."); return; }
    if (name.trim().length < 2) { setError("Indique ton nom."); return; }
    if (phone.replace(/\D/g, "").length < 8) { setError("Indique un numéro de téléphone pour que le restaurant puisse te joindre."); return; }
    setBusy(true);
    try {
      const res = await createOrder({ cart, mode: current, method, tableId: tableHere?.table_id, zoneId, address, landmark, lat: pos?.lat, lng: pos?.lng, note, name, phone });
      clearCart(cart.restaurantId);
      if (method === "mobile_money") {
        try { const pay = await startPayment(res.payment_id, res.tracking_code); window.location.href = pay.url; return; }
        catch { /* le suivi propose de reprendre le paiement */ }
      }
      router.push(`/suivi/${res.tracking_code}`);
    } catch (e) {
      setError(humanError(e));
      setBusy(false);
    }
  }

  const wa = resto ? whatsappOrderLink(resto.whatsapp, cart, note) : null;

  if (!resto) return <p className="mt-4 text-sm text-[var(--r-muted)]" aria-busy="true">Chargement des options…</p>;

  if (modes.length === 0) {
    return (
      <div className="mt-4 rounded-xl bg-[#fff4cc] p-3 text-sm">
        Aucun mode de commande n&apos;est disponible. Pour commander sur place, scanne le QR code de ta table.
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-2 block font-semibold underline">Écrire au restaurant sur WhatsApp</a>}
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4 border-t border-[var(--r-line)] pt-4">
      <fieldset>
        <legend className="mb-2 font-semibold">Comment veux-tu être servi ?</legend>
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button key={m.id} type="button" aria-pressed={current === m.id} onClick={() => setMode(m.id)} className={`min-h-11 rounded-full border px-4 text-sm font-medium ${current === m.id ? "border-[var(--r-brand)] bg-[var(--r-brand)] text-[var(--r-brand-ink)]" : "border-[var(--r-line)] bg-white"}`}>{m.label}</button>
          ))}
        </div>
        {!tableHere && resto.accepts_dine_in && <p className="mt-2 text-sm text-[var(--r-muted)]">Pour commander sur place, scanne le QR code de ta table.</p>}
      </fieldset>

      {current === "livraison" && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">Zone de livraison
            <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className={`${field} mt-1`}>
              <option value="">Choisir une zone</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name} – {formatFcfa(z.fee_fcfa)}</option>)}
            </select>
          </label>
          {zone && zone.min_order_fcfa > 0 && <p className="text-sm text-[var(--r-muted)]">Minimum de commande : {formatFcfa(zone.min_order_fcfa)}</p>}
          <label className="block text-sm font-medium">Repère (ex. en face de la pharmacie)
            <input value={landmark} onChange={(e) => setLandmark(e.target.value)} maxLength={200} className={`${field} mt-1`} />
          </label>
          <label className="block text-sm font-medium">Adresse (facultatif)
            <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} className={`${field} mt-1`} />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={locate} className="min-h-11 rounded-xl border border-[var(--r-line)] bg-white px-4 text-sm font-medium">Utiliser ma position</button>
            {pos && <span className="text-sm font-medium text-[var(--r-brand)]">Position enregistrée</span>}
          </div>
          <label className="block text-sm font-medium">Ou colle une position reçue sur WhatsApp
            <input value={pasted} onChange={(e) => onPaste(e.target.value)} placeholder="Lien de la position" className={`${field} mt-1`} />
          </label>
          {geoMsg && <p role="status" className="text-sm text-[var(--r-muted)]">{geoMsg}</p>}
        </div>
      )}

      <fieldset>
        <legend className="mb-2 font-semibold">Paiement</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={method === "especes"} onClick={() => setMethod("especes")} className={`min-h-11 rounded-full border px-4 text-sm font-medium ${method === "especes" ? "border-[var(--r-brand)] bg-[var(--r-brand)] text-[var(--r-brand-ink)]" : "border-[var(--r-line)] bg-white"}`}>Espèces</button>
          {MOBILE_MONEY_ENABLED && <button type="button" aria-pressed={method === "mobile_money"} onClick={() => setMethod("mobile_money")} className={`min-h-11 rounded-full border px-4 text-sm font-medium ${method === "mobile_money" ? "border-[var(--r-brand)] bg-[var(--r-brand)] text-[var(--r-brand-ink)]" : "border-[var(--r-line)] bg-white"}`}>Mobile money</button>}
        </div>
        {!MOBILE_MONEY_ENABLED && <p className="mt-2 text-sm text-[var(--r-muted)]">Le paiement mobile money arrive bientôt. Pour l&apos;instant, tu paies en espèces.</p>}
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium">Ton nom
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" className={`${field} mt-1`} />
        </label>
        <label className="block text-sm font-medium">Ton téléphone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="90 00 00 00" className={`${field} mt-1`} />
        </label>
      </div>

      <label className="block text-sm font-medium">Un mot pour le restaurant (facultatif)
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className={`${field} mt-1`} />
      </label>

      <dl className="space-y-1 text-sm">
        <div className="flex justify-between"><dt>Plats</dt><dd>{formatFcfa(subtotal)}</dd></div>
        {current === "livraison" && <div className="flex justify-between"><dt>Livraison</dt><dd>{zone ? formatFcfa(fee) : "selon la zone"}</dd></div>}
        <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatFcfa(subtotal + fee)}</dd></div>
      </dl>

      {error && <p role="alert" className="rounded-xl bg-[#fde4e1] p-3 text-sm">{error}</p>}

      <button type="button" disabled={busy || !current} onClick={submit} className="min-h-12 w-full rounded-xl bg-[var(--r-brand)] px-4 font-semibold text-[var(--r-brand-ink)] disabled:opacity-60">{busy ? "Envoi en cours…" : method === "mobile_money" ? "Commander et payer" : "Envoyer ma commande"}</button>
      {!user && <p className="text-center text-sm text-[var(--r-muted)]">Pas besoin de compte. <Link href="/connexion?next=/commande" className="underline">Se connecter</Link> pour retrouver tes commandes.</p>}

      {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="block text-center text-sm font-medium underline">Réseau instable ? Envoyer ma commande par WhatsApp</a>}
    </div>
  );
}
