-- Contenu du centre d'aide (agent 6). Insertion seulement : ne remplace jamais un article existant.
-- Tout est en published = false sauf 'glossaire' et 'contacter-le-support'.
-- Quand une fonction existe vraiment dans l'application :
--   update resto_help_articles set published = true, updated_at = now() where slug = '...';

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$s-inscrire-restaurateur$hlp$, $hlp$demarrer$hlp$, $hlp$S'inscrire comme restaurateur$hlp$, $hlp$Inscrire votre restaurant prend quelques minutes. L'inscription se fait par étapes, avec une barre de progression qui montre où vous en êtes.

::illustration inscription

## Avant de commencer
- Votre numéro de téléphone
- Le nom de votre restaurant
- Votre type de cuisine
- L'endroit où se trouve votre restaurant

## Les étapes
1. Indiquez votre numéro et le nom de votre restaurant.
2. Choisissez votre type de cuisine.
3. Placez votre restaurant sur la carte, puis écrivez un repère simple, par exemple « en face de la pharmacie ».
4. Vérifiez vos informations et validez. Votre restaurant est créé.

> Astuce : un repère écrit aide autant que la carte, surtout quand les adresses sont informelles.

## Votre essai de 30 jours
Votre premier restaurant démarre avec 30 jours d'essai, avec les possibilités du plan Business. Vous êtes prévenu 10 jours avant la fin. Ensuite, vous passez automatiquement au plan Gratuit, sauf si vous choisissez un autre plan. Voir [Plans et tarifs](/aide/plans-et-tarifs).

## Et ensuite ?
Ajoutez votre logo et vos couleurs ([guide](/aide/creer-identite-visuelle)), puis votre menu ([guide](/aide/ajouter-un-menu)).$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$s-inscrire-restaurateur$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$creer-identite-visuelle$hlp$, $hlp$restaurateur$hlp$, $hlp$Créer l'identité visuelle de mon restaurant$hlp$, $hlp$Votre logo, vos couleurs et votre devise donnent son visage à votre restaurant. Le site et l'application les reprennent automatiquement.

::illustration identite

## Pas à pas
1. Ouvrez l'onglet **Identité**.
2. Ajoutez votre logo. Il doit être en JPEG, PNG ou WebP et peser 1 Mo au maximum.
3. Choisissez vos couleurs.
4. Vérifiez la devise (le FCFA pour la plupart des restaurants).
5. Ajoutez une photo de couverture (3 Mo au maximum).
6. Regardez l'aperçu en direct : il montre votre site et votre application pendant que vous modifiez.
7. Enregistrez.

> Astuce : si les couleurs choisies rendent le texte difficile à lire, l'application corrige automatiquement la couleur du texte.

## Si le logo est refusé
Vérifiez le format (JPEG, PNG ou WebP) et le poids (1 Mo au maximum). Réduire la taille de l'image avec une application de retouche de votre téléphone suffit en général.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$creer-identite-visuelle$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$ajouter-un-menu$hlp$, $hlp$restaurateur$hlp$, $hlp$Ajouter mon menu et mes plats$hlp$, $hlp$Mettez votre menu en ligne avec des photos et des prix en FCFA. Vos clients le voient tout de suite.

## Pas à pas
1. Ouvrez l'onglet **Menus**.
2. Créez vos catégories, par exemple Entrées, Plats, Boissons.
3. Ajoutez un plat : nom, prix en FCFA et photo. La photo (2 Mo au maximum, JPEG, PNG ou WebP) est compressée automatiquement.
4. Ajoutez des options si besoin, par exemple le piment ou l'accompagnement.
5. Rangez vos catégories et vos plats par glisser-déposer.
6. Enregistrez.

## Retirer un plat épuisé
Quand un plat n'est plus disponible, utilisez l'interrupteur « indisponible aujourd'hui ». Le plat disparaît du menu en un clic, et vous le remettez de la même façon demain.

