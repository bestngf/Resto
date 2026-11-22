// Configuration PUBLIQUE du site : aucune variable d'environnement à régler sur Netlify.
// Ces deux valeurs sont faites pour être visibles dans le navigateur (la sécurité repose sur les règles RLS de la base).
// Ne JAMAIS mettre ici une clé "service_role" ou "secret".
export const SUPABASE_URL = "https://dzexnotznapokxrfjnkq.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZXhub3R6bmFwb2t4cmZqbmtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4Njk0NzksImV4cCI6MjEwODQ0NTQ3OX0.Ax_XEwOOhxBTkHR0W6jOkn0JjRRq279CZXmepdKIpx4";
// Fonction serveur Supabase (commandes, paiement, réservations). Elle garde elle-même ses clés secrètes.
export const API_URL = SUPABASE_URL + "/functions/v1/resto-api";

// Contact du support (centre d'aide). Laisser vide masque les boutons correspondants.
export const SUPPORT_WHATSAPP_NUMBER = "";
export const SUPPORT_EMAIL_ADDRESS = "";

// Adresse du site : celle du navigateur ; côté serveur, l'adresse que Netlify fournit tout seul (variable système URL).
export function siteOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  const u = typeof process !== "undefined" ? process.env.URL || process.env.DEPLOY_PRIME_URL : "";
  return (u || "").replace(/\/$/, "");
}
