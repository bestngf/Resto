// Aide contextuelle : quel article ouvrir selon la page ou se trouve la personne.
// Si un article n'est pas (encore) publie, la page /aide/[slug] l'explique gentiment
// et propose la recherche : le bouton ne mene jamais a une erreur.

export type HelpSpace = "restaurateur" | "equipe" | "client";

const ROUTES: [prefix: string, slug: string][] = [
  ["/dashboard/inscription", "s-inscrire-restaurateur"],
  ["/dashboard/identite", "creer-identite-visuelle"],
  ["/dashboard/menus", "ajouter-un-menu"],
  ["/dashboard/tables", "tables-et-qr-codes"],
  ["/dashboard/commandes", "recevoir-traiter-commandes"],
  ["/dashboard/reservations", "gerer-reservations"],
  ["/dashboard/equipe", "inviter-valider-equipe"],
  ["/dashboard/livraison", "configurer-livraison"],
  ["/dashboard/statistiques", "comprendre-statistiques"],
  ["/rejoindre", "inviter-valider-equipe"],
  ["/commande", "suivre-ma-commande"],
  ["/carte", "commander-en-tant-que-client"],
  ["/compte", "commander-en-tant-que-client"],
  ["/connexion", "connexion-lien-magique"],
];

/** Slug de l'article qui correspond le mieux a la page, ou null. */
export function helpSlugFor(pathname: string | null | undefined): string | null {
  if (!pathname) return null;
  if (/^\/r\/[^/]+\/reserver(\/|$)/.test(pathname)) return "reserver-une-table";
  if (/^\/r\/[^/]+(\/|$)/.test(pathname)) return "commander-en-tant-que-client";
  let best: [string, string] | null = null;
  for (const [prefix, slug] of ROUTES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      if (!best || prefix.length > best[0].length) best = [prefix, slug];
    }
  }
  return best ? best[1] : null;
}

/** Lien d'aide pour une page : l'article adapte, ou l'accueil de l'aide. */
export function helpHrefFor(pathname: string | null | undefined): string {
  const slug = helpSlugFor(pathname);
  return slug ? `/aide/${slug}` : "/aide";
}

/** Espace (pour la visite guidee) deduit de l'adresse de la page. */
export function spaceFor(pathname: string | null | undefined): HelpSpace {
  const p = pathname ?? "";
  if (p.startsWith("/dashboard/equipe") || p.startsWith("/rejoindre")) return "equipe";
  if (p.startsWith("/dashboard")) return "restaurateur";
  return "client";
}
