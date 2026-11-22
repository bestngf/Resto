# AIDE.md - Centre d'aide (agent 6)

Application : Resto (nom provisoire). Module : `/aide`.

## Ce qui existe

**Pages** (`src/app/aide/`) : accueil (recherche, populaires, thèmes, visites guidées, contact), `[slug]` (article), `categorie/[cat]`, `faq`, `depannage`, `glossaire`, `contact`, `legal/[doc]`, `hors-ligne`, plus `loading.tsx` (squelettes) et `error.tsx` (message humain).

**Composants** (`src/components/aide/`) : `SearchBox`, `ArticleBody`, `Illustration`, `AccordionList`, `Feedback` (avis, vues, partage WhatsApp), `ContactForm`, `OfflineSync`, et ceux que les autres agents utilisent : `HelpButton`, `WelcomeNote`, `HelpTip`, `TourGuide`.

**Logique** (`src/lib/aide/`) : `search.ts` (recherche tolérante), `markdown.ts` (parseur sans HTML), `contextMap.ts` (page -> article), `tour.ts` (visites), `offline.ts`, `data.ts`, `supabase.ts`, `config.ts`, `categories.ts`, `format.ts`.

**Aucune nouvelle dépendance.** Le module utilise seulement `@supabase/supabase-js`, déjà dans le projet.

## Intégrer l'aide dans un onglet

```tsx
import { HelpButton } from "@/components/aide/HelpButton";
import { WelcomeNote, HelpTip } from "@/components/aide/WelcomeNote";
import { TourGuide } from "@/components/aide/TourGuide";

<HelpButton />                       // ouvre le bon article selon la page
<HelpButton slug="tables-et-qr-codes" />   // ou un article précis

<WelcomeNote id="dashboard-menus" title="Votre menu" helpSlug="ajouter-un-menu">
  Ajoutez vos plats avec photo et prix en FCFA.
</WelcomeNote>

<HelpTip id="menus-indisponible">Un plat épuisé se retire avec l'interrupteur.</HelpTip>

<TourGuide space="restaurateur" />   // "restaurateur" | "equipe" | "client"
```

Le bouton, le mot d'accueil et les bulles se souviennent de leur fermeture dans le téléphone. La visite démarre au premier lancement, ou avec `?visite=1` dans l'adresse (bouton « Revoir la visite » de l'aide).

**Éléments mis en avant par la visite** : ajouter l'attribut `data-tour="nom"` sur l'élément. Sans cet attribut, l'étape s'affiche au centre et la visite marche quand même.

| Espace | Valeurs de `data-tour` |
|---|---|
| restaurateur | `identite`, `menus`, `tables`, `commandes`, `reservations`, `aide` (déjà posé par `HelpButton`) |
| equipe | `invitation`, `demandes`, `roles`, `aide` |
| client | `commander`, `reserver`, `trouver`, `aide` |

## Variables d'environnement (à remplir)

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPPORT_WHATSAPP` | numéro du support, format international, chiffres seulement (ex. 22890000000) |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | adresse e-mail du support (facultatif) |

Tant qu'elles sont vides, les boutons WhatsApp et e-mail sont masqués ; le formulaire de contact reste disponible.

## Contenu

- Les articles sont dans `resto_help_articles`. Format du texte : `## Titre`, `### Sous-titre`, listes `- ` et `1. `, `> astuce`, `**gras**`, `*italique*`, `[texte](lien)`, et `::illustration nom` pour un schéma.
- Schémas disponibles : `inscription`, `flux-commande`, `parcours-qr`, `equipe`, `reservation`, `identite`.
- Catégories : `demarrer`, `restaurateur`, `client`, `paiement`, `depannage`, `faq`, plus `glossaire`, `support` et `legal`.
- `supabase/seed_help.sql` contient 28 articles, tous **non publiés** sauf `glossaire` et `contacter-le-support`. Publier un guide : `update resto_help_articles set published = true, updated_at = now() where slug = '...';`
- **Textes légaux** : à coller dans deux articles `legal-conditions` et `legal-confidentialite` (catégorie `legal`). La page `/aide/legal/...` les affiche, sinon elle dit « publié prochainement ». Rien n'a été écrit à la place de NGF.

## Base de données (migration `004_aide.sql`, appliquée sur le projet partagé)

| Objet | Rôle |
|---|---|
| `resto_help_stats` | vues par article et nombre d'avis oui/non |
| `resto_help_feedback` | un avis oui/non par ligne (aucune donnée personnelle) |
| `resto_help_messages` | messages du formulaire de contact : nom (facultatif), contact, message, article d'origine, statut (nouveau, en_cours, traite) |
| `resto_help_track_view`, `resto_help_send_feedback`, `resto_help_send_message`, `resto_help_popular` | seules portes d'entrée publiques, avec limites de longueur et de fréquence |

Les trois tables ont la RLS activée, aucun droit direct pour les visiteurs, lecture et modification réservées à l'admin (`resto_is_admin()`). Retour arrière : `supabase/migrations/004_aide_down.sql`.

`resto_help_messages` contient le contact laissé par la personne (nécessaire pour répondre). Il n'est jamais écrit dans les journaux.

## Ce qui a été vérifié

- Recherche (accents, fautes, mots locaux), parseur Markdown (liens dangereux neutralisés, HTML affiché comme du texte) et 28 articles : testés avec Node.
- Types TypeScript stricts sur les 33 fichiers, contre des définitions minimales de React, Next et Supabase.
- Base : fonctions testées en tant que visiteur anonyme ; écriture directe, lecture des messages, modification des articles, messages trop courts ou trop longs : tous refusés. Transaction annulée, aucune donnée de test restante.

## Pas vérifié

- **Rendu dans un vrai navigateur** : aucun `npm install` ni `next build` n'a été possible ici. À lancer : `npm run dev`, puis ouvrir `/aide`.
- Contrôle de sécurité automatique de Supabase (get_advisors) : non approuvé pendant la session.
