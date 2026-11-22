# Identité NGF dans Resto (degré 3, refonte complète)

Ce qui a changé, et où :

- **Couleurs et mode clair/sombre** : `src/styles/ngf.css` (variables) et `tailwind.config.ts` (mêmes noms de couleurs qu'avant, pilotés par les variables). Le site suit le téléphone. Les anciens verts deviennent l'or NGF, l'ambre devient l'orange Resto, le rouge devient le rouge NGF.
- **Boutons, cartes, états vides** : `src/components/dashboard/ui.tsx` (boutons en pilule, bouton principal en or brillant avec texte noir, cartes à cadre doré, états vides avec motif africain).
- **Barre de marque NGF** : `src/components/brand/NgfBar.tsx` (bande kente, motif, « NGF » en dégradé, nom de l'app). Présente dans l'espace client, le dashboard, l'aide, l'écran livreur et « rejoindre ».
- **Sites des restaurants** (`/r/<slug>`) : ils gardent les couleurs du restaurant (zone forcée en clair) et affichent un pied de page `NgfFooter` « par New Generation Form ». Idem pour la page de suivi de commande.
- **Écran de lancement** : `public/ngf-splash.js` + `src/components/brand/NgfSplash.tsx`. Complet à la première ouverture, court ensuite, un toucher le passe. Il ne s'affiche pas sur les liens de restaurants (`/r/`, `/restaurant/`) ni sur le suivi de commande.
- **Icônes** : `public/icons/` (RE, orange, cadre doré ; 512, 192, 180, 32 et version « maskable »), manifeste et couleur du navigateur mis à jour. Version du cache : `resto-v2`.
- **Hors connexion** : `public/hors-ligne.html` aux couleurs NGF.

Ce qui n'a pas bougé : toute la logique, la base de données, les clés, les paiements.

Le guide complet de l'identité (à donner à toute IA) : `docs/NGF_IDENTITE_POUR_IA.md`.
