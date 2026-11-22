// Messages d'erreur humains en français. Jamais de données personnelles dans les logs.
const MAP: Record<string, string> = {
  limite_plats: "Vous avez atteint le nombre de plats prévu par votre formule.",
  limite_tables: "Vous avez atteint le nombre de tables prévu par votre formule.",
  non_autorise: "Vous n'avez pas le droit de faire cette action.",
  transition_invalide: "Cette commande a déjà changé d'état. La liste a été actualisée.",
  commande_introuvable: "Cette commande n'existe plus.",
  paiement_non_confirmable: "Ce paiement ne peut pas être confirmé.",
  restaurant_suspendu: "Ce restaurant est suspendu. Contactez le support.",
  champ_protege: "Ce champ ne peut pas être modifié.",
  non_connecte: "Votre session a expiré. Reconnectez-vous.",
  donnees_invalides: "Certaines informations sont incorrectes.",
};

export function isNetworkError(e: unknown): boolean {
  const m = String((e as { message?: string })?.message ?? e ?? "").toLowerCase();
  return (
    (typeof navigator !== "undefined" && navigator.onLine === false) ||
    m.includes("failed to fetch") || m.includes("networkerror") || m.includes("network request failed") ||
    m.includes("load failed") || m.includes("offline")
  );
}

export function humanError(e: unknown): string {
  if (isNetworkError(e)) return "Pas de connexion pour l'instant. Réessayez dans un moment.";
  const err = e as { message?: string; code?: string };
  const msg = err?.message ?? "";
  for (const k of Object.keys(MAP)) if (msg.includes(k)) return MAP[k];
  if (err?.code === "23505") return "Cette valeur existe déjà.";
  if (err?.code === "42501") return MAP.non_autorise;
  return "Une erreur est survenue. Réessayez, et contactez le support si cela continue.";
}
