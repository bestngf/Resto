import Link from "next/link";
import Hero from "@/components/branding/Hero";
import Hours from "@/components/branding/Hours";
import Reviews from "@/components/branding/Reviews";
import ShareBar from "@/components/branding/ShareBar";
import ClosedBanner from "@/components/branding/ClosedBanner";
import { getHours, getRestaurant, getReviews } from "@/lib/site/data";
import { openNow } from "@/lib/site/hours";
import { mapsLink, restaurantUrl, waLink } from "@/lib/site/safe";

export const revalidate = 60; // page en cache 1 minute : rapide même en connexion faible

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) return <ClosedBanner />;
  const [hours, reviews] = await Promise.all([getHours(r.id), getReviews(r.id)]);
  const status = openNow(hours);
  const canOrder = r.accepts_dine_in || r.accepts_takeaway || r.accepts_delivery;
  const card = "r-rise flex min-h-16 items-center justify-between rounded-2xl p-4 text-lg font-semibold";
  const wa = waLink(r.whatsapp ?? r.phone);
  return (
    <>
      <Hero r={r} status={status} />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-6">
        <section className="grid gap-3 sm:grid-cols-2" aria-label="Actions">
          {canOrder && <Link href={`/r/${slug}/menu`} className={`${card} bg-[var(--brand)] text-[var(--on-brand)]`}>Voir le menu et commander <span aria-hidden>→</span></Link>}
          <Link href={`/r/${slug}/reserver`} className={`${card} bg-[var(--brand2)] text-[var(--on-brand2)]`}>Réserver une table <span aria-hidden>→</span></Link>
        </section>
        {!canOrder && <p className="rounded-2xl bg-[var(--brand-soft)] p-4 text-sm">La commande en ligne n&apos;est pas encore ouverte. Tu peux consulter le menu, réserver ou écrire sur WhatsApp.</p>}
        <section aria-labelledby="h-hours"><h2 id="h-hours" className="mb-3 text-xl font-bold">Horaires</h2><Hours hours={hours} /></section>
        <section aria-labelledby="h-where">
          <h2 id="h-where" className="mb-3 text-xl font-bold">Où nous trouver</h2>
          <p>{r.address ?? "Adresse bientôt disponible"}</p>
          {r.landmark && <p className="text-neutral-600">Repère : {r.landmark}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <a className="inline-flex min-h-12 items-center rounded-2xl border-2 border-[var(--brand)] px-5 font-semibold text-[var(--brand-text)]" href={mapsLink(r)} target="_blank" rel="noopener noreferrer">Y aller</a>
            {wa && <a className="inline-flex min-h-12 items-center rounded-2xl border-2 border-neutral-300 px-5 font-semibold" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          </div>
        </section>
        <section aria-labelledby="h-rev"><h2 id="h-rev" className="mb-3 text-xl font-bold">Avis</h2><Reviews reviews={reviews} /></section>
        <section aria-labelledby="h-share"><h2 id="h-share" className="mb-3 text-xl font-bold">Partager</h2><ShareBar url={restaurantUrl(slug)} name={r.name} /></section>
        <footer className="pt-4 text-center text-xs text-neutral-500">Site créé avec Resto · NGF</footer>
      </main>
    </>
  );
}
