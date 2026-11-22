# BASE.md - Base de données Resto (Agent 1)

Projet Supabase : dzexnotznapokxrfjnkq (partagé avec Stock Connect / AnnéA). Toutes les tables sont préfixées `resto_` (schéma public). RLS activée sur chaque table. Aucune suppression physique des commandes, lignes, paiements, commissions, restaurants (triggers). Écritures sensibles uniquement par fonctions (DML direct révoqué).

## Tables métier
| Table | Rôle | Qui lit / écrit |
|---|---|---|
| resto_profiles | profil (nom, téléphone, rôle client/admin) | soi-même ; admin |
| resto_restaurants | fiche restaurant (statut brouillon/actif/ferme/suspendu, merchant_status aucun/declare/valide, invite_code masqué) | public si actif ; équipe ; patron/gérant modifie ; suspension = admin |
| resto_restaurant_members | équipe (patron/gerant/serveur/cuisinier/caissier ; actif/suspendu/retire) | équipe ; gérants via fonctions |
| resto_staff_requests | demande de rejoindre (en_attente/validee/refusee) | demandeur ; validation via validate_staff_request |
| resto_opening_hours | horaires par jour | public si actif ; manager |
| resto_categories, resto_menu_items | menu en FCFA | public si actif ; manager |
| resto_tables | tables + qr_token | manager ; recherche par QR via resto_table_by_token |
| resto_delivery_zones | zones et frais de livraison | public si actif ; manager |
| resto_orders / resto_order_items | commandes (sur_place/emporter/livraison) ; totaux calculés côté serveur | client ; équipe (espèces visibles avant paiement, mobile money après paiement) ; création et statut par fonctions |
| resto_payments | paiements des commandes (mobile_money/especes) | client, équipe ; écriture service uniquement |
| resto_reservations | réservations (source site/app/assistant_vocal) | client, équipe ; fonctions |
| resto_reviews, resto_help_articles, resto_notifications | avis, aide, notifications | selon propriétaire ; notifications en temps réel |
| resto_audit_log | journal immuable | managers (lecture) |

## Tables facturation NGF
resto_settings (commission 5 %, essai 30 j, rappel 10 j, 1 crédit = 10 FCFA, crédits cadeau expirent 60 j), resto_plans (gratuit 0 / essentiel 2 500 / pro 5 000 / business 12 500 FCFA), resto_services (coût en crédits : resume_hebdo 5, appel_vocal 10, fiche_plat 3, photo_plat 8, rapport_ia 5), resto_subscriptions, resto_credit_ledger (journal append-only PURCHASE/GRANT/SPEND/REFUND/ADJUST), resto_billing_payments, resto_commissions, resto_payouts, resto_invoices, resto_invoice_lines, resto_weekly_summaries.

## Règles de facturation
- Essai 30 jours (limites Business) au premier restaurant du patron, puis retour automatique au plan Gratuit.
- Limites par plan : plats, tables, équipe, réservations/mois, crédits mensuels (0/100/400/1 500). Erreurs : limite_plats, limite_tables, limite_equipe, limite_reservations.
- Commission 5 % sur paiements mobile money uniquement (0 % espèces), frais PayDunya à la charge de NGF.
- Restaurant avec compte marchand validé : paiement direct, commission "a_facturer". Sinon NGF encaisse, versement "a_reverser" (resto_payouts).
- Facture mensuelle par restaurant (resto_facturer_mois_precedent), rappels d'expiration à 10 jours (resto_rappels), résumé hebdomadaire IA (edge function resto-summary).
- Recharges de crédits : packs de la table credit_packs (partagée avec AnnéA).

## Fonctions (RPC)
get_availability, resto_create_reservation, resto_set_reservation_status, resto_create_order, resto_set_order_status, resto_confirm_cash, set_item_availability, resto_request_join, validate_staff_request, resto_change_role, resto_set_member_status, resto_get_invite, resto_regenerate_invite, resto_set_invite_active, resto_table_by_token, resto_solde, resto_utiliser_service, resto_rappels, resto_generate_invoice, resto_facturer_mois_precedent, resto_summary_data.
Service uniquement (clé serveur) : resto_mark_paid, resto_mark_failed, resto_mark_payout_done, resto_billing_apply, resto_summary_store.

## Stockage et temps réel
Buckets publics resto-logos (1 Mo), resto-photos-plats (2 Mo), resto-couvertures (3 Mo) ; jpeg/png/webp ; dossier = id du restaurant, écriture par manager. Temps réel : resto_orders, resto_staff_requests, resto_notifications.

## Edge functions
ngf-bridge (/payment, /sso, /admin, /health), app-pay (target `r:<restaurantId>:<planCode|packId>`), app-ai, resto-summary.

## Ajouts de l'agent 7 (resto_0006)
- Rôle d'équipe `livreur` ; colonnes resto_orders : tracking_code (code de suivi invité), contact_name, contact_phone, courier_id ; resto_payments.last_attempt_at ; table resto_rate_limits (limitation, aucun accès direct).
- Fonctions serveur uniquement : resto_create_order_srv, resto_order_view, resto_order_cancel, resto_payment_prepare, resto_order_paid, resto_voice_charge, resto_rate_hit. Fonction connectée : resto_assign_courier (gérant). Mises à jour : resto_set_order_status et resto_change_role (livreur).
- Le livreur ne voit que les livraisons prêtes, en route ou livrées qui ne sont pas attribuées à un autre.

## Ajouts resto_0007
resto_confirm_cash accepte le livreur attribué (livraison en route ou livrée) ; le déclencheur resto_notify_couriers prévient les livreurs actifs (ou le livreur attribué) quand une livraison passe à « prête » (table resto_notifications).
