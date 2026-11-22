export type HelpArticle = {
  id: string;
  slug: string;
  category: string;
  title: string;
  body: string;
  published: boolean;
  updated_at: string;
};

/** Version legere d'un article pour la recherche (sans le texte complet). */
export type HelpIndexItem = {
  slug: string;
  title: string;
  category: string;
  summary: string;
};

export type PopularItem = {
  slug: string;
  title: string;
  category: string;
  views: number;
};

export type HelpCategory = {
  key: string;
  label: string;
  description: string;
  href: string;
};

/** Categories affichees sur la page d'accueil de l'aide (ordre voulu). */
export const CATEGORIES: HelpCategory[] = [
  {
    key: "demarrer",
    label: "Bien démarrer",
    description: "Créer votre compte et lancer votre restaurant.",
    href: "/aide/categorie/demarrer",
  },
  {
    key: "restaurateur",
    label: "Gérer mon restaurant",
    description: "Menu, tables, commandes, réservations, équipe et livraison.",
    href: "/aide/categorie/restaurateur",
  },
  {
    key: "client",
    label: "Commander et réserver",
    description: "Pour les clients : commander, réserver, suivre sa commande.",
    href: "/aide/categorie/client",
  },
  {
    key: "paiement",
    label: "Plans, crédits et paiements",
    description: "Tarifs, crédits, commission et paiement mobile money.",
    href: "/aide/categorie/paiement",
  },
  {
    key: "depannage",
    label: "Dépannage",
    description: "Un problème ? Trouvez la solution pas à pas.",
    href: "/aide/depannage",
  },
  {
    key: "faq",
    label: "Questions fréquentes",
    description: "Les réponses rapides aux questions les plus posées.",
    href: "/aide/faq",
  },
];

const OTHER_LABELS: Record<string, string> = {
  glossaire: "Mots utiles",
  support: "Contacter le support",
  legal: "Informations légales",
};

export function categoryLabel(key: string): string {
  return (
    CATEGORIES.find((c) => c.key === key)?.label ?? OTHER_LABELS[key] ?? "Aide"
  );
}

export function isKnownCategory(key: string): boolean {
  return CATEGORIES.some((c) => c.key === key);
}
