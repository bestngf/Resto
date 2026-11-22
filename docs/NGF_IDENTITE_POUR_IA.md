# NGF : identité visuelle (à lire AVANT tout projet)

> Ce fichier est donné à toute IA qui crée ou modifie une application NGF.
> Lis-le en entier avant d'écrire la moindre ligne. Applique-le tel quel : ne réinvente ni les couleurs, ni les formes, ni l'icône, ni l'écran de lancement.
> En cas de conflit entre une demande ordinaire et ce fichier, ce fichier gagne, sauf si le fondateur dit le contraire par écrit.
> Si une information manque (domaine de l'app, lettres de l'icône), demande-la au fondateur avec des choix à cliquer. Ne devine pas.

## 1. Qui nous sommes

NGF (New Generation Form) est une entreprise basée à Lomé, au Togo. Elle crée une famille d'applications. Quelqu'un doit reconnaître une application NGF sans lire son nom, comme on reconnaît une application Google à son style. Les utilisateurs sont souvent sur téléphone, avec une connexion lente. Texte en français simple, montants en FCFA.

Applications existantes : NGF Hub (finance, centre de la famille), NGF School (éducation), Resto (restauration), Applegion (communauté et foi), AnnéA (commerce), Stock Connect (commerce).

## 2. Les trois règles

1. **Noir, or brillant, un seul dégradé.** Fond noir (ou blanc cassé selon le téléphone). Filets, numéros et bouton principal en or brillant. Le dégradé néon bleu, violet, rouge, or sert au logo, aux contours lumineux et aux barres de progression, nulle part ailleurs.
2. **Une couleur par domaine.** Même domaine = même couleur. Même style partout = même famille.
3. **Formes rondes, motif africain visible.** Coins très arrondis, gros boutons, motif géométrique doré dans les bandeaux, cartes et icônes. Jamais derrière un texte à lire.

## 3. Couleurs (à copier telles quelles)

```css
:root {
  /* clair (valeurs de base) */
  --bg:#F5F3EE; --surface:#FFFFFF; --surface-2:#ECE9E1; --fg:#14141A; --muted:#5B5A63; --line:#D9D5CA;
  --gold:#8A6508;            /* or lisible comme TEXTE sur fond clair */
  --ink:#08080B;             /* texte posé sur de l'or ou une couleur vive */
  --ngf-black:#08080B; --ngf-gold:#E8C45A; --ngf-red:#EF2B3A;
  --foil:linear-gradient(135deg,#FFF1B8 0%,#E8C45A 28%,#B8860B 58%,#F6DE8D 82%,#C99A2E 100%);
  --neon:linear-gradient(100deg,#1F5BFF 0%,#6D28D9 22%,#9333EA 48%,#EF2B3A 78%,#E0B54A 100%);
  /* domaines */
  --d-hub:#E0B54A; --d-school:#2F6BFF; --d-resto:#FB7A3C; --d-foi:#A78BFA; --d-commerce:#34D399; --d-ia:#EF3B4B;
  --radius:24px; --radius-sm:14px;
  --font-display:'Nunito','Trebuchet MS',system-ui,sans-serif; --font-body:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
}
/* sombre : suit le téléphone, et le réglage manuel s'il existe */
@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]){
  --bg:#08080B; --surface:#121218; --surface-2:#1B1B24; --fg:#F5F3EE; --muted:#A3A2AD; --line:#2F2A1C; --gold:#E8C45A; color-scheme:dark } }
:root[data-theme="dark"]{ --bg:#08080B; --surface:#121218; --surface-2:#1B1B24; --fg:#F5F3EE; --muted:#A3A2AD; --line:#2F2A1C; --gold:#E8C45A; color-scheme:dark }
body{ background:var(--bg); color:var(--fg); font:400 16px/1.6 var(--font-body) }
```

