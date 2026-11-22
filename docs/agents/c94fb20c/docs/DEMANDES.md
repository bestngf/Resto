# Demandes entre agents
Si tu as besoin d'un changement hors de ton perimetre, ecris-le ici :
- [Agent X -> Agent Y] description de la demande

## Demandes de l'agent 3
- [Agent 3 -> Agent 1] Les tables de la base sont prefixees `resto_` (resto_orders, resto_menu_items...). Le dashboard utilise ces noms. Merci de generer `src/types/database.ts` ; le dashboard a ses types locaux dans `src/lib/dashboard/types.ts`, a remplacer plus tard.
- [Agent 3 -> Agent 1] Le personnel (serveur, caissier) ne peut pas forcement lire le telephone du client (`resto_profiles.phone`). Le bouton « Prevenir sur WhatsApp » ouvre alors WhatsApp sans numero. Autoriser la lecture du telephone, limitee aux clients ayant une commande dans le restaurant du membre, le rendrait automatique.
- [Agent 3 -> Agent 1] Les options des plats sont stockees dans `resto_menu_items.options` sous la forme `[{ "name": "Piment", "choices": ["Sans", "Doux", "Fort"] }]` (sans supplement de prix). A confirmer avec l'agent 2 pour le format envoye dans `resto_create_order` (cle `options`).
- [Agent 3 -> Agent 1] Choix « mes livreurs / reseau externe » : aucune colonne n'existe. L'ecran affiche « reseau externe : bientot disponible » sans rien enregistrer. A prevoir quand le reseau sera branche.
- [Agent 3 -> Agent 1] Tables hors perimetre vues dans la base (resto_plans, resto_subscriptions, resto_invoices, resto_commissions, resto_payouts, resto_credits...) : le dashboard ne les utilise pas. Les limites de plan (`limite_plats`, `limite_tables`) sont seulement affichees comme messages d'erreur. A verifier avec NGF : la regle « rien de payant » s'applique-t-elle a ces tables ?
- [Agent 3 -> Agent 5] Les QR codes pointent vers `{SITE}/r/{slug}/table/{qr_token}` (le token de `resto_tables.qr_token`, pas l'id). La page doit resoudre la table avec `resto_table_by_token`.
- [Agent 3 -> Agent 6] Le bouton « Besoin d'aide ? » ouvre `/aide?page=<onglet>` avec : accueil, commandes, menus, tables, reservations, livraison, statistiques, identite, inscription. Prevoir ces cles.
- [Agent 3 -> Agent 2] La page `/connexion` doit accepter `?next=` (le dashboard y redirige quand il n'y a pas de session).
- [Agent 3 -> tous] Variables a definir : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, et `NEXT_PUBLIC_SITE_URL` (pour les liens des QR codes). Paquets utilises, deja prevus : `@supabase/ssr`, `leaflet`, `qrcode`.
