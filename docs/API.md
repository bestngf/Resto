# API serveur Resto (fonction Supabase « resto-api »)

Adresse : `https://dzexnotznapokxrfjnkq.supabase.co/functions/v1/resto-api` (déjà dans `src/config/public.ts`). Le site l'appelle avec `src/lib/resto-api.ts`.
Réponse d'erreur : `{ "error": "<code>", "message": "<texte français>" }`.

| Route | Rôle |
|---|---|
| POST /orders | crée une commande, avec ou sans compte ; prix et total recalculés par la base |
| GET /orders?code= ou ?id= | suivi (état, paiement, lien WhatsApp, `can_retry`) |
| POST /orders/cancel | annule tant que la commande est « reçue » et non payée |
| POST /payments/init | démarre ou reprend le paiement mobile money (aucun montant accepté) |
| GET /payments/status | état du paiement |
| POST /reservations | réservation (limitation par adresse réseau et par téléphone, source fixée à « site » ou « app ») |
| POST /voice | assistant vocal (signature obligatoire) |

Directement par le navigateur (règles d'accès de la base) : disponibilités `get_availability`, confirmation des espèces `resto_confirm_cash`, statuts de commande `resto_set_order_status`, livreur `resto_assign_courier`.
Le paiement revient du Hub NGF vers `ngf-bridge` (déjà déployé) : aucune notification n'arrive sur Netlify.

## Assistant vocal : à finaliser
Dans `supabase/functions/resto-api/index.ts`, `verifySignature` et `parseProviderPayload` sont à adapter avec la documentation du fournisseur. Il faut aussi définir le secret `VOICE_WEBHOOK_SECRET` de la fonction (Supabase, Edge Functions, Secrets). Tant qu'il est absent, la route voix répond « non configuré ».
