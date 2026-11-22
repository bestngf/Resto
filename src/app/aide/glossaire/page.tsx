import type { Metadata } from "next";
import Link from "next/link";
import { ArticleBody } from "@/components/aide/ArticleBody";
import { fetchArticle } from "@/lib/aide/data";
import { formatDateFr } from "@/lib/aide/format";

export const revalidate = 300;
export const metadata: Metadata = { title: "Mots utiles" };

export default async function GlossairePage() {
  const article = await fetchArticle("glossaire");
  return (
    <div className="space-y-5">
      <nav aria-label="Fil d'Ariane" className="text-sm text-stone-600">
        <Link href="/aide" className="underline underline-offset-2">Aide</Link>
      </nav>
      <header>
        <h1 className="text-2xl font-semibold text-stone-900 sm:text-3xl">Mots utiles</h1>
        <p className="mt-1 text-stone-600">Les mots de l&apos;application, expliqués simplement.</p>
      </header>
      {article ? (
        <>
          <ArticleBody body={article.body} />
          <p className="text-sm text-stone-500">Dernière mise à jour : {formatDateFr(article.updated_at)}</p>
        </>
      ) : (
        <p className="rounded-xl border border-stone-200 bg-white p-5 text-stone-700">Cette page arrive bientôt.</p>
      )}
    </div>
  );
}
