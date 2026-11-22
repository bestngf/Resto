import type { Metadata } from "next";
import ClosedBanner from "@/components/branding/ClosedBanner";
import { getRestaurant, getTableByToken } from "@/lib/site/data";
import TableWelcome from "../../_components/TableWelcome";

export const metadata: Metadata = { title: "Ma table", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ slug: string; token: string }> }) {
  const { slug, token } = await params;
  const [r, t] = await Promise.all([getRestaurant(slug), getTableByToken(token)]);
  if (!r) return <ClosedBanner />;
  if (!t || (t.restaurant_id && t.restaurant_id !== r.id)) return <ClosedBanner title="QR code non reconnu" text="Ce QR code n'est plus valable. Demande de l'aide à un serveur, ou consulte le menu." />;
  return <TableWelcome slug={slug} name={r.name} table={{ id: t.id, label: t.label }} />;
}
