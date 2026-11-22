"use client";
import { useRestaurant } from "@/components/dashboard/RestaurantProvider";
import { isManagerRole } from "@/lib/team/roles";
import type { Role } from "@/lib/team/types";

/** Rôle de l'utilisateur dans le restaurant choisi + la liste de ses restaurants. À utiliser dans le dashboard. */
export function useMyRole() {
  const { role, restaurant, memberships, loading, userId } = useRestaurant();
  return {
    role, loading, userId,
    restaurantId: restaurant?.id ?? null,
    isManager: isManagerRole(role),
    can: (allowed: Role[]) => !!role && allowed.includes(role),
    restaurants: memberships.map((m) => ({ id: m.restaurant.id, name: m.restaurant.name, role: m.role })),
  };
}