| Domaine | Variable | Couleur | Applications |
|---|---|---|---|
| Finance et Hub | `--d-hub` | or `#E0B54A` | NGF Hub, paiements |
| Éducation | `--d-school` | bleu roi `#2F6BFF` | NGF School |
| Restauration | `--d-resto` | orange `#FB7A3C` | Resto |
| Communauté et foi | `--d-foi` | violet `#A78BFA` | Applegion |
| Commerce | `--d-commerce` | vert `#34D399` | AnnéA, Stock Connect |
| IA et outils | `--d-ia` | rouge `#EF3B4B` | assistants IA |

Règles :
- La couleur du domaine sert aux accents : lettres de l'icône, pastilles, liens, éléments actifs, barres. Le fond reste noir ou blanc cassé.
- Le texte posé sur une couleur vive ou sur l'or est toujours `--ink` (noir). Contraste minimum 4,5:1 pour le texte normal.
- **Interdits** : rose, jaune citron (l'or est le seul jaune), bleu pâle ou cyan délavé, dégradés autres que `--neon` et `--foil`, ombres noires dures, fond pur `#000` ou `#FFF` pour les pages.

## 4. Typographie

- Titres, boutons, logo : **Nunito** (800 ou 900). Texte : **Inter** (400 à 600).
- Chargement : Google Fonts avec `display=swap`. Prévoir toujours la police de secours (déjà dans les variables).
- Titres avec `text-wrap:balance`. Texte courant 16 px minimum, jamais en dessous de 14 px.

## 5. Formes et composants

- Coins : cartes et en-têtes `--radius` (24 px), boutons en pilule (999 px), champs `--radius-sm` (14 px).
- Cible tactile : 48 px de haut minimum pour tout ce qu'on touche.

```css
.btn{font:800 .95rem/1 var(--font-display);border:3px solid transparent;border-radius:999px;padding:14px 24px;min-height:50px;cursor:pointer;color:var(--ink)}
.btn:focus-visible{outline:3px solid var(--gold);outline-offset:3px}
.btn.primary{background:var(--foil) padding-box,var(--neon) border-box;box-shadow:0 8px 26px rgba(239,43,58,.28)}   /* UN seul par écran */
.btn.gold{background:transparent;color:var(--gold);border-color:var(--gold)}
.btn.ghost{background:var(--surface-2);color:var(--fg)}
.card{background:linear-gradient(var(--surface),var(--surface)) padding-box,var(--foil) border-box;border:2px solid transparent;border-radius:var(--radius);padding:22px}
.field input{font:inherit;color:var(--fg);background:var(--surface-2);border:2px solid transparent;border-radius:var(--radius-sm);padding:13px 14px;min-height:48px}
.field input:focus-visible{outline:none;border-color:#E8C45A;box-shadow:0 0 0 4px rgba(232,196,90,.25)}
```

- **En-tête d'application** : cadre doré (`--foil` en bordure), fond `#0B0B10` avec le motif africain à 20 %, mot « NGF » en dégradé `--neon` à gauche, nom de l'app à côté, et la mention « par New Generation Form » en petit dessous.
- États : succès vert `#34D399`, attention orange `#FB7A3C`, erreur rouge `#EF3B4B`, toujours accompagnés d'un mot ou d'une icône (jamais la couleur seule).

## 6. Motif africain

Tuile de 64 px (zigzags et losanges dorés, points rouges), à répéter en `background-size:64px`.

```css
--pattern:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cpath d='M0 32 16 16l16 16 16-16 16 16M0 64 16 48l16 16 16-16 16 16' fill='none' stroke='%23E0B54A' stroke-width='2.6' stroke-linejoin='round'/%3E%3Cpath d='M32 4 40 12 32 20 24 12Z' fill='%23E0B54A'/%3E%3Cpath d='M32 8 36 12 32 16 28 12Z' fill='%2308080B'/%3E%3Ccircle cx='8' cy='8' r='2.6' fill='%23EF2B3A'/%3E%3Ccircle cx='56' cy='8' r='2.6' fill='%23EF2B3A'/%3E%3C/svg%3E");
```

Bande « kente » (séparateur de sections, haut des écrans de lancement) :
`.kente{height:12px;background:repeating-linear-gradient(90deg,#E8C45A 0 26px,#EF2B3A 26px 38px,#08080B 38px 42px,#2F6BFF 42px 56px,#E8C45A 56px 60px,#9333EA 60px 74px,#08080B 74px 78px)}`

Où le mettre : bandeaux, coin des cartes (opacité 26 à 34 %, masqué en dégradé radial), en-tête, icônes, écran de lancement, états vides.
Où ne jamais le mettre : derrière un paragraphe, un formulaire, un tableau ou un prix.

## 7. Icônes d'application

Carré arrondi (rayon 28 %), fond noir brillant, double filet or, motif africain à 30 %, reflet de verre en haut. Au centre : **deux lettres dessinées**, traits carrés taillés (angles à 45°), dans la couleur du domaine, avec un filet d'or brillant au centre du trait. Zigzags dorés en haut et en bas, un point rouge au milieu de chacun.

- Les deux lettres sont les deux premières lettres du nom de l'app, en capitales (HB, SC, RE, AP, AN, ST). Si deux apps donnent les mêmes lettres, change la seconde (Stock Connect = ST, pas SC).
- Les deux lettres ont la couleur du domaine. L'icône du Hub (domaine or) garde le même gabarit.
- Pour une lettre absente de la liste ci-dessous, la dessiner dans la même grammaire : grille 24 × 34, droites et chanfreins à 45°, jamais de courbes.

Générateur (renvoie du SVG, utilisable pour l'icône, le favicon, le manifeste) :

```js
const NGF_LETTRES={H:'M3 3V31M21 3V31M3 17H21',B:'M3 31V3H15L20 7V12L15 16H3M15 16L21 20V27L16 31H3',S:'M21 7L17 3H8L3 8V12L8 16H17L21 20V26L17 31H8L3 27',C:'M21 7L17 3H8L3 8V26L8 31H17L21 27',R:'M3 31V3H16L21 8V12L16 17H3M14 17L21 31',E:'M21 3H3V31H21M3 17H17',A:'M2 31L12 3L22 31M6 22H18',P:'M3 31V3H16L21 8V13L16 18H3',N:'M3 31V3L21 31V3',T:'M2 3H22M12 3V31'};
function ngfIcone(a,b,couleur,taille=512){
  const zh='M6 11L10 6L14 11L18 6L22 11L26 6L30 11L34 6L38 11L42 6L46 11L50 6L54 11L58 6',zb='M6 53L10 58L14 53L18 58L22 53L26 58L30 53L34 58L38 53L42 58L46 53L50 58L54 53L58 58';
  const L=(k,x)=>`<g transform="translate(${x} 15)"><path d="${NGF_LETTRES[k]}" fill="none" stroke="${couleur}" stroke-width="7" stroke-linecap="square"/><path d="${NGF_LETTRES[k]}" fill="none" stroke="url(#f)" stroke-width="1.8" stroke-linecap="square"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${taille}" height="${taille}"><defs><linearGradient id="f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF1B8"/><stop offset=".3" stop-color="#E8C45A"/><stop offset=".6" stop-color="#B8860B"/><stop offset="1" stop-color="#F6DE8D"/></linearGradient></defs><rect width="64" height="64" rx="18" fill="#0B0B10"/><rect x="1.5" y="1.5" width="61" height="61" rx="16.5" fill="none" stroke="url(#f)" stroke-width="2.4"/><path d="${zh}" fill="none" stroke="url(#f)" stroke-width="2.2"/><path d="${zb}" fill="none" stroke="url(#f)" stroke-width="2.2"/><circle cx="32" cy="8.5" r="1.8" fill="#EF2B3A"/><circle cx="32" cy="55.5" r="1.8" fill="#EF2B3A"/>${L(a,7)}${L(b,33)}</svg>`;
}
// exemple : ngfIcone('R','E','#FB7A3C')
```

Livrer pour chaque app : icône 512 × 512 et 192 × 192 (PNG, fond plein, avec une version « maskable » où les lettres restent dans les 80 % centraux), favicon, icône Apple 180 × 180.

## 8. Écran de lancement (obligatoire dans toute app)

Au démarrage, avant l'application : fond noir avec motif africain et bande kente en haut. Le N tombe et s'écrase comme de la gélatine, le G arrive en roulant, le F glisse en dérapant (dégradé néon), le logo se secoue, puis « New Generation Form » s'écrit lettre par lettre en or brillant (chaque lettre fait un petit saut), puis les trois lettres sautent en vague. Pas d'explosion, pas d'autre effet.

- Première ouverture : version complète (environ 4,5 s). Ouvertures suivantes : version courte (environ 1,5 s). Un toucher passe l'animation.
- Si le téléphone désactive les animations, le nom s'affiche d'un coup, puis l'app apparaît après 1 s.
- Le composant ci-dessous est complet : le copier dans le projet (par exemple `public/ngf-splash.js`), le charger, puis appeler `ngfSplash({ onDone: demarrerApp })` au démarrage. Pas de bibliothèque requise.

```js
/* NGF : écran de lancement. Copier tel quel dans l'application, puis appeler ngfSplash() au démarrage. */
(function (g) {
  var CSS = ".ngf-sp{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;align-content:center;gap:18px;background:radial-gradient(ellipse at 50% 40%,#1a1426 0%,#08080B 70%);color:#F5F3EE;overflow:hidden;transition:opacity .35s}"
  + ".ngf-sp.out{opacity:0}"
  + ".ngf-sp::before{content:'';position:absolute;inset:0;background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cpath d='M0 32 16 16l16 16 16-16 16 16M0 64 16 48l16 16 16-16 16 16' fill='none' stroke='%23E0B54A' stroke-width='2.6' stroke-linejoin='round'/%3E%3Cpath d='M32 4 40 12 32 20 24 12Z' fill='%23E0B54A'/%3E%3Cpath d='M32 8 36 12 32 16 28 12Z' fill='%2308080B'/%3E%3Ccircle cx='8' cy='8' r='2.6' fill='%23EF2B3A'/%3E%3Ccircle cx='56' cy='8' r='2.6' fill='%23EF2B3A'/%3E%3C/svg%3E\");opacity:.38;-webkit-mask-image:radial-gradient(ellipse at 50% 42%,transparent 18%,#000 85%);mask-image:radial-gradient(ellipse at 50% 42%,transparent 18%,#000 85%)}"
  + ".ngf-sp .k{position:absolute;left:0;right:0;top:0;height:12px;background:repeating-linear-gradient(90deg,#E8C45A 0 26px,#EF2B3A 26px 38px,#08080B 38px 42px,#2F6BFF 42px 56px,#E8C45A 56px 60px,#9333EA 60px 74px,#08080B 74px 78px)}"
  + ".ngf-sp .logo{position:relative;display:flex;font:900 clamp(5rem,30vw,10rem)/1 Nunito,'Trebuchet MS',system-ui,sans-serif;filter:drop-shadow(0 0 26px rgba(239,43,58,.35)) drop-shadow(0 0 40px rgba(124,58,237,.5))}"
  + ".ngf-sp .logo span{display:inline-block;opacity:0;transform-origin:50% 90%;background:linear-gradient(100deg,#1F5BFF 0%,#6D28D9 22%,#9333EA 48%,#EF2B3A 78%,#E0B54A 100%);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent}"
  + ".ngf-sp .logo span:nth-child(1){background-position:0 0}.ngf-sp .logo span:nth-child(2){background-position:50% 0}.ngf-sp .logo span:nth-child(3){background-position:100% 0}"
  + ".ngf-sp .logo.go span:nth-child(1){animation:ngfN 1s cubic-bezier(.3,.7,.4,1) .2s forwards}"
  + ".ngf-sp .logo.go span:nth-child(2){animation:ngfG 1.1s cubic-bezier(.3,.7,.4,1) .6s forwards}"
  + ".ngf-sp .logo.go span:nth-child(3){animation:ngfF 1.1s cubic-bezier(.3,.7,.4,1) 1s forwards}"
  + ".ngf-sp .logo.quick span{animation:ngfPop .3s cubic-bezier(.2,.9,.3,1.4) forwards}"
  + ".ngf-sp .logo.quick span:nth-child(2){animation-delay:.12s}.ngf-sp .logo.quick span:nth-child(3){animation-delay:.24s}"
  + ".ngf-sp .logo.jelly span{opacity:1;animation:ngfJelly .7s ease-in-out}"
  + ".ngf-sp .logo.wave span{opacity:1;animation:ngfHop .6s ease-in-out}.ngf-sp .logo.wave span:nth-child(2){animation-delay:.1s}.ngf-sp .logo.wave span:nth-child(3){animation-delay:.2s}"
  + ".ngf-sp .logo.done span{opacity:1;animation:none}"
  + ".ngf-sp .nm{position:relative;display:flex;flex-wrap:wrap;justify-content:center;min-height:1.6em;font:800 clamp(.9rem,4vw,1.3rem)/1.2 Nunito,'Trebuchet MS',system-ui,sans-serif;letter-spacing:.3em;text-transform:uppercase;padding:0 16px;text-align:center}"
  + ".ngf-sp .nm i{font-style:normal;display:inline-block;background:linear-gradient(135deg,#FFF1B8,#E8C45A 30%,#B8860B 60%,#F6DE8D 82%,#C99A2E);-webkit-background-clip:text;background-clip:text;color:transparent;animation:ngfPopL .45s cubic-bezier(.2,.9,.3,1.4) both}"
  + ".ngf-sp .nm i.sp{width:.6em}"
  + "@keyframes ngfN{0%{transform:translateY(-160%) scale(.85,1.35);opacity:0}50%{transform:translateY(0) scale(1.3,.65);opacity:1}68%{transform:translateY(-26%) scale(.88,1.15)}84%{transform:translateY(0) scale(1.1,.92)}100%{transform:none;opacity:1}}"
  + "@keyframes ngfG{0%{transform:translateX(-170%) rotate(-600deg);opacity:0}60%{transform:translateX(9%) rotate(22deg);opacity:1}80%{transform:translateX(-4%) rotate(-9deg)}100%{transform:none;opacity:1}}"
  + "@keyframes ngfF{0%{transform:translateX(170%) skewX(-32deg);opacity:0}55%{transform:translateX(-12%) skewX(14deg);opacity:1}78%{transform:translateX(4%) skewX(-6deg)}100%{transform:none;opacity:1}}"
  + "@keyframes ngfPop{0%{transform:scale(.3) rotate(-10deg);opacity:0}70%{transform:scale(1.15);opacity:1}100%{transform:none;opacity:1}}"
  + "@keyframes ngfJelly{0%,100%{transform:none}22%{transform:scale(1.16,.84)}46%{transform:scale(.9,1.14)}70%{transform:scale(1.06,.96)}}"
  + "@keyframes ngfHop{0%,100%{transform:none}40%{transform:translateY(-22%) rotate(-5deg) scale(1.06)}}"
  + "@keyframes ngfPopL{0%{transform:translateY(.7em) scale(.2) rotate(-14deg);opacity:0}60%{transform:translateY(-.3em) scale(1.4) rotate(7deg);opacity:1}100%{transform:none;opacity:1}}";

  g.ngfSplash = function (opts) {
    opts = opts || {};
    var full = 'New Generation Form', timers = [], finished = false;
    var short = opts.short;
    try { if (short === undefined) { short = localStorage.getItem('ngf_splash_seen') === '1'; localStorage.setItem('ngf_splash_seen', '1'); } } catch (e) { short = !!short; }
    var reduce = g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var el = document.createElement('div'); el.className = 'ngf-sp'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'NGF, New Generation Form');
    el.innerHTML = '<div class="k"></div><div class="logo"><span>N</span><span>G</span><span>F</span></div><div class="nm"></div>';
    document.body.appendChild(el);
    var logo = el.querySelector('.logo'), nm = el.querySelector('.nm');
    function later(f, t) { timers.push(setTimeout(f, t)); }
    function end() {
      if (finished) return; finished = true; timers.forEach(clearTimeout);
      el.classList.add('out');
      setTimeout(function () { el.remove(); st.remove(); if (opts.onDone) opts.onDone(); }, 350);
    }
    function type(delay, speed) {
      full.split('').forEach(function (ch, i) {
        later(function () { var l = document.createElement('i'); l.textContent = ch === ' ' ? ' ' : ch; if (ch === ' ') l.className = 'sp'; nm.appendChild(l); }, delay + i * speed);
      });
      return delay + full.length * speed;
    }
    el.addEventListener('click', end);
    if (reduce) { logo.className = 'logo done'; nm.textContent = full; nm.style.color = '#E8C45A'; later(end, 900); }
    else if (short) { logo.className = 'logo quick'; var t = type(450, 22); later(function () { logo.className = 'logo done'; }, 700); later(end, t + 500); }
    else {
      logo.className = 'logo go';
      later(function () { logo.className = 'logo jelly'; }, 2150);
      later(function () { var t = type(0, 55); later(function () { logo.className = 'logo wave'; }, t + 150); later(end, t + 900); }, 2900);
    }
    return { skip: end };
  };
})(window);
```

## 9. Terrain et accessibilité

- Téléphone d'abord : tout doit marcher à 360 px de large, sans défilement horizontal.
- Connexion lente : pas d'image lourde (pas de fonds photo), polices avec secours, animations en CSS.
- Respecter `prefers-reduced-motion`. Focus clavier toujours visible. Étiquettes sur tous les champs.
- Textes en français simple, phrases courtes, boutons qui disent ce qui va se passer (« Commander », « Payer 2 500 FCFA »). Nombres avec séparateur d'espace et « FCFA ».
- Les secrets (clés, mots de passe) ne vont jamais dans le code visible ni dans les fichiers de design.

## 10. Nouveau domaine ou nouvelle couleur

Si l'app n'entre dans aucun domaine : demande au fondateur de choisir. Ne crée pas de couleur toi-même sans accord. Une nouvelle couleur de domaine doit être vive, différente des six existantes, lisible avec du texte noir dessus (contraste 4,5:1), et ne pas être rose, jaune ni bleu pâle. Une fois choisie, propose de l'ajouter à ce fichier.

## 11. Liste de contrôle avant de rendre le travail

- [ ] Fond noir ou blanc cassé selon le téléphone, les deux modes sont lisibles.
- [ ] Un seul bouton principal par écran, boutons de 48 px minimum.
- [ ] Couleur du domaine utilisée en accent, texte noir sur couleurs vives.
- [ ] Icône à deux lettres livrée dans toutes les tailles, plus le favicon.
- [ ] Écran de lancement présent, version courte après la première ouverture.
- [ ] Motif africain visible dans l'en-tête et les bandeaux, jamais derrière du texte.
- [ ] Aucun rose, jaune, cyan pâle, ni dégradé hors `--neon` et `--foil`.
- [ ] Testé à 360 px de large, sans défilement horizontal.
- [ ] Charte vue en ligne : https://claude.ai/artifact/DkyAE3zBNnS9p4W4UWZsCf (aperçu visuel de tout ce qui précède).
