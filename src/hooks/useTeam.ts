"use client";
import { useEffect, useRef } from "react";
import { db } from "@/lib/dashboard/db";
import { useLoad } from "@/lib/dashboard/useLoad";
import { loadTeam } from "@/lib/team/api";

const EMPTY = { requests: [], members: [] };
/** Équipe en direct : les demandes arrivent à l'écran sans recharger (Realtime déjà activé sur resto_staff_requests). */
export function useTeam(restaurantId: string | null, onNewRequest?: () => void) {
  const cb = useRef(onNewRequest); cb.current = onNewRequest;
  const state = useLoad(() => (restaurantId ? loadTeam(restaurantId) : Promise.resolve(EMPTY)), [restaurantId]);
  const reload = useRef(state.reload); reload.current = state.reload;
  useEffect(() => {
    if (!restaurantId) return;
    const ch = db().channel(`team:${restaurantId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "resto_staff_requests", filter: `restaurant_id=eq.${restaurantId}` },
        (p) => { if (p.eventType === "INSERT") cb.current?.(); reload.current(); })
      .subscribe();
    // filet de sécurité si la connexion temps réel est faible : actualisation douce toutes les minutes
    const t = setInterval(() => { if (document.visibilityState === "visible") reload.current(); }, 60000);
    return () => { clearInterval(t); db().removeChannel(ch); };
  }, [restaurantId]);
  return state;
}
