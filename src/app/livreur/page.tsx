"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { humanError } from "@/lib/errors";
import { formatFcfa } from "@/lib/format";
import { isAudioReady, playRing, startService, stopService } from "@/lib/orders/alert";
import { distanceKm, prettyKm, routeLink, type Pt } from "@/lib/livreur/geo";

type Row = {
  id: string; restaurant_id: string; status: "prete" | "en_route" | "livree"; total: number; payment_method: string; payment_status: string; courier_id: string | null;
  contact_name: string | null; contact_phone: string | null; delivery_address: string | null; delivery_landmark: string | null; delivery_lat: number | null; delivery_lng: number | null;
  note: string | null; updated_at: string; restaurant: { name: string; address: string | null; phone: string | null; latitude: number | null; longitude: number | null } | null;
};
const COLS = "id,restaurant_id,status,total,payment_method,payment_status,courier_id,contact_name,contact_phone,delivery_address,delivery_landmark,delivery_lat,delivery_lng,note,updated_at,restaurant:resto_restaurants(name,address,phone,latitude,longitude)";
const tel = (p: string) => p.replace(/[^\d+]/g, "");
const wa = (p: string) => { const d = p.replace(/\D/g, ""); return `https://wa.me/${d.length === 8 ? "228" + d : d}`; };

