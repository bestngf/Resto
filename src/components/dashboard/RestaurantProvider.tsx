"use client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { db } from "@/lib/dashboard/db";
import { humanError } from "@/lib/dashboard/errors";
import type { Restaurant, Role } from "@/lib/dashboard/types";

interface Membership { role: Role; restaurant: Restaurant }
interface Ctx {
  loading: boolean; error: string | null; userId: string | null;
  memberships: Membership[]; restaurant: Restaurant | null; role: Role | null;
  select: (id: string) => void; reload: () => Promise<void>;
}
const RestaurantCtx = createContext<Ctx | null>(null);
export const useRestaurant = () => {
  const c = useContext(RestaurantCtx);
  if (!c) throw new Error("useRestaurant doit être utilisé dans le dashboard.");
  return c;
};
export const isManager = (r: Role | null) => r === "patron" || r === "gerant";
const SEL_KEY = "resto:restaurant";

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [state, setState] = useState<{ loading: boolean; error: string | null; userId: string | null; memberships: Membership[] }>(
    { loading: true, error: null, userId: null, memberships: [] }
  );
  const [selected, setSelected] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const { data: auth } = await db().auth.getUser();
      if (!auth.user) { router.replace(`/connexion?next=${encodeURIComponent(path || "/dashboard")}`); return; }
      const { data, error } = await db()
        .from("resto_restaurant_members")
        .select("role, restaurant:resto_restaurants(id,slug,name,cuisine,phone,whatsapp,address,landmark,latitude,longitude,logo_url,cover_url,primary_color,secondary_color,currency,status,accepts_dine_in,accepts_takeaway,accepts_delivery,merchant_status,owner_id,created_at)")
        .eq("user_id", auth.user.id).eq("status", "actif");
      if (error) throw error;
      const memberships = ((data ?? []) as unknown as Membership[]).filter((m) => m.restaurant);
      if (memberships.length > 0 && memberships.every((m) => m.role === "livreur")) { router.replace("/livreur"); return; }
      setState({ loading: false, error: null, userId: auth.user.id, memberships });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: humanError(e) }));
    }
  }, [router, path]);

  useEffect(() => {
    try { setSelected(localStorage.getItem(SEL_KEY)); } catch { /* ignoré */ }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = useCallback((id: string) => {
    setSelected(id);
    try { localStorage.setItem(SEL_KEY, id); } catch { /* ignoré */ }
  }, []);

  const value = useMemo<Ctx>(() => {
    const current = state.memberships.find((m) => m.restaurant.id === selected) ?? state.memberships[0] ?? null;
    return {
      ...state, select, reload,
      restaurant: current?.restaurant ?? null, role: current?.role ?? null,
    };
  }, [state, selected, select, reload]);

  return <RestaurantCtx.Provider value={value}>{children}</RestaurantCtx.Provider>;
}
