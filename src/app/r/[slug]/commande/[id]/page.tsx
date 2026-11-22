import type { Metadata } from "next";
import ClosedBanner from "@/components/branding/ClosedBanner";
import { getRestaurant } from "@/lib/site/data";
import { waLink } from "@/lib/site/safe";
import ConfirmClient from "../../_components/ConfirmClient";

export const metadata: Metadata = { title: "Commande envoyée", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const r = await getRestaurant(slug);
  if (!r) return <ClosedBanner />;
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <ConfirmClient slug={slug} id={id} name={r.name} currency={r.currency || "FCFA"} hasWhatsApp={!!waLink(r.whatsapp ?? r.phone)} waBase={waLink(r.whatsapp ?? r.phone) ?? ""} />
    </main>
  );
}
