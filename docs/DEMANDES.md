# DEMANDES.md (restant à faire)
1. Toi : adresse Netlify dans Supabase (Authentication) et dans le Hub NGF (application « resto ») : voir LISEZMOI.md.
2. Toi : documentation de l'assistant vocal + secret `VOICE_WEBHOOK_SECRET` de la fonction.
3. Écran du livreur : fait (/livreur). Limite : les alertes (son, vibration, notification) fonctionnent application ouverte ; une alerte application fermée demande des notifications push (clés VAPID et petit serveur), à décider. L'itinéraire pas à pas s'ouvre dans l'application de cartes du téléphone (gratuit).
4. Aide : `TourGuide` et `data-tour` (agent 6) ne sont pas posés ; `HelpButton` de l'agent 2 pointe vers /aide?sujet=, celui du dashboard vers /aide?page= : à vérifier que /aide comprend les deux.
5. Colonne `slogan` (agent 5), lecture du téléphone client par le personnel (agent 3), noms/photos des demandeurs visibles du patron (agent 4) : demandes à la base non appliquées, le site marche sans.
6. Google OAuth pour l'équipe (agent 4) : à activer dans Supabase si souhaité.
7. Écran admin NGF : non fait.
8. Numéro WhatsApp et e-mail du support : `src/config/public.ts`.
9. Nom définitif de l'application : `src/config/app.ts`.
