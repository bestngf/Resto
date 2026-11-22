"use client";
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "./supabase/client";
import { readCache, writeCache } from "./cache";
import type { Restaurant } from "./types";

const CACHE_KEY = "resto:restaurants:v1";
const COLUMNS =
  "id,slug,name,cuisine,phone,whatsapp,address,landmark,latitude,longitude,logo_url,cover_url,primary_color,secondary_color,currency,accepts_dine_in,accepts_takeaway,accepts_delivery,resto_opening_hours(weekday,opens,closes,closed)";

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data, error: err } = await getSupabase()
        .from("resto_restaurants")
        .select(COLUMNS)
        .eq("status", "actif")
        .order("name");
      if (err) throw err;
      const list = (data ?? []) as unknown as Restaurant[];
      setRestaurants(list);
      setFromCache(false);
      writeCache(CACHE_KEY, list);
    } catch {
      const cached = readCache<Restaurant[]>(CACHE_KEY);
      if (cached) {
        setRestaurants(cached);
        setFromCache(true);
      } else {
        setError("Impossible de charger les restaurants. Vérifie ta connexion puis réessaie.");
      }
    }
  }, []);

  useEffect(() => {
    // Affiche tout de suite la dernière liste connue, puis rafraîchit.
    const cached = readCache<Restaurant[]>(CACHE_KEY);
    if (cached) setRestaurants(cached);
    load();
  }, [load]);

  return { restaurants, error, fromCache, reload: load };
}
