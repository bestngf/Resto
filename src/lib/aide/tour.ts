// Visites guidees. Chaque etape peut viser un element de la page grace a l'attribut
// data-tour="nom" (a ajouter par les agents proprietaires de chaque onglet, voir docs/DEMANDES.md).
// Sans cible trouvee, l'etape s'affiche simplement au centre : la visite marche toujours.

import type { HelpSpace } from "./contextMap";

export type TourStep = {
  /** Valeur de l'attribut data-tour de l'element a mettre en avant. */
  target?: string;
  title: string;
  text: string;
};

export const TOURS: Record<HelpSpace, TourStep[]> = {
  restaurateur: [
    {
      title: "Bienvenue sur votre espace restaurateur",
      text: "En quelques minutes, votre restaurant sera en ligne. Nous vous montrons l'essentiel.",
    },
    { target: "identite", title: "Votre identité", text: "Ajoutez votre logo et vos couleurs : votre site s'adapte tout seul." },
    { target: "menus", title: "Votre menu", text: "Ajoutez vos plats avec photo et prix en FCFA. Un plat épuisé se retire en un clic." },
    { target: "tables", title: "Vos tables", text: "Créez vos tables et imprimez un QR code par table pour recevoir les commandes en salle." },
    { target: "commandes", title: "Vos commandes", text: "Les commandes arrivent ici en direct. Gardez cet écran ouvert pour entendre la sonnerie." },
    { target: "reservations", title: "Vos réservations", text: "Confirmez ou refusez les demandes de réservation depuis votre agenda." },
    { target: "aide", title: "Besoin d'aide ?", text: "Ce bouton est présent sur chaque page. Il ouvre le guide qui correspond à ce que vous faites." },
  ],
  equipe: [
    {
      title: "Bienvenue dans l'équipe",
      text: "Voici comment les demandes d'équipe fonctionnent, en trois étapes simples.",
    },
    { target: "invitation", title: "Le lien d'invitation", text: "Partagez le lien ou le QR code : vos employés l'ouvrent pour demander à rejoindre l'équipe." },
    { target: "demandes", title: "Les demandes", text: "Chaque demande arrive ici. Vous la validez ou la refusez, et vous choisissez le rôle." },
    { target: "roles", title: "Les rôles", text: "Chaque rôle voit seulement ce dont il a besoin : salle, cuisine ou caisse." },
    { target: "aide", title: "Besoin d'aide ?", text: "Le bouton d'aide ouvre toujours le bon guide." },
  ],
  client: [
    {
      title: "Bienvenue",
      text: "Commandez, réservez ou trouvez un restaurant en quelques touches.",
    },
    { target: "commander", title: "Commander", text: "Sur place avec le QR code de la table, à emporter ou en livraison." },
    { target: "reserver", title: "Réserver", text: "Choisissez un créneau libre et recevez la confirmation." },
    { target: "trouver", title: "Trouver", text: "La carte et la liste des restaurants, avec l'itinéraire pour y aller." },
    { target: "aide", title: "Besoin d'aide ?", text: "Ce bouton ouvre le guide adapté à la page où vous êtes." },
  ],
};

export const TOUR_LINKS: { space: HelpSpace; label: string; description: string; href: string }[] = [
  { space: "restaurateur", label: "Visite de l'espace restaurateur", description: "Identité, menu, tables, commandes, réservations.", href: "/dashboard?visite=1" },
  { space: "equipe", label: "Visite de la gestion d'équipe", description: "Inviter, valider et attribuer un rôle.", href: "/dashboard/equipe?visite=1" },
  { space: "client", label: "Visite de l'espace client", description: "Commander, réserver, trouver un restaurant.", href: "/?visite=1" },
];

export const tourDoneKey = (space: HelpSpace) => `resto_aide_tour_done:${space}`;
export const dismissedKey = (id: string) => `resto_aide_dismissed:${id}`;
