"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { useRestaurant } from "@/components/dashboard/RestaurantProvider";
import { btnPrimary, EmptyState, ListSkeleton } from "@/components/dashboard/ui";
import type { Role } from "@/lib/team/types";

/** Garde d'accès réutilisable : <RoleGuard allow={["patron","gerant"]}>…</RoleGuard>. Les règles de la base restent la vraie protection. */
export default function RoleGuard({ allow, children, fallback }: { allow: Role[]; children: ReactNode; fallback?: ReactNode }) {
  const { role, loading } = useRestaurant();
  if (loading) return <ListSkeleton rows={2} />;
  if (role && allow.includes(role)) return <>{children}</>;
  return <>{fallback ?? (
    <EmptyState icon="🔒" title="Cette page est réservée" text="Votre rôle ne donne pas accès à cette page. Les commandes restent disponibles."
      action={<Link className={btnPrimary} href="/dashboard/commandes">Voir les commandes</Link>} />
  )}</>;
}
