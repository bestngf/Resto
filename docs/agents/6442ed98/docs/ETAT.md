# ETAT.md - Agent 1 (Base de données et sécurité)
Fait : tables, RLS, fonctions, stockage, temps réel, facturation (plans, crédits, commissions, versements, factures), edge functions, types TypeScript (src/types/database.ts, types de tout le projet), vérifications de sécurité faites et annulées sans données restantes.
Pas fait : connexion Hub pour l'application "resto" (secret partagé), validation juridique des versements, méthode d'encaissement des commissions "a_facturer", seed non appliqué en production (supabase/seed.sql pour développement), tâches planifiées (tout est déclenché à l'ouverture du tableau de bord).

## Agent 6 - Centre d'aide : livré, à tester dans l'application

**Fait** : pages `/aide` (accueil, article, catégories, FAQ, dépannage, glossaire, contact, légal, hors-ligne), recherche tolérante (accents, fautes, mots locaux comme tmoney, flooz, mixx), composants `HelpButton`, `WelcomeNote`, `HelpTip`, `TourGuide`, avis « utile oui/non », partage WhatsApp, cache hors connexion. Migration `004_aide` appliquée sur le projet Supabase partagé. 28 articles dans `supabase/seed_help.sql`, 2 publiés (glossaire, contact).

**Pas fait / en attente** : numéro WhatsApp et e-mail du support (variables vides), textes légaux (pages « publié prochainement »), publication des 26 autres guides (ils décrivent des écrans pas encore construits), insertion des 26 brouillons en base (seulement le fichier de seed).

**À savoir** : le rendu n'a pas pu être testé dans un navigateur (pas de `npm install` possible). Détails dans `docs/AIDE.md`.
