// Recherche instantanee, 100 % cote navigateur, sans dependance.
// Elle ignore les accents et les majuscules, tolere les fautes de frappe,
// et comprend les mots locaux (tmoney, flooz, mixx, momo...).

import type { HelpIndexItem } from "./categories";
import { categoryLabel } from "./categories";

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((t) => t.length >= 2);
}

// Groupes de mots qui veulent dire la meme chose pour nos utilisateurs.
// Les noms des operateurs mobile money changent (TMoney, Mixx by Yas, Flooz, Moov Money) :
// on les rattache tous au meme sujet.
const SYNONYM_GROUPS: string[][] = [
  ["mobile", "money", "momo", "tmoney", "mixx", "yas", "flooz", "flouz", "moov", "togocel", "paiement", "payer"],
  ["qr", "qrcode", "scanner", "flasher", "table", "tables"],
  ["sonnerie", "son", "sonore", "alerte", "bip", "volume", "muet"],
  ["commande", "commandes", "commander", "panier", "plat"],
  ["reservation", "reservations", "reserver", "creneau", "agenda"],
  ["equipe", "personnel", "serveur", "cuisinier", "caissier", "employe", "staff", "role", "roles", "patron", "gerant"],
  ["menu", "carte", "plats", "prix", "photo", "photos"],
  ["livraison", "livreur", "livrer", "zone", "zones"],
  ["statistique", "statistiques", "stats", "ventes", "chiffre"],
  ["credit", "credits", "recharge", "recharger", "solde"],
  ["plan", "plans", "abonnement", "tarif", "tarifs", "gratuit", "essentiel", "pro", "business", "essai"],
  ["commission", "frais", "pourcentage"],
  ["connexion", "connecter", "connecte", "lien", "magique", "mail", "email", "courriel", "mot", "passe"],
  ["espece", "especes", "cash", "liquide"],
  ["lent", "lenteur", "reseau", "coupure", "internet", "wifi", "data", "hors", "ligne"],
  ["inscription", "inscrire", "compte", "creer"],
  ["identite", "logo", "couleur", "couleurs", "devise", "visuelle"],
  ["aide", "support", "contact", "contacter", "whatsapp", "probleme"],
  ["limite", "limites", "bloque", "impossible"],
];

const SYNONYMS: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>();
  for (const group of SYNONYM_GROUPS) {
    for (const word of group) {
      const list = map.get(word) ?? [];
      for (const other of group) if (other !== word && !list.includes(other)) list.push(other);
      map.set(word, list);
    }
  }
  return map;
})();

/** Distance d'edition simple (insertion, suppression, remplacement). */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Force de correspondance entre un mot cherche et les mots d'un champ (0 a 1). */
function matchStrength(word: string, fieldTokens: string[]): number {
  let best = 0;
  const allowed = word.length >= 8 ? 2 : word.length >= 5 ? 1 : 0;
  for (const t of fieldTokens) {
    if (t === word) return 1;
    if (word.length >= 3 && t.startsWith(word)) best = Math.max(best, 0.75);
    else if (t.length >= 4 && word.length >= 4 && word.startsWith(t)) best = Math.max(best, 0.6);
    else if (allowed > 0 && editDistance(word, t, allowed) <= allowed) best = Math.max(best, 0.55);
  }
  return best;
}

type Prepared = {
  item: HelpIndexItem;
  title: string[];
  summary: string[];
  category: string[];
};

const cache = new WeakMap<HelpIndexItem[], Prepared[]>();

function prepare(index: HelpIndexItem[]): Prepared[] {
  const hit = cache.get(index);
  if (hit) return hit;
  const prepared = index.map((item) => ({
    item,
    title: tokenize(item.title),
    summary: tokenize(item.summary),
    category: tokenize(categoryLabel(item.category)),
  }));
  cache.set(index, prepared);
  return prepared;
}

const WEIGHTS = { title: 5, summary: 2, category: 1 } as const;

export function searchArticles(index: HelpIndexItem[], query: string, limit = 8): HelpIndexItem[] {
  const words = tokenize(query);
  if (words.length === 0) return [];
  const scored: { item: HelpIndexItem; score: number; matched: number }[] = [];

  for (const p of prepare(index)) {
    let score = 0;
    let matched = 0;
    for (const word of words) {
      let wordBest = 0;
      const candidates: [string, number][] = [[word, 1]];
      for (const syn of SYNONYMS.get(word) ?? []) candidates.push([syn, 0.5]);
      for (const [cand, factor] of candidates) {
        for (const field of ["title", "summary", "category"] as const) {
          const s = matchStrength(cand, p[field]) * WEIGHTS[field] * factor;
          if (s > wordBest) wordBest = s;
        }
      }
      if (wordBest > 0) matched += 1;
      score += wordBest;
    }
    if (score > 0) scored.push({ item: p.item, score, matched });
  }

  // Les articles qui contiennent le plus de mots cherches passent en premier.
  scored.sort((a, b) => b.matched - a.matched || b.score - a.score);
  const needed = words.length > 1 ? Math.ceil(words.length / 2) : 1;
  const top = scored.length > 0 ? scored[0].score : 0;
  return scored
    .filter((s) => s.matched >= needed && s.score >= top * 0.35)
    .slice(0, limit)
    .map((s) => s.item);
}
