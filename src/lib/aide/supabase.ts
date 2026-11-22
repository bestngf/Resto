// Client Supabase anonyme, propre au centre d'aide.
// L'aide est publique : on n'a besoin ni de session ni de cle secrete.
// Seule la cle publique (anon) est utilisee ; la securite repose sur la RLS et sur les
// fonctions resto_help_* (voir supabase/migrations/004_aide.sql).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config/public";

let client: SupabaseClient | null = null;

export function getHelpClient(): SupabaseClient | null {
  if (client) return client;
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