## Combien de plats puis-je ajouter ?
Cela dépend de votre plan : 20 plats en Gratuit, 80 en Essentiel, 300 en Pro, sans limite en Business. Voir [Plans et tarifs](/aide/plans-et-tarifs).$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$ajouter-un-menu$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$tables-et-qr-codes$hlp$, $hlp$restaurateur$hlp$, $hlp$Créer mes tables et imprimer les QR codes$hlp$, $hlp$Chaque table a son QR code. Le client le scanne avec son téléphone et sa commande arrive directement chez vos serveurs.

::illustration parcours-qr

## Pas à pas
1. Ouvrez l'onglet **Tables**.
2. Créez vos tables (une par table de votre salle).
3. Générez le QR code de chaque table.
4. Imprimez-les en PDF ou téléchargez-les en image.
5. Collez chaque QR code sur la bonne table.
6. Scannez-en un avec votre téléphone pour tester.

> Astuce : imprimez les QR codes assez grands et protégez-les avec du plastique transparent.

## Combien de tables puis-je créer ?
5 en Gratuit, 15 en Essentiel, 50 en Pro, sans limite en Business.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$tables-et-qr-codes$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$recevoir-traiter-commandes$hlp$, $hlp$restaurateur$hlp$, $hlp$Recevoir et traiter les commandes$hlp$, $hlp$Les commandes arrivent en direct sur votre écran, avec une sonnerie.

::illustration flux-commande

## Pas à pas
1. Ouvrez l'onglet **Commandes** et gardez l'écran ouvert.
2. À l'arrivée d'une commande, la sonnerie retentit.
3. Touchez la commande pour la passer à l'étape suivante : reçue, en préparation, prête, puis servie ou en route.
4. Utilisez la vue cuisine ou la vue salle selon votre poste.

## Paiement
Une commande payée par mobile money apparaît comme payée. Pour une commande payée en espèces, vous confirmez que vous avez bien encaissé.

> Astuce : si vous n'entendez pas la sonnerie, lisez [Je n'entends pas la sonnerie](/aide/pas-de-sonnerie).

## Le temps d'attente
Un compteur indique depuis combien de temps chaque commande attend, pour ne laisser personne oublié.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$recevoir-traiter-commandes$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$gerer-reservations$hlp$, $hlp$restaurateur$hlp$, $hlp$Gérer les réservations$hlp$, $hlp$Vos clients réservent un créneau libre. Vous confirmez ou refusez depuis votre agenda.

## Préparer votre agenda
1. Ouvrez l'onglet **Réservations**.
2. Indiquez vos horaires d'ouverture.
3. Indiquez le nombre de places disponibles et vos créneaux.

## Traiter une demande
1. Ouvrez la demande.
2. Confirmez ou refusez. Le client est prévenu.
3. Des rappels s'affichent dans l'application.

Les réservations prises par l'assistant vocal au téléphone apparaissent avec la mention « via assistant vocal ».

## Limite de réservations
Le nombre de réservations par mois dépend de votre plan : 30 en Gratuit, 200 en Essentiel, sans limite en Pro et Business.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$gerer-reservations$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$inviter-valider-equipe$hlp$, $hlp$restaurateur$hlp$, $hlp$Inviter et valider mon équipe$hlp$, $hlp$Vos employés rejoignent le restaurant eux-mêmes. Vous gardez le contrôle : rien ne s'ouvre sans votre validation.

::illustration equipe

## Inviter
1. Ouvrez l'onglet **Équipe**.
2. Partagez le lien ou le QR code « Rejoindre l'équipe ».
3. Votre employé crée son profil (nom, téléphone, photo facultative) et choisit le restaurant.

## Valider une demande
1. Vous recevez une notification dans l'application.
2. Ouvrez la demande.
3. Validez ou refusez, puis choisissez le rôle.

Tant que la demande est en attente, la personne n'a **aucun accès** aux données du restaurant.

## Les rôles
- **Patron** et **gérant** : gèrent le restaurant et valident l'équipe.
- **Serveur** : voit les commandes de la salle.
- **Cuisinier** : voit la cuisine.
- **Caissier** : voit les paiements.

