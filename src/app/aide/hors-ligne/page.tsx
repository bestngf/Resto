"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArticleBody } from "@/components/aide/ArticleBody";
import { categoryLabel, type HelpArticle } from "@/lib/aide/categories";
import { formatDateFr } from "@/lib/aide/format";
import { readArticles } from "@/lib/aide/offline";

// Page lue depuis la memoire du telephone : elle marche sans reseau
// (a condition que la page elle-meme soit en cache, voir docs/DEMANDES.md pour l'agent 8).
export default function HorsLignePage() {
  const [articles, setArticles] = useState<HelpArticle[] | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  useEffect(() => {
    setArticles(readArticles()?.articles ?? []);
  }, []);

  if (articles === null) {
    return <p className="text-stone-600" role="status">Chargement…</p>;
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h1 className="text-xl font-semibold text-stone-900">Aucun guide enregistré</h1>
        <p className="mt-2 text-stone-700">
          Ouvrez le centre d&apos;aide une fois avec du réseau : les guides s&apos;enregistrent alors dans votre téléphone.
        </p>
        <Link href="/aide" className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white">
          Retour à l&apos;aide
        </Link>
      </div>
    );
  }

  const open = articles.find((a) => a.slug === openSlug);
  if (open) {
    return (
      <article className="space-y-5">
        <button
          type="button"
          onClick={() => setOpenSlug(null)}
          className="inline-flex min-h-11 items-center text-sm font-medium text-emerald-800 underline underline-offset-2"
        >
          ← Tous les guides
        </button>
        <h1 className="text-2xl font-semibold text-stone-900">{open.title}</h1>
        <p className="text-sm text-stone-500">Dernière mise à jour : {formatDateFr(open.updated_at)}</p>
        <ArticleBody body={open.body} />
      </article>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-stone-900 sm:text-3xl">Guides enregistrés</h1>
        <p className="mt-1 text-stone-600">Ces guides restent lisibles sans réseau.</p>
      </header>
      <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
        {articles.map((a) => (
          <li key={a.slug}>
            <button
              type="button"
              onClick={() => setOpenSlug(a.slug)}
              className="block min-h-14 w-full px-4 py-3 text-left hover:bg-emerald-50"
            >
              <span className="block font-medium text-stone-900">{a.title}</span>
              <span className="block text-sm text-stone-500">{categoryLabel(a.category)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
