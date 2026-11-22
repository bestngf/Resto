"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ClientShell from "@/components/layout/ClientShell";
import HelpBubble from "@/components/ui/HelpBubble";
import HelpButton from "@/components/ui/HelpButton";
import FavoriteButton from "@/components/restaurants/FavoriteButton";
import Skeleton from "@/components/ui/Skeleton";
import { getSupabase } from "@/lib/supabase/client";
import { readCache, writeCache } from "@/lib/cache";
import { addToCart, cartCount, cartTotal, useCarts } from "@/lib/cart/cart";
import { directionsUrl, formatFcfa, isOpenNow, readableText } from "@/lib/format";
import type { Category, MenuItem, Restaurant } from "@/lib/types";

type Data = { restaurant: Restaurant; categories: Category[]; items: MenuItem[] };

export default function FicheRestaurant() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const carts = useCarts();
  const cacheKey = `resto:menu:${slug}`;

  const load = useCallback(async () => {
    setError(null);
    try {
      const sb = getSupabase();
      const { data: r, error: e1 } = await sb
        .from("resto_restaurants")
        .select("id,slug,name,cuisine,phone,whatsapp,address,landmark,latitude,longitude,logo_url,cover_url,primary_color,secondary_color,currency,accepts_dine_in,accepts_takeaway,accepts_delivery,resto_opening_hours(weekday,opens,closes,closed)")
        .eq("slug", slug)
        .maybeSingle();
      if (e1) throw e1;
      if (!r) { setError("Ce restaurant n'est pas disponible pour le moment."); return; }
      const restaurant = r as unknown as Restaurant;
      const [c, m] = await Promise.all([
        sb.from("resto_categories").select("id,restaurant_id,name,sort").eq("restaurant_id", restaurant.id).order("sort"),
        sb.from("resto_menu_items").select("id,restaurant_id,category_id,name,description,price_fcfa,photo_url,available,options,sort").eq("restaurant_id", restaurant.id).order("sort"),
      ]);
      if (c.error) throw c.error;
      if (m.error) throw m.error;
      const next = { restaurant, categories: (c.data ?? []) as Category[], items: (m.data ?? []) as MenuItem[] };
      setData(next); setOffline(false); writeCache(cacheKey, next);
    } catch {
      const cached = readCache<Data>(cacheKey);
      if (cached) { setData(cached); setOffline(true); }
      else setError("Impossible de charger le menu. Vérifie ta connexion puis réessaie.");
    }
  }, [slug, cacheKey]);

  useEffect(() => {
    const cached = readCache<Data>(cacheKey);
    if (cached) setData(cached);
    load();
  }, [load, cacheKey]);

  const sections = useMemo(() => {
    if (!data) return [];
    const known = new Set(data.categories.map((c) => c.id));
    const out = data.categories.map((c) => ({ id: c.id, name: c.name, items: data.items.filter((i) => i.category_id === c.id) }));
    const others = data.items.filter((i) => !i.category_id || !known.has(i.category_id));
    if (others.length) out.push({ id: "autres", name: "Autres", items: others });
    return out.filter((s) => s.items.length > 0);
  }, [data]);

  if (error) {
    return (
      <ClientShell>
        <div role="alert" className="rounded-2xl border border-[var(--r-line)] bg-white p-6 text-center">
          <p className="font-semibold">{error}</p>
          <div className="mt-3 flex justify-center gap-2">
            <button type="button" onClick={load} className="min-h-11 rounded-xl bg-[var(--r-brand)] px-4 text-sm font-semibold text-[var(--r-brand-ink)]">Réessayer</button>
            <Link href="/" className="inline-flex min-h-11 items-center rounded-xl border border-[var(--r-line)] px-4 text-sm font-medium">Voir les restaurants</Link>
          </div>
        </div>
      </ClientShell>
    );
  }

  if (!data) {
    return (
      <ClientShell>
        <div className="space-y-4" aria-busy="true"><Skeleton className="h-40" /><Skeleton className="h-8 w-2/3" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      </ClientShell>
    );
  }

  const { restaurant: r } = data;
  const open = isOpenNow(r.resto_opening_hours);
  const brand = r.primary_color ?? "#0e6b4a";
  const cart = carts[r.id];
  const count = cartCount(cart);
  const wa = r.whatsapp ? `https://wa.me/${r.whatsapp.replace(/\D/g, "")}` : null;

  return (
    <ClientShell>
      <div style={{ ["--r-brand" as string]: brand, ["--r-brand-ink" as string]: readableText(brand) }}>
        <Link href="/" className="mb-3 inline-flex min-h-11 items-center text-sm font-medium text-[var(--r-muted)]">‹ Restaurants</Link>
        <div className="h-40 overflow-hidden rounded-2xl bg-[var(--r-brand)]">
          {r.cover_url && <img src={r.cover_url} alt="" decoding="async" className="h-full w-full object-cover" />}
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{r.name}</h1>
            <p className="text-sm text-[var(--r-muted)]">{[r.cuisine, r.address].filter(Boolean).join(" – ")}</p>
            {r.landmark && <p className="text-sm text-[var(--r-muted)]">{r.landmark}</p>}
          </div>
          {open !== null && <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${open ? "bg-[#d9f2e5] text-[#0b5a3d]" : "bg-[#eceeed] text-[var(--r-muted)]"}`}>{open ? "Ouvert" : "Fermé"}</span>}
        </div>

        {offline && <p role="status" className="mt-3 rounded-xl bg-[#fff4cc] p-3 text-sm">Pas de connexion : voici le dernier menu enregistré.<button type="button" onClick={load} className="ml-2 font-semibold underline">Réessayer</button></p>}

        <div className="mt-3 flex flex-wrap gap-2">
          {r.latitude != null && r.longitude != null && <a href={directionsUrl(r.latitude, r.longitude)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-xl bg-[var(--r-brand)] px-4 text-sm font-semibold text-[var(--r-brand-ink)]">Y aller</a>}
          <Link href={`/r/${r.slug}`} className="inline-flex min-h-11 items-center rounded-xl border border-[var(--r-line)] bg-white px-4 text-sm font-medium">Voir le site</Link>
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-xl border border-[var(--r-line)] bg-white px-4 text-sm font-medium">WhatsApp</a>}
          <FavoriteButton restaurantId={r.id} />
          <HelpButton topic="client-commander" />
        </div>

        <HelpBubble id="client-menu" title="Compose ton panier">Appuie sur « Ajouter » à côté d&apos;un plat. Ton panier est gardé même sans connexion.</HelpBubble>

        {sections.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--r-line)] bg-white p-6 text-center">
            <p className="font-semibold">Le menu n&apos;est pas encore en ligne</p>
            <p className="mt-1 text-sm text-[var(--r-muted)]">Reviens plus tard ou contacte le restaurant.</p>
          </div>
        ) : sections.map((s) => (
          <section key={s.id} className="mt-6">
            <h2 className="mb-2 text-lg font-semibold">{s.name}</h2>
            <ul className="space-y-3">
              {s.items.map((it) => (
                <li key={it.id} className="flex gap-3 rounded-2xl border border-[var(--r-line)] bg-white p-3">
                  {it.photo_url && <img src={it.photo_url} alt="" loading="lazy" decoding="async" className="h-20 w-20 shrink-0 rounded-xl object-cover" />}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{it.name}</h3>
                    {it.description && <p className="line-clamp-2 text-sm text-[var(--r-muted)]">{it.description}</p>}
                    <p className="mt-1 font-semibold">{formatFcfa(it.price_fcfa)}</p>
                  </div>
                  {it.available ? (
                    <button type="button" onClick={() => addToCart(r, it)} aria-label={`Ajouter ${it.name} au panier`} className="self-center min-h-11 rounded-xl bg-[var(--r-brand)] px-4 text-sm font-semibold text-[var(--r-brand-ink)] active:scale-95">Ajouter</button>
                  ) : (
                    <span className="self-center text-xs font-medium text-[var(--r-muted)]">Indisponible aujourd&apos;hui</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}

        {count > 0 && (
          <Link href="/commande" className="r-pop fixed inset-x-4 bottom-20 z-30 mx-auto flex max-w-2xl items-center justify-between rounded-2xl bg-[var(--r-brand)] px-4 py-3 font-semibold text-[var(--r-brand-ink)] shadow-lg">
            <span>Voir mon panier ({count})</span><span>{formatFcfa(cartTotal(cart))}</span>
          </Link>
        )}
      </div>
    </ClientShell>
  );
}
