import { ImageResponse } from "next/og";
import { getRestaurant } from "@/lib/site/data";
import { safeHex, safeUrl } from "@/lib/site/safe";
import { readableOn } from "@/components/branding/contrast";

export const alt = "Aperçu du restaurant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

// Image de partage (WhatsApp / Facebook) générée à partir de l'identité du restaurant. Gratuit : next/og.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  const brand = safeHex(r?.primary_color, "#c2410c"), fg = readableOn(brand);
  const cover = safeUrl(r?.cover_url);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: brand, color: fg }}>
        {cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={cover} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
        {cover && <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,.15))" }} />}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 64, width: "100%", color: cover ? "#ffffff" : fg }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>{r?.name ?? "Restaurant"}</div>
          {(r?.slogan || r?.cuisine) && <div style={{ display: "flex", marginTop: 16, fontSize: 40 }}>{r?.slogan || `Cuisine ${r?.cuisine}`}</div>}
          <div style={{ display: "flex", marginTop: 28, fontSize: 30, opacity: 0.9 }}>Menu · Commande · Réservation{r?.address ? ` · ${r.address}` : ""}</div>
        </div>
      </div>
    ),
    size,
  );
}
