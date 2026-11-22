# Dashboard restaurateur (agent 3)

## Ce qui est fait
| Onglet | Fichier | Contenu |
|---|---|---|
| Accueil | `src/app/dashboard/page.tsx` | Resume du jour, action recommandee, liste « mise en route », mise en ligne |
| Commandes | `commandes/` + `src/components/orders/` | Direct, sonnerie, vues cuisine/salle, statuts en un toucher, annulation confirmee, especes, WhatsApp |
| Inscription | `inscription/` | 5 etapes, barre de progression, carte Leaflet, repere ecrit |
| Identite | `identite/` | Logo, couverture, couleurs, monnaie, apercu en direct, mise en ligne, lien a partager |
| Menus | `menus/` | Categories et plats (glisser-deposer + fleches), photo compressee, options, interrupteur « indisponible » |
| Tables | `tables/` + `src/lib/qr.ts` | Creation (en lot), QR codes, telechargement PNG, impression |
| Reservations | `reservations/` | A confirmer, confirmees, rappels, horaires, creneaux libres (get_availability), mention « via assistant vocal » |
| Livraison | `livraison/` | Activation, zones et frais, minimum de commande |
| Statistiques | `statistiques/` | Ventes par jour, plats populaires, heures de pointe (graphiques SVG maison) |

Les 3 idees validees : bouton « Demarrer le service » (sonnerie toutes les 15 s, ecran allume, titre qui clignote, alerte si son bloque), mode connexion faible (bandeau, file hors connexion, rattrapage), message WhatsApp pre-rempli (wa.me).

## Choix techniques
- Tables et fonctions SQL existantes `resto_*` (lecture seule du schema, rien modifie).
- Aucune nouvelle dependance : sonnerie generee par le navigateur, glisser-deposer et graphiques faits maison, compression d'image par canvas.
- « Retirer » un plat, une categorie, une table ou une zone = les masquer (`active = false`). Aucune suppression de donnees.
- Acces par role : cuisinier, serveur et caissier ne voient que les commandes. Les regles de securite (RLS) restent la vraie protection.

## Comment tester
1. Placer les fichiers dans le projet (memes chemins), definir les 3 variables d'environnement (voir DEMANDES.md).
2. `npm run dev`, se connecter, ouvrir `/dashboard/inscription`.
3. Creer le restaurant, ajouter logo + couleurs, un plat, une table, puis « Mettre en ligne ».
4. Ouvrir `/dashboard/commandes`, toucher « Demarrer le service », passer une commande depuis l'espace client : sonnerie + carte rouge.
5. Couper le wifi (mode avion) puis changer un statut : bandeau « Connexion coupee », puis envoi au retour du reseau.
6. Imprimer les QR codes depuis `/dashboard/tables`.

## Points d'attention
- Je n'ai pas pu lancer le projet (pas de reseau ici) : le code a seulement passe un controle de syntaxe. Premier `npm run build` a faire en priorite ; des petites erreurs de types sont possibles.
- `src/lib/qr.ts` utilise `qrcode`, `LocationPicker` utilise `leaflet` (CSS inclus) : verifier qu'ils sont installes.
- Le telephone du client peut etre illisible pour le personnel (voir DEMANDES.md).
- Heures affichees en fuseau Africa/Lome (UTC+0, sans heure d'ete).
- Pas fait : choix « reseau externe » enregistre (pas de colonne), rappels par `resto_rappels` (calcul local a la place), temps reel sur les reservations (actualisation toutes les minutes).