export default function Livreur() {
  const router = useRouter();
  const sb = getSupabase();
  const [uid, setUid] = useState<string | null>(null);
  const [isCourier, setIsCourier] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  const [onDuty, setOnDuty] = useState(false);
  const [pos, setPos] = useState<Pt | null>(null);
  const [notif, setNotif] = useState<"non" | "oui" | "refuse">("non");
  const seen = useRef<Set<string> | null>(null);
  const watch = useRef<number | null>(null);

  const load = useCallback(async (me: string) => {
    const since = new Date(); since.setUTCHours(0, 0, 0, 0); // Lomé = UTC+0
    const { data, error } = await sb.from("resto_orders").select(COLS).eq("mode", "livraison").in("status", ["prete", "en_route", "livree"])
      .gte("updated_at", since.toISOString()).order("updated_at", { ascending: false }).limit(60);
    if (error) { setErr(humanError(error)); return; }
    const list = ((data ?? []) as unknown as Row[]).filter((r) => r.status !== "livree" || r.courier_id === me);
    setRows(list); setErr("");
    const toTake = new Set(list.filter((r) => r.status === "prete" && !r.courier_id).map((r) => r.id));
    if (seen.current) {
      const fresh = [...toTake].filter((id) => !seen.current!.has(id));
      if (fresh.length) {
        playRing();
        try { if (typeof Notification !== "undefined" && Notification.permission === "granted") new Notification("Nouvelle livraison à prendre", { body: `${fresh.length} commande(s) prête(s)`, tag: "livraison" }); } catch { /* ignoré */ }
      }
    }
    seen.current = toTake;
  }, [sb]);

  useEffect(() => {
    let off: (() => void) | undefined; let timer: ReturnType<typeof setInterval> | undefined;
    (async () => {
      const { data } = await sb.auth.getUser();
      if (!data.user) { router.replace("/connexion?next=/livreur"); return; }
      const me = data.user.id; setUid(me);
      const m = await sb.from("resto_restaurant_members").select("id").eq("user_id", me).eq("role", "livreur").eq("status", "actif").limit(1);
      setIsCourier((m.data ?? []).length > 0); if (!(m.data ?? []).length) return;
      if (typeof Notification !== "undefined") setNotif(Notification.permission === "granted" ? "oui" : Notification.permission === "denied" ? "refuse" : "non");
      await load(me);
      const ch = sb.channel("livreur-" + me).on("postgres_changes", { event: "*", schema: "public", table: "resto_orders" }, () => load(me))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "resto_notifications", filter: `user_id=eq.${me}` }, () => load(me)).subscribe();
      timer = setInterval(() => load(me), 30000); // secours si le réseau coupe la connexion en direct
      off = () => { sb.removeChannel(ch); };
    })().catch((e) => setErr(humanError(e)));
    return () => { off?.(); if (timer) clearInterval(timer); if (watch.current != null) navigator.geolocation?.clearWatch(watch.current); stopService(); };
  }, [sb, router, load]);

  async function startDuty() {
    await startService(); setOnDuty(isAudioReady() || true);
    if (typeof Notification !== "undefined" && Notification.permission === "default") { const p = await Notification.requestPermission(); setNotif(p === "granted" ? "oui" : p === "denied" ? "refuse" : "non"); }
    if (navigator.geolocation && watch.current == null) watch.current = navigator.geolocation.watchPosition((p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }), () => { /* position facultative */ }, { enableHighAccuracy: true, maximumAge: 15000 });
  }
  async function act(id: string, kind: "take" | "done" | "cash") {
    setBusy(id + kind); setErr("");
    try {
      const { error } = kind === "cash" ? await sb.rpc("resto_confirm_cash", { p_order: id }) : await sb.rpc("resto_set_order_status", { p_order: id, p_status: kind === "take" ? "en_route" : "livree" });
      if (error) throw error;
      if (uid) await load(uid);
    } catch (e) { setErr(String((e as { message?: string })?.message ?? "").includes("deja_prise") ? "Cette livraison vient d'être prise par un autre livreur." : humanError(e)); if (uid) await load(uid); }
    setBusy("");
  }

  if (isCourier === false) return (
    <main className="mx-auto max-w-xl p-4"><h1 className="text-2xl font-bold">Espace livreur</h1>
      <p className="mt-3 rounded-xl bg-amber-50 p-3">Ton compte n&apos;est pas livreur d&apos;un restaurant. Demande au gérant de t&apos;envoyer son lien d&apos;invitation, puis ouvre-le.</p>
      <Link href="/rejoindre" className="mt-3 inline-flex min-h-12 items-center rounded-xl bg-neutral-900 px-5 font-semibold text-white">Rejoindre une équipe</Link></main>);
  if (isCourier === null) return <main className="mx-auto max-w-xl p-4"><p aria-busy="true">{err || "Chargement…"}</p></main>;

  const toTake = rows.filter((r) => r.status === "prete" && !r.courier_id);
  const mine = rows.filter((r) => r.status === "en_route" && r.courier_id === uid);
  const done = rows.filter((r) => r.status === "livree");
  const dist = (lat: number | null, lng: number | null) => (pos && lat != null && lng != null ? prettyKm(distanceKm(pos, { lat, lng })) : null);
  const btn = "min-h-12 rounded-xl px-4 font-semibold disabled:opacity-60";

  return (
    <main className="mx-auto max-w-xl space-y-5 p-4 pb-24">
      <header className="flex items-center justify-between gap-2"><h1 className="text-2xl font-bold">🛵 Mes livraisons</h1><Link href="/aide?page=livreur" className="text-sm underline">Aide</Link></header>

      {!onDuty ? (
        <div className="rounded-2xl bg-neutral-900 p-4 text-white">
          <p className="font-semibold">Démarre ton service pour être alerté</p>
          <p className="mt-1 text-sm text-neutral-300">Son, vibration, notification et distance. Garde l&apos;application ouverte et l&apos;écran allumé.</p>
          <button type="button" onClick={startDuty} className={`${btn} mt-3 w-full bg-[#F5F3EE] text-neutral-900`}>Démarrer mon service</button>
        </div>
      ) : (
        <p role="status" className="rounded-xl ngf-ok p-3 text-sm font-medium">Service en cours : tu seras alerté pour chaque nouvelle livraison.{notif === "refuse" && " (Notifications bloquées dans le navigateur : seul le son est actif.)"}{pos ? "" : " Position en attente…"}</p>
      )}
      {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm">{err}</p>}

      <section aria-label="Livraisons en cours" className="space-y-3">
        <h2 className="font-bold">En cours ({mine.length})</h2>
        {mine.length === 0 && <p className="text-sm text-neutral-600">Aucune livraison en cours.</p>}
        {mine.map((r) => {
          const toResto = routeLink({ lat: r.restaurant?.latitude ?? null, lng: r.restaurant?.longitude ?? null, text: r.restaurant?.address ?? r.restaurant?.name });
          const toClient = routeLink({ lat: r.delivery_lat, lng: r.delivery_lng, text: [r.delivery_landmark, r.delivery_address].filter(Boolean).join(", ") });
          const cashDue = r.payment_method === "especes" && r.payment_status !== "paye";
          return (
            <article key={r.id} className="space-y-2 rounded-2xl border-2 border-neutral-900 p-3">
              <p className="font-semibold">{r.contact_name ?? "Client"} · {formatFcfa(r.total)}</p>
              <p className="text-sm">📍 {[r.delivery_landmark, r.delivery_address].filter(Boolean).join(" · ") || "Position GPS du client"}{dist(r.delivery_lat, r.delivery_lng) && ` · à ${dist(r.delivery_lat, r.delivery_lng)} à vol d'oiseau`}</p>
              {r.note && <p className="text-sm text-neutral-600">Note : {r.note}</p>}
              <div className="grid grid-cols-2 gap-2">
                {toResto && <a href={toResto} target="_blank" rel="noopener noreferrer" className={`${btn} border border-neutral-300 py-3 text-center text-sm`}>Itinéraire restaurant</a>}
                {toClient && <a href={toClient} target="_blank" rel="noopener noreferrer" className={`${btn} bg-neutral-900 py-3 text-center text-sm text-white`}>Itinéraire client</a>}
                {r.contact_phone && <a href={`tel:${tel(r.contact_phone)}`} className={`${btn} border border-neutral-300 py-3 text-center text-sm`}>Appeler le client</a>}
                {r.contact_phone && <a href={wa(r.contact_phone)} target="_blank" rel="noopener noreferrer" className={`${btn} border border-neutral-300 py-3 text-center text-sm`}>WhatsApp</a>}
              </div>
              {cashDue ? (
                <button type="button" disabled={busy === r.id + "cash"} onClick={() => act(r.id, "cash")} className={`${btn} w-full bg-amber-500 text-black`}>J&apos;ai encaissé {formatFcfa(r.total)} en espèces</button>
              ) : <p className="text-sm font-medium text-emerald-800">{r.payment_status === "paye" ? "Déjà payé : rien à encaisser." : ""}</p>}
              <button type="button" disabled={busy === r.id + "done"} onClick={() => { if (!cashDue || confirm("Le paiement en espèces n'est pas encore confirmé. Terminer quand même ?")) act(r.id, "done"); }} className={`${btn} w-full bg-emerald-700 text-white`}>Livraison terminée</button>
            </article>
          );
        })}
      </section>

      <section aria-label="Livraisons à prendre" className="space-y-3">
        <h2 className="font-bold">À prendre ({toTake.length})</h2>
        {toTake.length === 0 && <p className="text-sm text-neutral-600">Rien à prendre pour l&apos;instant. Cette liste se met à jour toute seule.</p>}
        {toTake.map((r) => (
          <article key={r.id} className="space-y-2 rounded-2xl border border-neutral-300 p-3">
            <p className="font-semibold">{r.restaurant?.name ?? "Restaurant"} · {formatFcfa(r.total)}</p>
            <p className="text-sm">Récupération : {r.restaurant?.address ?? "adresse du restaurant"}{dist(r.restaurant?.latitude ?? null, r.restaurant?.longitude ?? null) && ` · à ${dist(r.restaurant?.latitude ?? null, r.restaurant?.longitude ?? null)}`}</p>
            <p className="text-sm">Livraison : {[r.delivery_landmark, r.delivery_address].filter(Boolean).join(" · ") || "position GPS"}{r.payment_method === "especes" && r.payment_status !== "paye" ? " · à encaisser en espèces" : ""}</p>
            <button type="button" disabled={busy === r.id + "take"} onClick={() => act(r.id, "take")} className={`${btn} w-full bg-neutral-900 text-white`}>Je prends cette livraison</button>
          </article>
        ))}
      </section>

      {done.length > 0 && (
        <section aria-label="Livrées aujourd'hui" className="space-y-1"><h2 className="font-bold">Livrées aujourd&apos;hui ({done.length})</h2>
          <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 text-sm">{done.map((r) => <li key={r.id} className="flex justify-between p-3"><span>{r.contact_name ?? "Client"}</span><span>{formatFcfa(r.total)}</span></li>)}</ul></section>
      )}
    </main>
  );
}
