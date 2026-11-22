import type { Role } from "./types";

export const ROLES: Role[] = ["patron", "gerant", "serveur", "cuisinier", "caissier", "livreur"];
export const ROLE_LABEL: Record<Role, string> = { patron: "Patron", gerant: "Gérant", serveur: "Serveur", cuisinier: "Cuisinier", caissier: "Caissier", livreur: "Livreur" };
export const ROLE_ICON: Record<Role, string> = { patron: "👑", gerant: "🧭", serveur: "🍽️", cuisinier: "👨‍🍳", caissier: "💵", livreur: "🛵" };
export const ROLE_HINT: Record<Role, string> = {
  patron: "Tout gérer, y compris l'équipe et les autres patrons.",
  gerant: "Gérer le restaurant et l'équipe, sauf le rôle de patron.",
  serveur: "Voir et traiter les commandes de la salle.",
  cuisinier: "Voir et traiter les commandes en cuisine.",
  caissier: "Voir les commandes et encaisser les paiements.",
  livreur: "Prendre les livraisons, suivre l'itinéraire et encaisser en espèces à la livraison.",
};
export const DEFAULT_ROLE: Role = "serveur"; // le plus fréquent : proposé d'office, modifiable
export const isManagerRole = (r: Role | null | undefined): boolean => r === "patron" || r === "gerant";

/** Rôles qu'on a le droit d'attribuer. Un gérant ne peut jamais attribuer « patron ». */
export const assignableRoles = (actor: Role | null | undefined): Role[] =>
  actor === "patron" ? ROLES : actor === "gerant" ? ROLES.filter((r) => r !== "patron") : [];

/** Un gérant ne touche pas à un patron. (La base applique les mêmes règles : ceci ne sert qu'à guider.) */
export const canManageMember = (actor: Role | null | undefined, target: Role): boolean =>
  isManagerRole(actor) && !(actor === "gerant" && target === "patron");

/** Lien « passer à une formule supérieure ». Laissé vide : aucune page d'abonnement n'existe encore (voir DEMANDES). */
export const UPGRADE_HREF: string | null = null;

/** Tableau montré au patron. Reflète l'interface actuelle ; la base de données applique les droits réels. */
export const PERMISSIONS: { label: string; detail?: string; roles: Role[] }[] = [
  { label: "Voir et traiter les commandes", detail: "Chacun a la vue adaptée : salle (serveur), cuisine (cuisinier), paiements (caissier).", roles: ["patron", "gerant", "serveur", "cuisinier", "caissier"] },
  { label: "Encaisser un paiement en espèces", roles: ["patron", "gerant", "caissier"] },
  { label: "Menus, plats et plats indisponibles", roles: ["patron", "gerant"] },
  { label: "Tables et QR codes", roles: ["patron", "gerant"] },
  { label: "Réservations", roles: ["patron", "gerant"] },
  { label: "Livraison", roles: ["patron", "gerant"] },
  { label: "Statistiques", roles: ["patron", "gerant"] },
  { label: "Identité visuelle et site", roles: ["patron", "gerant"] },
  { label: "Inviter, valider ou refuser une demande d'équipe", roles: ["patron", "gerant"] },
  { label: "Changer le rôle, suspendre ou retirer un membre", detail: "Un gérant ne peut pas modifier un patron.", roles: ["patron", "gerant"] },
  { label: "Attribuer le rôle de patron", roles: ["patron"] },
  { label: "Voir le journal des actions", roles: ["patron", "gerant"] },
];
