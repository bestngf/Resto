# Resto : site complet (agents 1 à 7 assemblés)

Aucune variable d'environnement à régler sur Netlify : l'adresse et la clé PUBLIQUE de Supabase sont dans `src/config/public.ts` (faites pour être visibles ; la sécurité repose sur les règles de la base). Les clés secrètes restent chez Supabase, dans la fonction `resto-api`.

## Mise en ligne sur Netlify
1. Mettre ce dossier dans un dépôt GitHub, puis Netlify : « Add new site » > « Import from Git ». Netlify lit `netlify.toml` (rien à saisir).
2. Une fois l'adresse connue (ex. https://monresto.netlify.app) :
   - Supabase > Authentication > URL Configuration : mettre cette adresse dans « Site URL » et ajouter `https://monresto.netlify.app/**` dans « Redirect URLs » (sinon le lien magique de connexion échoue).
   - Hub NGF > Applications connectées : créer « resto » avec cette adresse (obligatoire pour le paiement mobile money).
3. Ouvrir l'adresse : accueil, fiche d'un restaurant, commande.

## Ce qui est dedans
Espace client (agent 2), dashboard restaurateur (3), équipe (4), site du restaurant `/r/<slug>` (5), centre d'aide `/aide` (6), commande sans compte + paiement + suivi `/suivi/<code>` (7), PWA simple (installation, page hors connexion).
Détails : `docs/agents/`, `docs/BASE.md`, `docs/API.md`, `docs/ETAT.md`, `docs/DEMANDES.md`.

## Vérifier ici sans réseau
`tests/sim/resto-api.simulation.cjs` (voir l'en-tête du fichier).
