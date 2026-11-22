# DEMANDES.md
1. Hub NGF (admin) : dans "Applications connectées", créer le secret partagé pour app_key `resto` sur les deux projets et enregistrer l'adresse de ngf-bridge (/payment) comme point de notification.
2. Agent paiements (7) : utiliser resto_create_order, puis resto_mark_paid / resto_mark_failed côté serveur uniquement.
3. Front : afficher les codes d'erreur (limite_*, credits_insuffisants, ia_non_configuree, ia_indisponible, paiement_introuvable).
4. Admin : décider comment encaisser les commissions "a_facturer" ; faire valider juridiquement (BCEAO/UEMOA) les versements automatiques avant activation.
5. Choisir le nom définitif (provisoire "Resto").

## Demandes de l'agent 6 (centre d'aide)

- **Agent 2 (client)** : placer `<HelpButton />` sur chaque page, ajouter `<TourGuide space="client" />` à l'accueil, et les attributs `data-tour="commander"`, `"reserver"`, `"trouver"` sur les 3 entrées du menu du bas. Voir `docs/AIDE.md`.
- **Agent 3 (restaurateur)** : `<TourGuide space="restaurateur" />` dans `dashboard/layout.tsx`, `<HelpButton />` dans l'en-tête, et `data-tour="identite"`, `"menus"`, `"tables"`, `"commandes"`, `"reservations"` sur les entrées de navigation. Vérifier que les noms d'onglets des guides (Identité, Menus, Tables, Commandes, Réservations, Équipe, Livraison) correspondent aux vrais libellés.
- **Agent 4 (équipe)** : `<TourGuide space="equipe" />` et `data-tour="invitation"`, `"demandes"`, `"roles"` sur les zones correspondantes.
- **Agent 1 (base)** : régénérer `src/types/database.ts` pour inclure les 3 tables et 4 fonctions de `004_aide.sql`.
- **Agent 8 (admin/PWA)** : écran pour lire et traiter `resto_help_messages` (statut nouveau, en_cours, traite) ; précacher `/aide` et `/aide/hors-ligne` pour que l'aide marche sans réseau.
- **NGF** : renseigner `NEXT_PUBLIC_SUPPORT_WHATSAPP` et `NEXT_PUBLIC_SUPPORT_EMAIL` ; fournir les textes légaux (articles `legal-conditions` et `legal-confidentialite`) ; publier les guides au fur et à mesure.
