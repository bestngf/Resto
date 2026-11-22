"use client";
// Client Supabase navigateur : le MÊME que l'espace client, pour que la connexion soit partagée (une seule session).
import { getSupabase } from "@/lib/supabase/client";

export function db() {
  return getSupabase();
}

/** Retourne les données ou lève l'erreur Supabase (pour try/catch). */
export function must<T>(res: { data: T | null; error: unknown }): T {
  if (res.error) throw res.error;
  return res.data as T;
}
