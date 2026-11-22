"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/lib/dashboard/db";

/** Nombre de demandes d'équipe en attente (pour un badge « Équipe ») + alerte à chaque nouvelle demande. */
export function usePendingRequests(restaurantId: string | null, enabled: boolean, onNew?: () => void) {
  const [count, setCount] = useState(0);
  const cb = useRef(onNew); cb.current = onNew;
  const refresh = useCallback(async () => {
    if (!restaurantId || !enabled) return;
    const { count: c } = await db().from("resto_staff_requests").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId).eq("status", "en_attente");
    setCount(c ?? 0);
  }, [restaurantId, enabled]);
  useEffect(() => {
    if (!restaurantId || !enabled) { setCount(0); return; }
    refresh();
    const ch = db().channel(`pending:${restaurantId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "resto_staff_requests", filter: `restaurant_id=eq.${restaurantId}` },
        (p) => { if (p.eventType === "INSERT") cb.current?.(); refresh(); })
      .subscribe();
    const t = setInterval(() => { if (document.visibilityState === "visible") refresh(); }, 90000);
    return () => { clearInterval(t); db().removeChannel(ch); };
  }, [restaurantId, enabled, refresh]);
  return count;
}