## À savoir
- Seuls le patron et le gérant peuvent valider une demande.
- Un gérant ne peut pas donner le rôle de patron.
- On ne peut pas retirer le dernier patron.
- Vous pouvez changer un rôle, suspendre ou retirer un membre à tout moment.
- Une même personne peut appartenir à plusieurs restaurants.

## Taille de l'équipe
1 personne en Gratuit, 3 en Essentiel, 10 en Pro, 30 en Business.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$inviter-valider-equipe$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$configurer-livraison$hlp$, $hlp$restaurateur$hlp$, $hlp$Configurer la livraison$hlp$, $hlp$Choisissez qui livre et combien le client paie.

## Pas à pas
1. Ouvrez l'onglet **Livraison**.
2. Créez vos zones de livraison.
3. Indiquez les frais de chaque zone.
4. Choisissez : **mes livreurs** (vos propres livreurs) ou **réseau externe** (livreurs indépendants).

Le client voit les frais de livraison avant de valider sa commande, selon sa zone.

> À savoir : le réseau de livreurs indépendants sera branché plus tard. En attendant, utilisez vos propres livreurs.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$configurer-livraison$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$comprendre-statistiques$hlp$, $hlp$restaurateur$hlp$, $hlp$Comprendre les statistiques$hlp$, $hlp$Les statistiques vous montrent comment va votre restaurant, en graphiques simples.

## Ce que vous voyez
- **Les ventes du jour** : combien vous avez vendu aujourd'hui.
- **Les plats les plus commandés** : ceux à toujours garder en stock.
- **Les heures de pointe** : les moments où il y a le plus de commandes, pour bien organiser votre équipe.

## Le résumé du jour
Sur la page d'accueil de votre tableau de bord, un résumé vous dit ce qui compte aujourd'hui et vous propose une action, par exemple « 3 commandes attendent ».

> Astuce : regardez les heures de pointe avant de composer vos équipes de la semaine.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$comprendre-statistiques$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$commander-en-tant-que-client$hlp$, $hlp$client$hlp$, $hlp$Commander en tant que client$hlp$, $hlp$Vous pouvez commander sur place, à emporter ou en livraison.

::illustration parcours-qr

## Sur place
1. Scannez le QR code de votre table.
2. Choisissez vos plats et vos options (piment, accompagnement).
3. Payez en mobile money ou en espèces.
4. Suivez votre commande en direct.

## À emporter
Choisissez « à emporter », composez votre panier, payez, puis passez récupérer votre commande.

## En livraison
1. Choisissez « livraison ».
2. Partagez votre position GPS et écrivez un repère, par exemple « en face de la pharmacie ». Vous pouvez aussi coller une position reçue sur WhatsApp.
3. Les frais de livraison s'affichent selon votre zone.

> Astuce : votre panier est conservé, même si le réseau se coupe.

## Connexion
Pas de mot de passe : vous recevez un lien de connexion par e-mail. Voir [Je ne reçois pas le lien](/aide/connexion-lien-magique) si besoin.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$commander-en-tant-que-client$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$reserver-une-table$hlp$, $hlp$client$hlp$, $hlp$Réserver une table$hlp$, $hlp$Réservez en quelques touches, en choisissant un créneau libre.

::illustration reservation

## Pas à pas
1. Ouvrez le menu **Réserver** ou la page du restaurant.
2. Choisissez la date et le nombre de personnes.
3. Choisissez un créneau libre.
4. Confirmez votre réservation.
5. Attendez la réponse du restaurant. Vous la retrouvez dans votre compte.

Vous pouvez aussi réserver par téléphone : un assistant vocal peut prendre votre réservation.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$reserver-une-table$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$suivre-ma-commande$hlp$, $hlp$client$hlp$, $hlp$Suivre ma commande$hlp$, $hlp$Après votre commande, un suivi en direct vous montre où elle en est.

::illustration flux-commande

