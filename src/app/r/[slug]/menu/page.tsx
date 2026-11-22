import type { Metadata } from "next";
import ClosedBanner from "@/components/branding/ClosedBanner";
import HelpHint from "@/components/branding/HelpHint";
import { getMenu, getRestaurant } from "@/lib/site/data";
import MenuClient from "../_components/MenuClient";

export const metadata: Metadata = { title: "Menu" };
export const revalidate = 30;

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) return <ClosedBanner />;
  const { categories, items } = await getMenu(r.id);
  const canOrder = r.accepts_dine_in || r.accepts_takeaway || r.accepts_delivery;
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold">Menu</h1>
      <HelpHint id="menu" helpTopic="commander" text="Touche « Ajouter » pour remplir ton panier. Les plats grisés ne sont pas disponibles aujourd'hui." />
      <MenuClient slug={slug} currency={r.currency || "FCFA"} canOrder={canOrder} categories={categories} items={items} />
    </main>
  );
}
