const M: Record<string, string> = {
  limite_reservations: "Ce restaurant ne peut plus prendre de réservations en ligne ce mois-ci. Contacte-le par WhatsApp.",
  limite_plats: "Le menu de ce restaurant est momentanément indisponible.",
  limite_tables: "Cette table n'est pas disponible.",
  contact_requis: "Indique ton nom et un numéro de téléphone valide.",
  trop_de_requetes: "Trop de demandes en peu de temps. Réessaie dans quelques minutes.",
  plat_indisponible: "Un plat de ton panier n'est plus disponible. Retire-le et réessaie.",
  minimum_non_atteint: "Le minimum de commande pour la livraison n'est pas atteint.",
  mode_indisponible: "Ce mode de commande n'est pas proposé par ce restaurant.",
  restaurant_indisponible: "Ce restaurant n'accepte pas de commandes pour le moment.",
  adresse_requise: "Indique un repère, une adresse ou ta position pour la livraison.",
  paiement_indisponible: "Le paiement mobile money est momentanément indisponible. Tu peux payer en espèces.",
  creneau_indisponible: "Ce créneau vient d'être pris. Choisis-en un autre.",
  paiement_introuvable: "Le paiement n'a pas été retrouvé. Réessaie ou choisis les espèces.",
};
/** Messages humains en français. Ne renvoie jamais de données personnelles. */
export function humanError(e: unknown): string {
  const msg = String((e as { message?: string })?.message ?? "");
  for (const k of Object.keys(M)) if (msg.includes(k)) return M[k];
  if (/jwt|auth|permission|row-level/i.test(msg)) return "Ce restaurant n'accepte pas encore les demandes sans compte. Contacte-le par WhatsApp.";
  return "Oups, ça n'a pas marché. Vérifie ta connexion puis réessaie.";
}
