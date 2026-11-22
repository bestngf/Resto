"use client";
// Commandes du restaurant en direct (Supabase Realtime) avec rattrapage après coupure
// et relève par interrogation légère quand la connexion est faible.
import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/lib/dashboard/db";
import { humanError } from "@/lib/dashboard/errors";
import type { Order } from "@/lib/dashboard/types";

export type LinkState = "live" | "weak" | "offline";
const SELECT = "*, resto_order_items(*), resto_tables(label)";

export function useRealtimeOrders(restaurantId: string | null, onNew?: (o: Order) => void) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<LinkState>("weak");
  const seen = useRef<Set<string>>(new Set());
  const firstLoad = useRef(true);
  const onNewRef = useRef(onNew);
  onNewRef.current = onNew;

  const announce = useCallback((o: Order) => {
    if (!seen.current.has(o.id)) {
      seen.current.add(o.id);
      if (!firstLoad.current && o.status === "recue") onNewRef.current?.(o);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    if (!restaurantId) return;
    const since = new Date(Date.now() - 36 * 3600 * 1000).toISOString();
    const { data, error } = await db()
      .from("resto_orders").select(SELECT)
      .eq("restaurant_id", restaurantId).gte("created_at", since)
      .order("created_at", { ascending: false }).limit(300);
    if (error) { setError(humanError(error)); setLoading(false); return; }
    const list = (data ?? []) as unknown as Order[];
    // les commandes arrivées pendant une coupure sont annoncées comme nouvelles
    [...list].reverse().forEach(announce);
    firstLoad.current = false;
    setOrders(list);
    setError(null);
    setLoading(false);
  }, [restaurantId, announce]);

  const fetchOne = useCallback(async (id: string) => {
    const { data } = await db().from("resto_orders").select(SELECT).eq("id", id).maybeSingle();
    if (!data) return;
    const o = data as unknown as Order;
    announce(o);
    setOrders((prev) => (prev.some((p) => p.id === o.id) ? prev.map((p) => (p.id === o.id ? o : p)) : [o, ...prev]));
  }, [announce]);

  /** Mise à jour immédiate à l'écran, avant la confirmation du serveur. */
  const patchLocal = useCallback((id: string, patch: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  useEffect(() => {
    if (!restaurantId) return;
    seen.current = new Set();
    firstLoad.current = true;
    setLoading(true);
    fetchAll();

    let wasDown = false;
    const channel = db()
      .channel(`orders:${restaurantId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "resto_orders", filter: `restaurant_id=eq.${restaurantId}` },
        (p) => {
          const row = (p.new ?? {}) as { id?: string };
          if (row.id) fetchOne(row.id);
        })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setLink("live");
          if (wasDown) fetchAll(); // rattrapage après coupure
          wasDown = false;
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          wasDown = true;
          setLink(navigator.onLine ? "weak" : "offline");
        }
      });

    const goOffline = () => { wasDown = true; setLink("offline"); };
    const goOnline = () => { setLink("weak"); fetchAll(); };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    const onVisible = () => { if (document.visibilityState === "visible") fetchAll(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      document.removeEventListener("visibilitychange", onVisible);
      db().removeChannel(channel);
    };
  }, [restaurantId, fetchAll, fetchOne]);

  // Relève de secours toutes les 30 s tant que le direct n'est pas établi.
  useEffect(() => {
    if (link === "live" || !restaurantId) return;
    const t = setInterval(() => { if (navigator.onLine) fetchAll(); }, 30000);
    return () => clearInterval(t);
  }, [link, restaurantId, fetchAll]);

  return { orders, loading, error, link, refresh: fetchAll, patchLocal };
}
