// Messages humains pour les codes d'erreur renvoyés par la base (voir docs/BASE.md).
const MESSAGES: Record<string, string> = {
  non_connecte: "Connecte-toi pour commander.",
  restaurant_indisponible: "Ce restaurant n'accepte pas de commandes pour le moment.",
  mode_indisponible: "Ce mode de commande n'est pas proposé par ce restaurant.",
  donnees_invalides: "Certaines informations sont incorrectes. Vérifie ta commande.",
  panier_invalide: "Ton panier est vide ou invalide.",
  trop_de_commandes: "Tu as passé beaucoup de commandes en peu de temps. Réessaie dans un moment.",
  table_invalide: "Cette table n'est pas valide. Scanne à nouveau le QR code de ta table.",
  zone_invalide: "Choisis une zone de livraison.",
  adresse_requise: "Indique une adresse, un repère ou ta position pour la livraison.",
  plat_indisponible: "Un plat de ton panier n'est plus disponible. Retire-le et réessaie.",
  minimum_non_atteint: "Le minimum de commande pour la livraison n'est pas atteint.",
  limite_reservations: "Ce restaurant ne peut plus prendre de réservations pour le moment.",
  credits_insuffisants: "Service momentanément indisponible. Réessaie plus tard.",
  paiement_introuvable: "Paiement introuvable. Contacte le restaurant.",
  contact_requis: "Indique ton nom et un numéro de téléphone valide.",
  trop_de_requetes: "Trop de demandes en peu de temps. Réessaie dans quelques minutes.",
  deja_paye: "Cette commande est déjà payée.",
  commande_annulee: "Cette commande est annulée.",
  annulation_impossible: "Cette commande ne peut plus être annulée.",
  paiement_indisponible: "Le paiement mobile money est momentanément indisponible. Tu peux payer en espèces.",
  reseau: "Pas de connexion. Réessaie dès que le réseau revient.",
};

export function humanError(e: unknown): string {
  const msg = typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : "";
  for (const code of Object.keys(MESSAGES)) if (msg.includes(code)) return MESSAGES[code];
  if (typeof navigator !== "undefined" && !navigator.onLine) return "Pas de connexion. Réessaie dès que le réseau revient.";
  return "Une erreur est survenue. Réessaie dans un instant.";
}
