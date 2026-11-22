"use client";
import TeamAlert from "@/components/team/TeamAlert";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isManager, useRestaurant } from "./RestaurantProvider";
import { btnPrimary, EmptyState, ErrorBox, ListSkeleton } from "./ui";
import { onQueueChange, queueSize } from "@/lib/orders/offlineQueue";
import type { Role } from "@/lib/dashboard/types";

const NAV: { href: string; label: string; icon: string; roles?: Role[] }[] = [
  { href: "/dashboard", label: "Accueil", icon: "🏠", roles: ["patron", "gerant"] },
  { href: "/dashboard/commandes", label: "Commandes", icon: "🔔" },
  { href: "/dashboard/menus", label: "Menus", icon: "🍲", roles: ["patron", "gerant"] },
  { href: "/dashboard/tables", label: "Tables", icon: "🪑", roles: ["patron", "gerant"] },
  { href: "/dashboard/reservations", label: "Réservations", icon: "📅", roles: ["patron", "gerant"] },
  { href: "/dashboard/livraison", label: "Livraison", icon: "🛵", roles: ["patron", "gerant"] },
  { href: "/dashboard/statistiques", label: "Statistiques", icon: "📊", roles: ["patron", "gerant"] },
  { href: "/dashboard/identite", label: "Identité", icon: "🎨", roles: ["patron", "gerant"] },
  { href: "/dashboard/equipe", label: "Équipe", icon: "👥", roles: ["patron", "gerant"] },
];
const STATUS_LABEL = { brouillon: "Brouillon", actif: "En ligne", ferme: "Fermé", suspendu: "Suspendu" } as const;

export function Shell({ children }: { children: ReactNode }) {
  const { loading, error, restaurant, role, memberships, select, reload } = useRestaurant();
  const path = usePathname() || "";
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    setQueued(queueSize());
    const un = onQueueChange(() => setQueued(queueSize()));
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); un(); };
  }, []);

  const items = NAV.filter((n) => !n.roles || (role && n.roles.includes(role)));
  const section = path.split("/")[2] ?? "accueil";
  const onSignup = path.startsWith("/dashboard/inscription");
  const match = [...NAV].sort((x, y) => y.href.length - x.href.length).find((n) => path === n.href || path.startsWith(`${n.href}/`));
  const allowed = !role || !match?.roles || match.roles.includes(role);

  let body: ReactNode = children;
  if (loading) body = <ListSkeleton />;
  else if (error) body = <ErrorBox message={error} onRetry={reload} />;
  else if (!restaurant && !onSignup)
    body = (
      <EmptyState icon="🍽️" title="Créons votre restaurant"
        text="Il vous faut moins de 5 minutes : un nom, un numéro et l'endroit où vous êtes."
        action={<Link className={btnPrimary} href="/dashboard/inscription">Commencer</Link>} />
    );
  else if (!allowed)
    body = (
      <EmptyState icon="🔒" title="Page réservée au patron ou au gérant"
        text="Votre rôle ne donne pas accès à cette page. Les commandes restent disponibles."
        action={<Link className={btnPrimary} href="/dashboard/commandes">Voir les commandes</Link>} />
    );

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <TeamAlert />
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2">
          <div className="min-w-0">
            {memberships.length > 1 ? (
              <select aria-label="Choisir le restaurant" className="min-h-11 max-w-[60vw] rounded-lg border border-stone-300 bg-white px-2 font-bold"
                value={restaurant?.id} onChange={(e) => select(e.target.value)}>
                {memberships.map((m) => <option key={m.restaurant.id} value={m.restaurant.id}>{m.restaurant.name}</option>)}
              </select>
            ) : (
              <p className="truncate text-lg font-bold">{restaurant?.name ?? "resto"}</p>
            )}
            {restaurant && (
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${restaurant.status === "actif" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
                {STATUS_LABEL[restaurant.status]}
              </span>
            )}
          </div>
          <Link href={`/aide?page=${encodeURIComponent(section)}`} className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-3 text-sm font-semibold hover:bg-stone-50">
            ❓ Besoin d&apos;aide ?
          </Link>
        </div>
        {!onSignup && restaurant && (
          <nav aria-label="Navigation du dashboard" className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2">
            {items.map((n) => {
              const active = n.href === "/dashboard" ? path === n.href : path.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-1 rounded-xl px-3 text-sm font-semibold ${active ? "bg-emerald-700 text-white" : "text-stone-700 hover:bg-stone-100"}`}>
                  <span aria-hidden>{n.icon}</span>{n.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {(!online || queued > 0) && (
        <div role="status" className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-950">
          {!online ? "Connexion coupée : vos actions sont gardées et seront envoyées dès le retour du réseau." : `${queued} changement(s) en cours d'envoi…`}
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-5">{body}</main>
    </div>
  );
}
