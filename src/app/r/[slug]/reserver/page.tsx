import type { Metadata } from "next";
import ClosedBanner from "@/components/branding/ClosedBanner";
import HelpHint from "@/components/branding/HelpHint";
import { getRestaurant } from "@/lib/site/data";
import { waLink } from "@/lib/site/safe";
import ReserveClient from "../_components/ReserveClient";

export const metadata: Metadata = { title: "Réserver une table" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) return <ClosedBanner />;
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold">Réserver une table</h1>
      <HelpHint id="reserver" helpTopic="reserver" text="Choisis le jour et le nombre de personnes : nous t'affichons les créneaux libres. Pas besoin de compte, seulement ton nom et ton téléphone." />
      <ReserveClient restaurantId={r.id} name={r.name} waBase={waLink(r.whatsapp ?? r.phone) ?? ""} />
    </main>
  );
}
