"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/useSession";

export default function FavoriteButton({ restaurantId }: { restaurantId: string }) {
  const { user, ready } = useSession();
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    getSupabase().from("resto_favorites").select("restaurant_id", { head: true, count: "exact" }).eq("restaurant_id", restaurantId)
      .then(({ count }) => setFav((count ?? 0) > 0));
  }, [user, restaurantId]);

  if (!ready) return null;
  const cls = "inline-flex min-h-11 items-center rounded-xl border border-[var(--r-line)] bg-white px-4 text-sm font-medium";
  if (!user) return <Link href={`/connexion?next=${encodeURIComponent(window.location.pathname)}`} className={cls}>♡ Favori</Link>;

  async function toggle() {
    setBusy(true);
    const sb = getSupabase();
    const prev = fav;
    setFav(!prev);
    const { error } = prev
      ? await sb.from("resto_favorites").delete().eq("restaurant_id", restaurantId)
      : await sb.from("resto_favorites").insert({ restaurant_id: restaurantId });
    if (error) setFav(prev);
    setBusy(false);
  }
  return <button type="button" aria-pressed={fav} disabled={busy} onClick={toggle} className={cls}>{fav ? "♥ Favori" : "♡ Favori"}</button>;
}
