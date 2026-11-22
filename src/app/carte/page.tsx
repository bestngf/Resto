"use client";
import dynamic from "next/dynamic";
import ClientShell from "@/components/layout/ClientShell";
import HelpBubble from "@/components/ui/HelpBubble";
import HelpButton from "@/components/ui/HelpButton";
import Skeleton from "@/components/ui/Skeleton";
import RestaurantCard from "@/components/restaurants/RestaurantCard";
import { useRestaurants } from "@/lib/useRestaurants";

const RestaurantMap = dynamic(() => import("@/components/carte/RestaurantMap"), { ssr: false, loading: () => <Skeleton className="h-[55dvh]" /> });

export default function Trouver() {
  const { restaurants, error, reload } = useRestaurants();
  return (
    <ClientShell>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trouver</h1>
        <HelpButton topic="client-trouver" />
      </header>
      <HelpBubble id="client-carte" title="Les restaurants autour de toi">Touche un point sur la carte, puis « Y aller » pour ouvrir l&apos;itinéraire.</HelpBubble>
      {error && (
        <div role="alert" className="rounded-2xl border border-[var(--r-line)] bg-white p-6 text-center">
          <p className="font-semibold">{error}</p>
          <button type="button" onClick={reload} className="mt-3 min-h-11 rounded-xl bg-[var(--r-brand)] px-4 text-sm font-semibold text-[var(--r-brand-ink)]">Réessayer</button>
        </div>
      )}
      {!error && restaurants === null && <Skeleton className="h-[55dvh]" />}
      {restaurants && (
        <>
          <RestaurantMap restaurants={restaurants} />
          <ul className="mt-4 space-y-4">{restaurants.map((r) => <li key={r.id}><RestaurantCard r={r} /></li>)}</ul>
        </>
      )}
    </ClientShell>
  );
}
