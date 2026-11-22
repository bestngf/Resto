import type { Metadata } from "next";
import Link from "next/link";
import { ArticleBody } from "@/components/aide/ArticleBody";
import { Feedback, ShareWhatsApp, TrackView } from "@/components/aide/Feedback";
import { categoryLabel, isKnownCategory } from "@/lib/aide/categories";
import { fetchArticle, fetchPublishedArticles } from "@/lib/aide/data";
import { formatDateFr } from "@/lib/aide/format";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) return { title: "Guide bientôt disponible", robots: { index: false } };
  return { title: article.title };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  // Un bouton d'aide peut pointer vers un guide pas encore publie : on explique, sans erreur.
  if (!article) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-stone-900">Ce guide arrive bientôt</h1>
        <p className="mt-2 text-stone-700">
          Nous le préparons. En attendant, cherchez un autre sujet ou écrivez-nous : nous vous répondons.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/aide" className="inline-flex min-h-11 items-center rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white">
            Chercher dans l&apos;aide
          </Link>
          <Link href="/aide/contact" className="inline-flex min-h-11 items-center rounded-lg border border-stone-300 px-4 text-sm font-semibold text-stone-800">
            Contacter le support
          </Link>
        </div>
      </div>
    );
  }

  const all = await fetchPublishedArticles();
  const related = all.filter((a) => a.category === article.category && a.slug !== article.slug).slice(0, 3);
  const categoryHref = isKnownCategory(article.category)
    ? article.category === "faq"
      ? "/aide/faq"
      : article.category === "depannage"
        ? "/aide/depannage"
        : `/aide/categorie/${article.category}`
    : "/aide";

  return (
    <article className="space-y-6">
      <TrackView slug={article.slug} />
      <nav aria-label="Fil d'Ariane" className="text-sm text-stone-600">
        <Link href="/aide" className="underline underline-offset-2">
          Aide
        </Link>
        <span aria-hidden="true"> › </span>
        <Link href={categoryHref} className="underline underline-offset-2">
          {categoryLabel(article.category)}
        </Link>
      </nav>

      <header>
        <h1 className="text-2xl font-semibold text-stone-900 sm:text-3xl">{article.title}</h1>
        <p className="mt-1 text-sm text-stone-500">Dernière mise à jour : {formatDateFr(article.updated_at)}</p>
      </header>

      <ArticleBody body={article.body} />

      <div className="space-y-4 pt-2">
        <Feedback slug={article.slug} title={article.title} />
        <ShareWhatsApp title={article.title} />
      </div>

      {related.length > 0 && (
        <section aria-labelledby="voir-aussi" className="pt-2">
          <h2 id="voir-aussi" className="text-lg font-semibold text-stone-900">
            À lire aussi
          </h2>
          <ul className="mt-3 divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/aide/${r.slug}`} className="block min-h-14 px-4 py-3 font-medium text-stone-900 hover:bg-emerald-50">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
