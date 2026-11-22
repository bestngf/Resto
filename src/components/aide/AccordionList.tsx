import Link from "next/link";
import type { HelpArticle } from "@/lib/aide/categories";
import { ArticleBody } from "./ArticleBody";

/** Liste de questions qui se deplient (balise details : fonctionne sans JavaScript). */
export function AccordionList({ articles }: { articles: HelpArticle[] }) {
  return (
    <ul className="space-y-3">
      {articles.map((a) => (
        <li key={a.slug}>
          <details className="group rounded-xl border border-stone-200 bg-white open:border-emerald-700">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-base font-semibold text-stone-900 marker:hidden [&::-webkit-details-marker]:hidden">
              <span>{a.title}</span>
              <span aria-hidden="true" className="text-xl text-emerald-800 transition group-open:rotate-45 motion-reduce:transition-none">
                +
              </span>
            </summary>
            <div className="border-t border-stone-100 px-4 py-4">
              <ArticleBody body={a.body} />
              <Link href={`/aide/${a.slug}`} className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-emerald-800 underline underline-offset-2">
                Ouvrir la page de ce guide
              </Link>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
