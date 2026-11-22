"use client";
import { useEffect, useState } from "react";
import { browserDb } from "@/lib/site/browser";
import { createReservationApi } from "@/lib/resto-api";
import { humanError } from "@/lib/site/errors";
import { validPhone } from "@/lib/site/safe";

type Slot = { slot: string; available: boolean; seats_left: number };
const todayLome = () => new Date().toISOString().slice(0, 10); // Lomé = UTC+0
const label = (s: string) => (/^\d{2}:\d{2}/.test(s) ? s.slice(0, 5).replace(":", "h") : new Date(s).toISOString().slice(11, 16).replace(":", "h"));
// ⚠ Format du créneau renvoyé par get_availability à confirmer avec l'agent 1 : "HH:MM" ou date complète, les deux sont gérés.
const toStart = (date: string, slot: string) => (/^\d{2}:\d{2}/.test(slot) ? `${date}T${slot.slice(0, 5)}:00+00:00` : slot);

export default function ReserveClient({ restaurantId, name, waBase }: { restaurantId: string; name: string; waBase: string }) {
  const [date, setDate] = useState(todayLome());
  const [party, setParty] = useState(2);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slot, setSlot] = useState("");
  const [who, setWho] = useState(""); const [phone, setPhone] = useState(""); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    let live = true; setSlots(null); setSlot(""); setErr("");
    browserDb().rpc("get_availability", { p_restaurant: restaurantId, p_date: date, p_people: party }).then(({ data, error }) => {
      if (!live) return;
      if (error) { setErr(humanError(error)); setSlots([]); } else setSlots((data as Slot[]) ?? []);
    });
    return () => { live = false; };
  }, [restaurantId, date, party]);

  async function submit() {
    setErr("");
    if (!slot) return setErr("Choisis un créneau.");
    if (who.trim().length < 2) return setErr("Indique ton nom.");
    if (!validPhone(phone)) return setErr("Indique un numéro de téléphone valide.");
    setBusy(true);
    let error: unknown = null;
    try { await createReservationApi({ restaurantId, startIso: new Date(toStart(date, slot)).toISOString(), people: party, name: who, phone, note }); } catch (e) { error = e; }
    setBusy(false);
    if (error) return setErr(humanError(error));
    setDone(`${date.split("-").reverse().join("/")} à ${label(slot)} · ${party} pers.`);
  }

  if (done) {
    const msg = `Bonjour ${name} ! J'ai demandé une réservation : ${done}, au nom de ${who.trim()}.`;
    return (
      <div className="text-center">
        <p className="r-pop text-6xl" aria-hidden>🎉</p>
        <h2 className="mt-3 text-2xl font-bold">Demande envoyée !</h2>
        <p className="mt-1">{done}</p>
        <p className="mt-1 text-sm text-neutral-700">Le restaurant doit encore la confirmer.</p>
        {waBase && <a href={`${waBase}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-12 items-center rounded-2xl bg-[var(--brand)] px-6 font-semibold text-[var(--on-brand)]">Prévenir sur WhatsApp</a>}
      </div>
    );
  }
  const field = "min-h-12 w-full rounded-xl border border-neutral-300 px-3 text-base";
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className="mb-1 block font-semibold">Jour</span><input type="date" className={field} min={todayLome()} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} /></label>
        <div><span className="mb-1 block font-semibold">Personnes</span>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Moins de personnes" onClick={() => setParty((p) => Math.max(1, p - 1))} className="h-12 w-12 rounded-xl border border-neutral-300 text-lg">−</button>
            <span className="w-8 text-center text-lg font-bold">{party}</span>
            <button type="button" aria-label="Plus de personnes" onClick={() => setParty((p) => Math.min(20, p + 1))} className="h-12 w-12 rounded-xl bg-[var(--brand)] text-lg text-[var(--on-brand)]">+</button>
          </div></div>
      </div>
      <div>
        <p className="mb-2 font-semibold">Créneaux</p>
        {slots === null ? <div className="grid grid-cols-3 gap-2" aria-busy="true">{Array.from({ length: 6 }, (_, i) => <div key={i} className="r-pulse h-12 rounded-xl bg-neutral-200" />)}</div>
          : !slots.length ? <p className="rounded-xl bg-[var(--brand-soft)] p-4 text-sm">Aucun créneau ce jour-là. Essaie un autre jour ou moins de personnes.</p>
          : <div className="grid grid-cols-3 gap-2">{slots.map((s) => (
              <button key={s.slot} type="button" disabled={!s.available} aria-pressed={slot === s.slot} onClick={() => setSlot(s.slot)} className={`min-h-12 rounded-xl border-2 text-sm font-semibold disabled:opacity-40 ${slot === s.slot ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)]" : "border-neutral-300"}`}>
                {label(s.slot)}{!s.available && <span className="block text-[10px] font-normal">Complet</span>}
              </button>))}</div>}
      </div>
      <label className="block"><span className="mb-1 block font-semibold">Ton nom</span><input className={field} autoComplete="name" value={who} onChange={(e) => setWho(e.target.value)} maxLength={80} /></label>
      <label className="block"><span className="mb-1 block font-semibold">Ton téléphone</span><input className={field} inputMode="tel" autoComplete="tel" placeholder="90 00 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
      <label className="block"><span className="mb-1 block font-semibold">Un message ? (facultatif)</span><input className={field} value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Anniversaire, chaise bébé…" /></label>
      {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{err}</p>}
      <button type="button" disabled={busy} onClick={submit} className="min-h-14 w-full rounded-2xl bg-[var(--brand)] text-lg font-bold text-[var(--on-brand)] disabled:opacity-60">{busy ? "Envoi…" : "Demander cette réservation"}</button>
    </div>
  );
}
