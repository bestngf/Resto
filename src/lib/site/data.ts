import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config/public";
import type { SiteCategory, SiteHour, SiteItem, SiteRestaurant, SiteReview, SiteZone } from "./types";

// Lectures PUBLIQUES côté serveur, avec la clé anonyme uniquement : la RLS (agent 1) décide de ce qui est visible.
const sb = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

export const getRestaurant = cache(async (slug: string): Promise<SiteRestaurant | null> => {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const { data } = await sb().from("resto_restaurants").select("*").eq("slug", slug).maybeSingle();
  return (data as SiteRestaurant) ?? null;
});
export const getHours = cache(async (id: string): Promise<SiteHour[]> => {
  const { data } = await sb().from("resto_opening_hours").select("weekday,opens,closes,closed").eq("restaurant_id", id).order("weekday");
  return (data as SiteHour[]) ?? [];
});
export const getMenu = cache(async (id: string): Promise<{ categories: SiteCategory[]; items: SiteItem[] }> => {
  const c = sb();
  const [cats, items] = await Promise.all([
    c.from("resto_categories").select("id,name,sort").eq("restaurant_id", id).eq("active", true).order("sort"),
    c.from("resto_menu_items").select("id,name,description,price_fcfa,photo_url,category_id,available,sort").eq("restaurant_id", id).eq("active", true).order("sort"),
  ]);
  return { categories: (cats.data as SiteCategory[]) ?? [], items: (items.data as SiteItem[]) ?? [] };
});
export const getReviews = cache(async (id: string): Promise<SiteReview[]> => {
  const { data } = await sb().from("resto_reviews").select("id,rating,comment,created_at").eq("restaurant_id", id).order("created_at", { ascending: false }).limit(20);
  return (data as SiteReview[]) ?? [];
});
export const getZones = cache(async (id: string): Promise<SiteZone[]> => {
  const { data } = await sb().from("resto_delivery_zones").select("id,name,fee_fcfa,min_order_fcfa").eq("restaurant_id", id).eq("active", true).order("name");
  return (data as SiteZone[]) ?? [];
});
export async function getTableByToken(token: string): Promise<{ id: string; label: string; restaurant_id?: string } | null> {
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(token)) return null;
  const { data, error } = await sb().rpc("resto_table_by_token", { p_token: token });
  if (error || !data) return null;
  const t = ((data as Record<string, unknown>).table ?? data) as Record<string, unknown>;
  return t.id ? { id: String(t.id), label: String(t.label ?? ""), restaurant_id: t.restaurant_id ? String(t.restaurant_id) : undefined } : null;
}