## Les étapes
1. **Reçue** : le restaurant a bien reçu votre commande.
2. **En préparation** : la cuisine s'en occupe.
3. **Prête** : vous pouvez la récupérer ou elle part bientôt.
4. **Servie** ou **en route** : bon appétit !

## Ensuite
- Retrouvez vos commandes passées dans votre **compte**, et recommandez en un clic.
- Après la commande, vous pouvez laisser un avis.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$suivre-ma-commande$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$plans-et-tarifs$hlp$, $hlp$paiement$hlp$, $hlp$Plans et tarifs$hlp$, $hlp$Quatre plans, du gratuit au plus complet. Les prix sont par mois.

- **Gratuit** : 0 FCFA. 20 plats, 1 personne dans l'équipe, 5 tables, 30 réservations par mois.
- **Essentiel** : 2 500 FCFA. 80 plats, 3 personnes, 15 tables, 200 réservations par mois, 100 crédits par mois.
- **Pro** : 5 000 FCFA. 300 plats, 10 personnes, 50 tables, réservations sans limite, 400 crédits par mois.
- **Business** : 12 500 FCFA. Plats, tables et réservations sans limite, 30 personnes, 1 500 crédits par mois.

## L'essai de 30 jours
Votre premier restaurant démarre avec 30 jours d'essai avec les limites du plan Business. Vous êtes prévenu 10 jours avant la fin. Ensuite, retour automatique au plan Gratuit.

## Quand une limite est atteinte
Un message vous le dit. Vous passez au plan supérieur pour continuer. Voir [Message « limite atteinte »](/aide/limite-atteinte).$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$plans-et-tarifs$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$credits-comment-ca-marche$hlp$, $hlp$paiement$hlp$, $hlp$Les crédits : comment ça marche$hlp$, $hlp$Les crédits servent à utiliser certains services. **1 crédit vaut 10 FCFA.**

## Ce que coûtent les services
- Résumé de la semaine : 5 crédits
- Appel de l'assistant vocal : 10 crédits
- Fiche de plat : 3 crédits
- Photo de plat : 8 crédits
- Rapport : 5 crédits

## Où trouver des crédits
- Chaque plan payant en donne un certain nombre chaque mois (voir [Plans et tarifs](/aide/plans-et-tarifs)).
- Vous pouvez aussi recharger avec des packs de crédits.
- Les crédits offerts expirent au bout de 60 jours : utilisez-les d'abord.

> Astuce : si vous n'avez plus assez de crédits, l'application vous le dit avant de lancer le service. Rien n'est débité par surprise.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$credits-comment-ca-marche$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$commission-paiement-mobile$hlp$, $hlp$paiement$hlp$, $hlp$La commission sur les paiements mobile money$hlp$, $hlp$Quand un client paie sa commande par mobile money, une commission de **5 %** s'applique. Les paiements en espèces n'ont **aucune commission** (0 %).

## Qui reçoit l'argent ?
- Si votre compte marchand est validé, le paiement arrive directement chez vous. La commission vous est facturée ensuite.
- Sinon, NGF encaisse le paiement, puis vous le reverse.

Les frais de l'opérateur de paiement sont à la charge de NGF, pas à la vôtre.

## Les factures
Vous recevez une facture chaque mois, pour chaque restaurant.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$commission-paiement-mobile$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$payer-par-mobile-money$hlp$, $hlp$paiement$hlp$, $hlp$Payer sa commande par mobile money$hlp$, $hlp$Vous pouvez payer votre commande avec votre compte mobile money, ou en espèces.

## Pas à pas
1. Au moment de payer, choisissez **mobile money**.
2. Suivez les instructions à l'écran, puis confirmez sur votre téléphone.
3. Attendez la confirmation. Votre commande passe en préparation.

