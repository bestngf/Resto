# Agent 2 – Espace client : état d'avancement (à recopier dans docs/ETAT.md)

Dernière mise à jour : 19/11/2026

## Fait
- **Fondations** : nom modifiable (`src/config/app.ts`), client Supabase navigateur (clé publique seule), panier persistant hors connexion, cache local des listes et menus, messages d'erreur en français pour les codes de la base.
- **Accueil** : recherche (nom, cuisine, adresse, repère), filtres cuisine et « Ouvert maintenant », squelettes, états vides, erreurs avec « Réessayer », liste en cache si coupure.
- **Fiche restaurant** : menu par catégories, plats indisponibles grisés, « Ajouter », « Y aller » (OpenStreetMap), « Voir le site », WhatsApp, bouton « Favori », couleur du restaurant avec texte lisible.
- **Carte** : Leaflet + OpenStreetMap, marqueurs, « Voir la fiche » et « Y aller ».
- **Réserver** : liste de restaurants qui renvoie vers `/r/[slug]`.
- **Commander** : panier, choix sur place (via QR `?t=`) / emporter / livraison, zone et frais, repère écrit, adresse, position GPS, position WhatsApp collée, note, espèces, envoi par `resto_create_order` (totaux recalculés par la base).
- **Suivi** : `/commande/suivi/[id]`, étapes animées, temps réel + relecture toutes les 20 s, avis après commande servie ou livrée.
- **Secours WhatsApp** (idée A) : lien `wa.me` pré-rempli avec le panier.
- **Connexion** : lien magique par e-mail, destination interne uniquement.
- **Compte** : profil (nom, téléphone, numéro mobile money), historique, « Recommander » (prix et disponibilité relus), réservations, favoris, déconnexion.
- **Base** (accord du propriétaire) : migrations `resto_0006` (table `resto_favorites` avec RLS, colonne `resto_profiles.last_momo_phone`) et `resto_0007` (droits resserrés). Scripts dans `supabase/`.

## Pas fait
- **Paiement mobile money** : désactivé (`MOBILE_MONEY_ENABLED = false` dans `src/config/app.ts`) car la route de paiement (agent 7) n'existe pas encore. Les commandes en espèces fonctionnent de bout en bout. Quand l'agent 7 aura fini : passer le drapeau à `true`, appeler sa route après `resto_create_order` avec `payment_id`.
- **Filtre « budget »** : aucune donnée de prix moyen sur le restaurant.
- **Options de plat** (piment, accompagnement) : la forme du champ `options` n'est pas documentée ; les commandes partent avec des options vides.
- **Mode données légères poussé** (idée B) : seul le cache local des listes et des menus est fait, avec images chargées à la demande.
- Remplacement des types locaux (`src/lib/types.ts`) par `src/types/database.ts`.
- Aucun test automatique, et rien n'a été lancé dans un navigateur.

## Comment tester
1. `npm install @supabase/supabase-js leaflet` puis `npm install -D @types/leaflet`.
2. `.env.local` : `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Dans Supabase (Authentication > URL Configuration), autoriser l'adresse du site (ex. `http://localhost:3000`) comme URL de redirection, sinon le lien magique échoue.
4. Appliquer `supabase/seed.sql` (développement) pour avoir au moins un restaurant « actif ».
5. `npm run dev` : `/` > fiche > ajouter des plats > `/commande` > se connecter > envoyer en espèces > suivi.
6. Sur place : ouvrir `/commande?t=<qr_token d'une table>`.
7. Réseau faible : charger l'accueil, passer en mode avion, recharger.

## Points d'attention
- Je n'ai pas pu installer ni lancer le projet : seule la syntaxe est vérifiée.
- Commander demande d'être connecté (la base l'exige). Le panier, lui, marche sans connexion.
- Hypothèses à vérifier au premier test : `resto_opening_hours.weekday` (0 = dimanche), jointures `resto_opening_hours(...)`, `resto_order_items(...)`, `resto_restaurants(...)`.
- `public/` et `src/app/layout.tsx` ne sont pas dans mon périmètre : voir docs/AGENT2_DEMANDES.md.
