"use client";
import Link from "next/link";
import ClientShell from "@/components/layout/ClientShell";
import HelpBubble from "@/components/ui/HelpBubble";
import HelpButton from "@/components/ui/HelpButton";
import Skeleton from "@/components/ui/Skeleton";
import { useRestaurants } from "@/lib/useRestaurants";

// Réserver = simple lien vers la page du restaurant (réservation gérée par l'agent 5).
export default function Reserver() {
  const { restaurants, error, reload } = useRestaurants();
  return (
    <ClientShell>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Réserver</h1>
        <HelpButton topic="client-reserver" />
      </header>
      <HelpBubble id="client-reserver" title="Réserve une table">Choisis un restaurant : tu arrives sur sa page pour réserver un créneau libre.</HelpBubble>
      {error && <div role="alert" className="rounded-2xl border border-[var(--r-line)] bg-white p-6 text-center"><p className="font-semibold">{error}</p><button type="button" onClick={reload} className="mt-3 min-h-11 rounded-xl bg-[var(--r-brand)] px-4 text-sm font-semibold text-[var(--r-brand-ink)]">Réessayer</button></div>}
      {!error && restaurants === null && <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>}
      {restaurants && restaurants.length === 0 && <p className="rounded-2xl border border-dashed border-[var(--r-line)] bg-white p-6 text-center">Aucun restaurant pour le moment.</p>}
      {restaurants && (
        <ul className="space-y-3">
          {restaurants.map((r) => (
            <li key={r.id}>
              <Link href={`/r/${r.slug}`} className="flex min-h-16 items-center justify-between rounded-2xl border border-[var(--r-line)] bg-white p-4">
                <span className="min-w-0"><span className="block truncate font-semibold">{r.name}</span><span className="block truncate text-sm text-[var(--r-muted)]">{r.cuisine}</span></span>
                <span className="shrink-0 text-sm font-semibold text-[var(--r-brand)]">Réserver</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ClientShell>
  );
}
