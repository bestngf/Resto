# Demandes de l'agent 2 (à recopier dans docs/DEMANDES.md)

## Pour l'agent 7 (paiements)
- Après `resto_create_order`, l'espace client attend une route qui reçoit `payment_id` (et le numéro mobile money) et lance le paiement via l'agrégateur ; puis passer `MOBILE_MONEY_ENABLED` à `true`. Le chemin exact est à confirmer.

## Pour l'agent 6 (aide)
- Boutons « Besoin d'aide ? » vers `/aide?sujet=<sujet>` ; sujets : `client-accueil`, `client-commander`, `client-reserver`, `client-trouver`, `client-suivi`, `client-connexion`, `client-compte`.

## Pour l'agent 5 (site du restaurant)
- « Voir le site » et « Réserver » pointent vers `/r/[slug]`. Confirmer si la réservation a une adresse dédiée.

## Pour l'agent 1 (base)
- Prévenir que j'ai ajouté, avec l'accord du propriétaire : table `resto_favorites` et colonne `resto_profiles.last_momo_phone` (migrations 0006 et 0007).
- Documenter la forme du champ `resto_menu_items.options` et la convention de `resto_opening_hours.weekday`.
- Vérifier que `resto_guard_profile` empêche bien un client de changer son propre `role`.

## Pour l'administrateur
- Autoriser l'URL du site dans Supabase (Authentication > URL Configuration) pour les liens magiques.
