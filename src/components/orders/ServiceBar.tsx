"use client";
import { useEffect, useState } from "react";
import { btnGhost, btnPrimary } from "@/components/dashboard/ui";
import { isAudioReady, playRing, startService, stopService } from "@/lib/orders/alert";
import type { LinkState } from "@/hooks/useRealtimeOrders";

const LINK: Record<LinkState, [string, string]> = {
  live: ["En direct", "bg-emerald-100 text-emerald-900"],
  weak: ["Connexion faible", "bg-amber-100 text-amber-900"],
  offline: ["Hors connexion", "bg-red-100 text-red-900"],
};

/** Démarrage du service + sonnerie répétée tant que des commandes attendent. */
export function ServiceBar({ pending, link, queued }: { pending: number; link: LinkState; queued: number }) {
  const [started, setStarted] = useState(false);
  const [blocked, setBlocked] = useState(false);

  async function start() { const ok = await startService(); setStarted(true); setBlocked(!ok); }
  function stop() { stopService(); setStarted(false); setBlocked(false); }
  useEffect(() => () => stopService(), []);

  // Sonnerie immédiate puis toutes les 15 s tant qu'une commande n'est pas acceptée.
  useEffect(() => {
    if (!started || pending === 0) return;
    const ring = () => setBlocked(!playRing());
    ring();
    const t = setInterval(ring, 15000);
    return () => clearInterval(t);
  }, [started, pending > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // Titre de l'onglet qui clignote : visible même si le son est coupé.
  useEffect(() => {
    if (pending === 0) return;
    const base = document.title;
    let on = false;
    const t = setInterval(() => { on = !on; document.title = on ? `🔔 ${pending} commande(s) !` : base; }, 1000);
    return () => { clearInterval(t); document.title = base; };
  }, [pending]);

  return (
    <div className="mb-4 space-y-2">
      {!started ? (
        <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-4">
          <p className="font-semibold text-emerald-950">Prêt à recevoir des commandes ?</p>
          <p className="mb-3 text-sm text-emerald-900">Touchez le bouton pour activer la sonnerie et garder l&apos;écran allumé.</p>
          <button className={`${btnPrimary} min-h-14 w-full text-base`} onClick={start}>▶ Démarrer le service</button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm">
          <span className="font-semibold text-emerald-800">🔔 Service en cours</span>
          <button className={btnGhost} onClick={() => setBlocked(!playRing())}>Tester le son</button>
          <button className={btnGhost} onClick={stop}>Arrêter</button>
        </div>
      )}
      {started && (blocked || !isAudioReady()) && (
        <button onClick={start} className="w-full rounded-2xl bg-red-700 p-3 text-left font-semibold text-white">
          🔇 Le son est bloqué sur cet appareil. Touchez ici pour le réactiver (vérifiez aussi le volume).
        </button>
      )}
      {pending > 0 && (
        <p role="alert" className="ring-pulse rounded-2xl bg-red-700 p-3 text-center text-lg font-bold text-white">
          {pending} commande{pending > 1 ? "s" : ""} attend{pending > 1 ? "ent" : ""} votre réponse
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-full px-2 py-1 font-semibold ${LINK[link][1]}`}>{LINK[link][0]}</span>
        {queued > 0 && <span className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-900">{queued} changement(s) à envoyer</span>}
      </div>
    </div>
  );
}
