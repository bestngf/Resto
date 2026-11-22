import type { Metadata } from "next";
import type { ReactNode } from "react";
import ThemeProvider from "@/components/branding/ThemeProvider";
import SiteNav from "@/components/branding/SiteNav";
import ClosedBanner from "@/components/branding/ClosedBanner";
import NgfFooter from "@/components/brand/NgfFooter";
import { getRestaurant } from "@/lib/site/data";
import { restaurantUrl, siteBase } from "@/lib/site/safe";

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) return { title: "Restaurant introuvable", robots: { index: false } };
  const desc = r.slogan || `Menu, commande et réservation chez ${r.name}${r.cuisine ? ` · cuisine ${r.cuisine}` : ""}.`;
  return {
    metadataBase: new URL(siteBase()),
    title: { default: r.name, template: `%s · ${r.name}` },
    description: desc,
    alternates: { canonical: restaurantUrl(slug) },
    openGraph: { title: r.name, description: desc, url: restaurantUrl(slug), siteName: r.name, type: "website", locale: "fr_FR" },
    twitter: { card: "summary_large_image", title: r.name, description: desc },
  };
}

export default async function Layout({ children, params }: P & { children: ReactNode }) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  // La base ne montre au public que les restaurants « actifs » : sinon, message poli.
  if (!r || r.status !== "actif") return <ClosedBanner />;
  const canOrder = r.accepts_dine_in || r.accepts_takeaway || r.accepts_delivery;
  return (
    <ThemeProvider primary={r.primary_color} secondary={r.secondary_color}>
      {children}
      <NgfFooter />
      <SiteNav slug={slug} canOrder={canOrder} />
    </ThemeProvider>
  );
}
