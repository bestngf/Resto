"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { categoryLabel, type HelpIndexItem } from "@/lib/aide/categories";
import { searchArticles } from "@/lib/aide/search";

export function SearchBox({ index }: { index: HelpIndexItem[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchArticles(index, query), [index, query]);
  const searching = query.trim().length >= 2;

  return (
    <div>
      <label htmlFor="aide-recherche" className="sr-only">
        Rechercher dans l'aide
      </label>
      <input
        id="aide-recherche"
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Que cherchez-vous ? Exemple : QR code, paiement, équipe"
        className="min-h-14 w-full rounded-xl border-2 border-stone-300 bg-white px-4 text-lg text-stone-900 placeholder:text-stone-500 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/20"
      />
      <div aria-live="polite" className="mt-2">
        {searching && results.length > 0 && (
          <>
            <p className="sr-only">{results.length} résultat(s)</p>
            <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
              {results.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/aide/${r.slug}`}
                    className="block min-h-14 px-4 py-3 hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none"
                  >
                    <span className="block text-base font-medium text-stone-900">{r.title}</span>
                    <span className="block text-sm text-stone-500">{categoryLabel(r.category)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        {searching && results.length === 0 && (
          <div className="rounded-xl border border-stone-200 bg-white px-4 py-4 text-stone-700">
            <p className="font-medium text-stone-900">Aucun résultat pour « {query.trim()} ».</p>
            <p className="mt-1 text-sm">
              Essayez un autre mot, ou <Link href="/aide/contact" className="font-medium text-emerald-800 underline">écrivez-nous</Link> : nous vous répondons.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
