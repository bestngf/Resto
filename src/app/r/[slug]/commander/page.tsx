import type { Metadata } from "next";
import ClosedBanner from "@/components/branding/ClosedBanner";
import HelpHint from "@/components/branding/HelpHint";
import { getRestaurant, getZones } from "@/lib/site/data";
import CheckoutClient from "../_components/CheckoutClient";

export const metadata: Metadata = { title: "Commander" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) return <ClosedBanner />;
  const zones = r.accepts_delivery ? await getZones(r.id) : [];
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold">Ma commande</h1>
      <HelpHint id="commander" helpTopic="commander" text="Vérifie ton panier, choisis comment tu veux être servi, puis envoie. Tu peux payer en espèces ; le paiement mobile money arrive bientôt." />
      <CheckoutClient restaurant={{ id: r.id, slug, name: r.name, currency: r.currency || "FCFA", dineIn: r.accepts_dine_in, takeaway: r.accepts_takeaway, delivery: r.accepts_delivery }} zones={zones} />
    </main>
  );
}
