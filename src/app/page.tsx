"use client";
import ClientShell from "@/components/layout/ClientShell";
import HelpBubble from "@/components/ui/HelpBubble";
import HelpButton from "@/components/ui/HelpButton";
import Skeleton from "@/components/ui/Skeleton";
import RestaurantList from "@/components/restaurants/RestaurantList";
import { useRestaurants } from "@/lib/useRestaurants";
import Link from "next/link";
import { APP_NAME } from "@/config/app";

export default function Accueil() {
  const { restaurants, error, fromCache, reload } = useRestaurants();
  return (
    <ClientShell>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        <HelpButton topic="client-accueil" />
      </header>
      <HelpBubble id="client-accueil" title="Bienvenue !">
        Cherche un restaurant, puis ajoute tes plats au panier. Tu peux commander sur place, à emporter ou te faire livrer.
      </HelpBubble>
      {fromCache && (
        <p role="status" className="mb-3 rounded-xl bg-amber-50 p-3 text-sm">Pas de connexion : voici la dernière liste enregistrée.
          <button type="button" onClick={reload} className="ml-2 font-semibold underline">Réessayer</button>
        </p>
      )}
      {restaurants === null && !error && (
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-12" />
          <Skeleton className="h-52" /><Skeleton className="h-52" />
        </div>
      )}
      {error && (
        <div role="alert" className="rounded-2xl border border-[var(--r-line)] bg-white p-6 text-center">
          <p className="font-semibold">{error}</p>
          <button type="button" onClick={reload} className="mt-3 min-h-11 rounded-xl bg-[var(--r-brand)] px-4 text-sm font-semibold text-[var(--r-brand-ink)]">Réessayer</button>
        </div>
      )}
      {restaurants && restaurants.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--r-line)] bg-white p-6 text-center">
          <p className="font-semibold">Aucun restaurant pour le moment</p>
          <p className="mt-1 text-sm text-[var(--r-muted)]">Reviens bientôt : de nouveaux restaurants arrivent.</p>
        </div>
      )}
      {restaurants && restaurants.length > 0 && <RestaurantList restaurants={restaurants} />}
      <section aria-labelledby="espace-pro" className="ngf-card ngf-empty mt-8 bg-white p-5">
        <h2 id="espace-pro" className="text-lg font-extrabold">Tu travailles dans la restauration ?</h2>
        <p className="mt-1 text-sm text-[var(--r-muted)]">Inscris ton restaurant, reçois les commandes et les réservations, gère ton équipe et tes livreurs.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/dashboard" className="inline-flex min-h-12 items-center rounded-full bg-emerald-700 px-5 text-sm font-extrabold text-white">J&apos;ai un restaurant</Link>
          <Link href="/livreur" className="inline-flex min-h-12 items-center rounded-full border-2 border-[var(--r-brand)] px-5 text-sm font-extrabold text-[var(--r-brand)]">Je suis livreur</Link>
          <Link href="/rejoindre" className="inline-flex min-h-12 items-center rounded-full bg-stone-200 px-5 text-sm font-extrabold text-stone-900">J&apos;ai un lien d&apos;équipe</Link>
        </div>
      </section>
    </ClientShell>
  );
}
