// Cache des articles dans le navigateur (localStorage), pour lire l'aide sans reseau.
// Tout est protege par try/catch : le stockage peut etre plein ou desactive.

import type { HelpArticle } from "./categories";

const KEY = "resto_aide_cache_v1";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

type Stored = { savedAt: number; articles: HelpArticle[] };

export function saveArticles(articles: HelpArticle[]): void {
  try {
    const data: Stored = { savedAt: Date.now(), articles };
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* stockage indisponible : on ignore */
  }
}

export function readArticles(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Stored;
    if (!data || !Array.isArray(data.articles)) return null;
    return data;
  } catch {
    return null;
  }
}

export function isCacheFresh(): boolean {
  const data = readArticles();
  return !!data && Date.now() - data.savedAt < MAX_AGE_MS;
}
