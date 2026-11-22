"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { btnGhost, btnPrimary, ErrorBox, ListSkeleton } from "@/components/dashboard/ui";
import RoleBadge from "@/components/team/RoleBadge";
import { db } from "@/lib/dashboard/db";
import { myRequests } from "@/lib/team/api";
import { teamError } from "@/lib/team/errors";
import { timeAgo } from "@/lib/team/format";
import type { MyRequest } from "@/lib/team/types";

/** Écran d'attente : se met à jour tout seul dès que le patron décide. Aucun accès aux données ici. */
export default function WaitingScreen({ userId, onJoinAnother }: { userId: string; onJoinAnother: () => void }) {
  const [reqs, setReqs] = useState<MyRequest[] | null>(null);
  const [err, setErr] = useState("");
  const lastStatus = useRef<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await myRequests(userId);
      const top = r[0];
      if (top && lastStatus.current === "en_attente" && top.status === "validee") { try { navigator.vibrate?.([200, 100, 200]); } catch { /* ignoré */ } }
      lastStatus.current = top?.status ?? null;
      setReqs(r); setErr("");
    } catch (e) { setErr(teamError(e)); }
  }, [userId]);

  useEffect(() => {
    load();
    const ch = db().channel(`me:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "resto_staff_requests", filter: `user_id=eq.${userId}` }, () => load())
      .subscribe();
    const t = setInterval(() => { if (document.visibilityState === "visible") load(); }, 20000); // filet si le temps réel est lent
    return () => { clearInterval(t); db().removeChannel(ch); };
  }, [userId, load]);

  if (err && !reqs) return <ErrorBox message={err} onRetry={load} />;
  if (!reqs) return <ListSkeleton rows={2} />;
  if (!reqs.length) return (
    <div className="team-fade rounded-2xl bg-white p-6 text-center shadow-sm">
      <p className="text-4xl" aria-hidden>📭</p>
      <h2 className="mt-2 text-lg font-bold">Aucune demande pour l&apos;instant</h2>
      <p className="mt-1 text-sm text-stone-600">Demande le lien ou le QR code d&apos;invitation à ton patron.</p>
      <button type="button" onClick={onJoinAnother} className={`${btnPrimary} mt-4`}>Saisir un code d&apos;invitation</button>
    </div>
  );

  const [top, ...older] = reqs;
  return (
    <div className="space-y-4">
      {top.status === "en_attente" && (
        <section className="team-fade rounded-2xl bg-white p-6 text-center shadow-sm" aria-live="polite">
          <div className="relative mx-auto grid h-28 w-28 place-items-center" aria-hidden>
            <span className="team-ripple absolute inset-0 rounded-full bg-emerald-300" />
            <span className="team-ripple absolute inset-0 rounded-full bg-emerald-300 [animation-delay:1.2s]" />
            <span className="relative grid h-20 w-20 place-items-center rounded-full bg-emerald-700 text-4xl">⏳</span>
          </div>
          <h2 className="mt-4 text-xl font-bold">Demande envoyée !</h2>
          <p className="mt-1">{top.restaurantName} a été prévenu. Il valide ta demande dans un instant.</p>
          <p className="mt-3 rounded-xl bg-stone-100 p-3 text-sm text-stone-700">Tu n&apos;as accès à rien pour l&apos;instant : c&apos;est normal. Tu peux fermer cette page, ta réponse t&apos;attendra ici (reviens sur ton lien d&apos;invitation).</p>
        </section>
      )}
      {top.status === "validee" && (
        <section className="team-pop rounded-2xl bg-white p-6 text-center shadow-sm" aria-live="polite">
          <p className="text-5xl" aria-hidden>🎉</p>
          <h2 className="mt-2 text-xl font-bold">Bienvenue dans l&apos;équipe !</h2>
          <p className="mt-1">{top.restaurantName} t&apos;a accepté.</p>
          {top.role_assigned && <p className="mt-2"><RoleBadge role={top.role_assigned} /></p>}
          <Link href="/dashboard/commandes" className={`${btnPrimary} mt-4 w-full`}>Ouvrir mon espace</Link>
        </section>
      )}
      {top.status === "refusee" && (
        <section className="team-fade rounded-2xl bg-white p-6 text-center shadow-sm" aria-live="polite">
          <p className="text-4xl" aria-hidden>🙏</p>
          <h2 className="mt-2 text-xl font-bold">Ta demande n&apos;a pas été acceptée</h2>
          <p className="mt-1 text-sm text-stone-700">Parle à ton patron pour comprendre. S&apos;il le souhaite, il pourra t&apos;envoyer une nouvelle invitation.</p>
        </section>
      )}

      {older.length > 0 && (
        <section aria-label="Mes autres demandes">
          <h3 className="mb-2 text-sm font-semibold text-stone-700">Mes autres demandes</h3>
          <ul className="space-y-2">
            {older.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-xl bg-white p-3 text-sm shadow-sm">
                <span>{r.restaurantName} · {timeAgo(r.created_at)}</span>
                <span className="font-semibold">{r.status === "en_attente" ? "En attente" : r.status === "validee" ? "Acceptée" : "Refusée"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <button type="button" onClick={onJoinAnother} className={`${btnGhost} w-full`}>Rejoindre un autre restaurant</button>
    </div>
  );
}