## Si le paiement n'apparaît pas
Patientez une minute, puis lisez [Mon paiement n'apparaît pas](/aide/paiement-introuvable).

> Astuce : vous pouvez aussi choisir de payer en espèces au restaurant.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$payer-par-mobile-money$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$pas-de-sonnerie$hlp$, $hlp$depannage$hlp$, $hlp$Je n'entends pas la sonnerie des commandes$hlp$, $hlp$Essayez ces vérifications, dans cet ordre.

1. Vérifiez que le volume du téléphone est monté et que le mode silencieux est désactivé.
2. Gardez l'écran **Commandes** ouvert : la sonnerie ne marche que si l'application est ouverte.
3. Si le navigateur demande l'autorisation de jouer du son, acceptez-la.
4. Touchez une fois l'écran après l'avoir ouvert : certains téléphones n'autorisent le son qu'après un toucher.
5. Fermez puis rouvrez l'application, puis relancez l'écran des commandes.

> Besoin d'un coup de main ? [Écrivez-nous](/aide/contact).$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$pas-de-sonnerie$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$paiement-introuvable$hlp$, $hlp$depannage$hlp$, $hlp$Mon paiement n'apparaît pas$hlp$, $hlp$Un paiement mobile money peut prendre un moment à être confirmé.

1. Patientez une à deux minutes, puis actualisez la page.
2. Vérifiez sur votre téléphone que le montant a bien été débité.
3. Si l'argent est débité mais que la commande n'est pas payée, écrivez-nous avec le nom du restaurant et l'heure du paiement.

Ne payez pas une deuxième fois avant d'avoir vérifié.

> [Contacter le support](/aide/contact)$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$paiement-introuvable$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$connexion-lien-magique$hlp$, $hlp$depannage$hlp$, $hlp$Je ne reçois pas mon lien de connexion$hlp$, $hlp$La connexion se fait sans mot de passe : on vous envoie un lien par e-mail.

1. Vérifiez l'adresse e-mail saisie (une lettre en trop suffit).
2. Regardez dans les courriers indésirables (spam).
3. Patientez quelques minutes, puis demandez un nouveau lien.
4. Ouvrez le lien sur le même téléphone que celui où vous avez demandé la connexion.

> Toujours bloqué ? [Écrivez-nous](/aide/contact).$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$connexion-lien-magique$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$connexion-faible$hlp$, $hlp$depannage$hlp$, $hlp$L'application est lente ou se coupe$hlp$, $hlp$L'application est faite pour marcher même avec un réseau faible.

- Votre panier est conservé si le réseau se coupe.
- Le menu déjà ouvert reste disponible.
- Les guides du centre d'aide se lisent aussi sans réseau, une fois enregistrés dans votre téléphone : voir [Guides enregistrés](/aide/hors-ligne).

## Pour aller plus vite
1. Rapprochez-vous d'un meilleur signal.
2. Fermez les autres applications.
3. Actualisez la page.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$connexion-faible$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$limite-atteinte$hlp$, $hlp$depannage$hlp$, $hlp$Message « limite atteinte »$hlp$, $hlp$Chaque plan a des limites. Quand vous en atteignez une, un message l'indique.

- **Plats** : nombre maximum de plats du menu.
- **Tables** : nombre maximum de tables.
- **Équipe** : nombre maximum de personnes.
- **Réservations** : nombre maximum de réservations par mois.

## Que faire ?
1. Regardez les limites de votre plan : [Plans et tarifs](/aide/plans-et-tarifs).
2. Passez au plan supérieur pour continuer.
3. Ou libérez de la place en retirant un élément que vous n'utilisez plus.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$limite-atteinte$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$faq-gratuit$hlp$, $hlp$faq$hlp$, $hlp$Est-ce gratuit ?$hlp$, $hlp$Le plan **Gratuit** ne coûte rien, sans limite de durée, avec des limites (20 plats, 5 tables, 1 personne, 30 réservations par mois). Les plans payants ajoutent des possibilités. Voir [Plans et tarifs](/aide/plans-et-tarifs).$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$faq-gratuit$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$faq-essai-30-jours$hlp$, $hlp$faq$hlp$, $hlp$Comment fonctionne l'essai de 30 jours ?$hlp$, $hlp$Votre premier restaurant démarre avec 30 jours d'essai, avec les limites du plan Business. Vous êtes prévenu 10 jours avant la fin. Ensuite, vous passez automatiquement au plan Gratuit, sauf si vous choisissez un autre plan.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$faq-essai-30-jours$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$faq-especes-ou-mobile-money$hlp$, $hlp$faq$hlp$, $hlp$Puis-je accepter les espèces et le mobile money ?$hlp$, $hlp$Oui, les deux. Le mobile money a une commission de 5 %. Les espèces n'en ont aucune. Voir [La commission](/aide/commission-paiement-mobile).$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$faq-especes-ou-mobile-money$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$faq-plusieurs-restaurants$hlp$, $hlp$faq$hlp$, $hlp$Puis-je travailler dans plusieurs restaurants ?$hlp$, $hlp$Oui. Une même personne peut appartenir à plusieurs restaurants, avec un rôle différent dans chacun.$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$faq-plusieurs-restaurants$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$faq-retirer-plat$hlp$, $hlp$faq$hlp$, $hlp$Comment retirer un plat épuisé ?$hlp$, $hlp$Dans l'onglet **Menus**, utilisez l'interrupteur « indisponible aujourd'hui » du plat. Il disparaît du menu en un clic. Voir [Ajouter mon menu](/aide/ajouter-un-menu).$hlp$, false
where not exists (select 1 from resto_help_articles where slug = $hlp$faq-retirer-plat$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$glossaire$hlp$, $hlp$glossaire$hlp$, $hlp$Mots utiles$hlp$, $hlp$Les mots de l'application, expliqués simplement.

- **Mobile money** : l'argent sur votre téléphone, avec lequel vous pouvez payer.
- **FCFA** : la monnaie utilisée dans l'application.
- **QR code** : un petit carré noir et blanc que l'on scanne avec le téléphone. Chaque table a le sien.
- **Menu** : la liste des plats d'un restaurant, avec leurs prix.
- **Option** : un choix sur un plat, par exemple le piment ou l'accompagnement.
- **Commande** : ce que le client demande : plats, options, mode (sur place, à emporter, livraison).
- **Sur place** : le client mange au restaurant.
- **À emporter** : le client vient chercher sa commande.
- **Livraison** : la commande est apportée au client.
- **Réservation** : une table gardée pour une date et une heure.
- **Créneau** : une heure disponible pour réserver.
- **Patron** : la personne qui dirige le restaurant dans l'application.
- **Gérant** : la personne qui aide le patron à gérer le restaurant.
- **Serveur, cuisinier, caissier** : les rôles de l'équipe, chacun voit ce dont il a besoin.
- **Demande en attente** : une demande pour rejoindre l'équipe, pas encore validée.
- **Plan** : l'abonnement du restaurant : Gratuit, Essentiel, Pro ou Business.
- **Crédit** : une unité pour utiliser certains services. 1 crédit vaut 10 FCFA.
- **Commission** : le petit pourcentage (5 %) retenu sur les paiements mobile money.
- **Identité visuelle** : le logo, les couleurs et les photos de votre restaurant.
- **Compte marchand** : un compte qui permet de recevoir directement l'argent des paiements mobile money.$hlp$, true
where not exists (select 1 from resto_help_articles where slug = $hlp$glossaire$hlp$);

insert into resto_help_articles (slug, category, title, body, published)
select $hlp$contacter-le-support$hlp$, $hlp$support$hlp$, $hlp$Contacter le support$hlp$, $hlp$Une question, un problème, une idée ? Écrivez-nous.

## Comment nous joindre
- Par **WhatsApp**, avec le bouton de la page [Contact](/aide/contact).
- Avec le **formulaire** de la page [Contact](/aide/contact).

## Pour que nous vous aidions vite
- Dites-nous ce que vous essayiez de faire.
- Indiquez le nom de votre restaurant.
- Ajoutez l'heure approximative du problème.

> Avant de nous écrire, essayez la recherche du [centre d'aide](/aide) : la réponse y est peut-être.$hlp$, true
where not exists (select 1 from resto_help_articles where slug = $hlp$contacter-le-support$hlp$);
