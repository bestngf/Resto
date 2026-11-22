"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRestaurant } from "@/components/dashboard/RestaurantProvider";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import { playRing } from "@/lib/orders/alert";
import { isManagerRole } from "@/lib/team/roles";
import "./team.css";

/**
 * Alerte « nouvelle demande d'équipe » pour le patron/gérant, visible sur TOUS les onglets du dashboard.
 * À poser une fois dans le Shell : <TeamAlert />. Sonne si le service est démarré (même son que les commandes).
 * Pour un badge sur l'onglet Équipe : const n = usePendingRequests(restaurant.id, isManager).
 */
export default function TeamAlert() {
  const { restaurant, role } = useRestaurant();
  const [fresh, setFresh] = useState(false);
  const enabled = isManagerRole(role);
  const count = usePendingRequests(restaurant?.id ?? null, enabled, () => { playRing(); setFresh(true); });
  useEffect(() => { if (!fresh) return; const t = setTimeout(() => setFresh(false), 12000); return () => clearTimeout(t); }, [fresh]);
  if (!enabled || !fresh || count === 0) return null;
  return (
    <div role="status" aria-live="polite" className="team-fade fixed inset-x-4 top-3 z-50 mx-auto max-w-md rounded-2xl bg-emerald-800 px-4 py-3 text-white shadow-lg">
      <p className="font-semibold">👥 Nouvelle demande pour rejoindre l&apos;équipe</p>
      <div className="mt-2 flex gap-2">
        <Link href="/dashboard/equipe" onClick={() => setFresh(false)} className="inline-flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-semibold text-emerald-900">Voir la demande</Link>
        <button type="button" onClick={() => setFresh(false)} className="min-h-11 rounded-xl px-3 text-sm font-semibold underline">Plus tard</button>
      </div>
    </div>
  );
}
