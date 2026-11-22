"use client";
import { useEffect, useState } from "react";
import { ConfirmDialog, EmptyState, ErrorBox, Field, HelpBubble, ListSkeleton, PageHeader, Switch, btnGhost, btnPrimary, cardCls, inputCls, useToast } from "@/components/dashboard/ui";
import { useRestaurant } from "@/components/dashboard/RestaurantProvider";
import { db, must } from "@/lib/dashboard/db";
import { humanError } from "@/lib/dashboard/errors";
import { dayKey, dayLabel, hhmm } from "@/lib/dashboard/format";
import { useLoad } from "@/lib/dashboard/useLoad";
import { whatsappLink } from "@/lib/orders/whatsapp";
import type { OpeningHour, Reservation } from "@/lib/dashboard/types";

const DAYS = [{ d: 1, n: "Lundi" }, { d: 2, n: "Mardi" }, { d: 3, n: "Mercredi" }, { d: 4, n: "Jeudi" }, { d: 5, n: "Vendredi" }, { d: 6, n: "Samedi" }, { d: 0, n: "Dimanche" }];
const SOURCE = { site: "Site", app: "Application", assistant_vocal: "via assistant vocal" } as const;
interface Hours { opens: string; closes: string; closed: boolean; id?: string }

export default function ReservationsPage() {
  const { restaurant } = useRestaurant();
  const toast = useToast();
  const id = restaurant?.id;
  const [hours, setHours] = useState<Record<number, Hours>>({});
  const [cancelT, setCancelT] = useState<Reservation | null>(null);
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10));
  const [testPeople, setTestPeople] = useState("2");
  const [slots, setSlots] = useState<{ slot: string; seats_left: number; available: boolean }[] | null>(null);

  const { data, loading, error, reload } = useLoad(async () => {
    if (!id) return null;
    const from = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    const [r, h, t] = await Promise.all([
      db().from("resto_reservations").select("*").eq("restaurant_id", id).gte("starts_at", from).in("status", ["en_attente", "confirmee"]).order("starts_at").limit(200),
      db().from("resto_opening_hours").select("*").eq("restaurant_id", id),
      db().from("resto_tables").select("seats").eq("restaurant_id", id).eq("active", true),
    ]);
    return { resas: must(r) as Reservation[], hours: must(h) as OpeningHour[], seats: (must(t) as { seats: number }[]).reduce((s, x) => s + x.seats, 0) };
  }, [id]);

  useEffect(() => {
    if (!data) return;
    const m: Record<number, Hours> = {};
    DAYS.forEach(({ d }) => {
      const row = data.hours.find((x) => x.weekday === d);
      m[d] = { id: row?.id, opens: (row?.opens ?? "11:00").slice(0, 5), closes: (row?.closes ?? "22:00").slice(0, 5), closed: row ? row.closed : d === 0 };
    });
    setHours(m);
  }, [data]);

  // Les réservations ne sont pas en direct : on actualise toutes les minutes.
  useEffect(() => { const t = setInterval(() => { if (navigator.onLine) reload(); }, 60000); return () => clearInterval(t); }, [reload]);

  if (!restaurant) return null;
  const resas = data?.resas ?? [];
  const soon = resas.filter((r) => r.status === "confirmee" && +new Date(r.starts_at) - Date.now() < 2 * 3600 * 1000 && +new Date(r.starts_at) > Date.now() - 30 * 60000);
  const pending = resas.filter((r) => r.status === "en_attente");
  const byDay = resas.filter((r) => r.status === "confirmee").reduce<Record<string, Reservation[]>>((a, r) => { (a[dayKey(r.starts_at)] ??= []).push(r); return a; }, {});

  async function setStatus(r: Reservation, status: string, okMsg: string) {
    const { error } = await db().rpc("resto_set_reservation_status", { p_id: r.id, p_status: status });
    if (error) return toast.show(humanError(error), "err");
    toast.show(okMsg); reload();
  }
  async function saveHours() {
    const res = await Promise.all(DAYS.map(({ d }) => {
      const h = hours[d];
      const row = { opens: h.opens, closes: h.closes, closed: h.closed };
      return h.id ? db().from("resto_opening_hours").update(row).eq("id", h.id) : db().from("resto_opening_hours").insert({ ...row, restaurant_id: id, weekday: d });
    }));
    const bad = res.find((r) => r.error);
    if (bad?.error) return toast.show(humanError(bad.error), "err");
    toast.show("Horaires enregistrés ✅"); reload();
  }
  async function checkSlots() {
    const { data: s, error } = await db().rpc("get_availability", { p_restaurant: id, p_date: testDate, p_people: Math.max(1, parseInt(testPeople) || 1) });
    if (error) return toast.show(humanError(error), "err");
    setSlots((s ?? []) as { slot: string; seats_left: number; available: boolean }[]);
  }

  const card = (r: Reservation, actions: React.ReactNode) => (
    <li key={r.id} className={`${cardCls} fade-in`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold">{dayLabel(r.starts_at)} · {hhmm(r.starts_at)}</p>
        {r.source === "assistant_vocal" && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-900">🎙️ via assistant vocal</span>}
      </div>
      <p className="mt-1">{r.name} · {r.party_size} personne{r.party_size > 1 ? "s" : ""} · {r.phone}</p>
      {r.note && <p className="mt-1 rounded-lg bg-amber-50 p-2 text-sm">📝 {r.note}</p>}
      <div className="mt-3 flex flex-wrap gap-2">{actions}</div>
    </li>
  );
  const wa = (r: Reservation, msg: string) => (
    <a className={btnGhost} target="_blank" rel="noopener noreferrer" href={whatsappLink(r.phone, msg)}>💬 WhatsApp</a>
  );

  return (
    <>
      <PageHeader title="Agenda et réservations" subtitle="Confirmez les demandes et réglez vos horaires." />
      <HelpBubble id="reservations" title="Vos réservations">
        Les demandes arrivent ici (site, application ou assistant vocal). Confirmez ou refusez en un toucher. Le nombre de places vient de vos tables.
      </HelpBubble>

      {loading ? <ListSkeleton /> : error ? <ErrorBox message={error} onRetry={reload} /> : (
        <div className="space-y-6">
          {soon.length > 0 && (
            <div role="status" className="rounded-2xl bg-amber-100 p-3 font-semibold text-amber-950">
              ⏰ Rappel : {soon.length} réservation{soon.length > 1 ? "s" : ""} dans les 2 prochaines heures ({soon.map((r) => `${hhmm(r.starts_at)} ${r.name}`).join(", ")}).
            </div>
          )}

          <section aria-label="À traiter">
            <h2 className="mb-2 text-lg font-bold">À confirmer ({pending.length})</h2>
            {pending.length === 0 ? <p className="text-sm text-stone-600">Aucune demande en attente.</p> : (
              <ul className="space-y-3">{pending.map((r) => card(r, <>
                <button className={btnPrimary} onClick={() => setStatus(r, "confirmee", "Réservation confirmée ✅")}>✅ Confirmer</button>
                <button className={btnGhost} onClick={() => setStatus(r, "refusee", "Réservation refusée.")}>Refuser</button>
                {wa(r, `Bonjour ${r.name}, nous avons bien reçu votre demande de réservation chez ${restaurant.name} le ${dayLabel(r.starts_at)} à ${hhmm(r.starts_at)}.`)}
              </>))}</ul>
            )}
          </section>

          <section aria-label="Confirmées">
            <h2 className="mb-2 text-lg font-bold">Réservations confirmées</h2>
            {Object.keys(byDay).length === 0 ? (
              <EmptyState icon="📅" title="Aucune réservation confirmée" text="Vérifiez vos horaires et vos tables : sans eux, aucun créneau ne peut être proposé aux clients." />
            ) : Object.entries(byDay).map(([day, list]) => (
              <div key={day} className="mb-4">
                <h3 className="mb-1 text-sm font-bold capitalize text-stone-700">{dayLabel(list[0].starts_at)}</h3>
                <ul className="space-y-3">{list.map((r) => card(r, <>
                  <button className={btnGhost} onClick={() => setStatus(r, "terminee", "Réservation terminée.")}>Terminée</button>
                  {wa(r, `Bonjour ${r.name}, un petit rappel de votre réservation chez ${restaurant.name} à ${hhmm(r.starts_at)}. À tout à l'heure !`)}
                  <button className={`${btnGhost} ml-auto`} onClick={() => setCancelT(r)}>Annuler</button>
                </>))}</ul>
              </div>
            ))}
          </section>

          <section className={`${cardCls} space-y-3`} aria-label="Horaires">
            <h2 className="text-lg font-bold">Horaires d&apos;ouverture</h2>
            <p className="text-sm text-stone-700">Capacité actuelle : <strong>{data?.seats ?? 0} places</strong> (somme de vos tables). Créneaux de 1 h 30, proposés toutes les 30 minutes.</p>
            {DAYS.map(({ d, n }) => hours[d] && (
              <div key={d} className="grid grid-cols-[88px_1fr_1fr_auto] items-center gap-2">
                <span className="font-semibold">{n}</span>
                <input type="time" aria-label={`${n} ouverture`} className={inputCls} disabled={hours[d].closed} value={hours[d].opens} onChange={(e) => setHours({ ...hours, [d]: { ...hours[d], opens: e.target.value } })} />
                <input type="time" aria-label={`${n} fermeture`} className={inputCls} disabled={hours[d].closed} value={hours[d].closes} onChange={(e) => setHours({ ...hours, [d]: { ...hours[d], closes: e.target.value } })} />
                <Switch label={`${n} ouvert`} checked={!hours[d].closed} onChange={(v) => setHours({ ...hours, [d]: { ...hours[d], closed: !v } })} />
              </div>
            ))}
            <button className={btnPrimary} onClick={saveHours}>Enregistrer les horaires</button>
          </section>

          <section className={`${cardCls} space-y-3`} aria-label="Tester les créneaux">
            <h2 className="text-lg font-bold">Voir les créneaux libres</h2>
            <p className="text-sm text-stone-700">C&apos;est exactement ce que voient vos clients et l&apos;assistant vocal. Le restaurant doit être en ligne.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date"><input type="date" className={inputCls} value={testDate} onChange={(e) => setTestDate(e.target.value)} /></Field>
              <Field label="Personnes"><input className={inputCls} inputMode="numeric" value={testPeople} onChange={(e) => setTestPeople(e.target.value.replace(/\D/g, ""))} /></Field>
            </div>
            <button className={btnGhost} onClick={checkSlots}>Voir</button>
            {slots && (slots.length === 0 ? <p className="text-sm">Aucun créneau : restaurant hors ligne, fermé ce jour-là ou sans table.</p> : (
              <ul className="flex flex-wrap gap-2">{slots.map((s) => (
                <li key={s.slot} className={`rounded-full px-3 py-1 text-sm font-semibold ${s.available ? "bg-emerald-100 text-emerald-900" : "bg-stone-200 text-stone-600 line-through"}`}>{hhmm(s.slot)}</li>
              ))}</ul>
            ))}
          </section>
        </div>
      )}
      <ConfirmDialog open={!!cancelT} danger title="Annuler cette réservation ?" text="Pensez à prévenir le client, par exemple avec le bouton WhatsApp."
        confirmLabel="Oui, annuler" onCancel={() => setCancelT(null)} onConfirm={() => { const r = cancelT!; setCancelT(null); setStatus(r, "annulee", "Réservation annulée."); }} />
      {toast.node}
    </>
  );
}
