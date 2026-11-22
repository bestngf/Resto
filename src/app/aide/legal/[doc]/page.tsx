import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/aide/ArticleBody";
import { fetchArticle } from "@/lib/aide/data";
import { formatDateFr } from "@/lib/aide/format";

export const revalidate = 300;

// Les textes juridiques sont fournis par NGF : ils sont colles dans help_articles
// (slug legal-conditions / legal-confidentialite, categorie legal). Rien n'est ecrit ici.
const DOCS: Record<string, { slug: string; title: string }> = {
  conditions: { slug: "legal-conditions", title: "Conditions d'utilisation" },
  confidentialite: { slug: "legal-confidentialite", title: "Politique de confidentialité" },
};

type Params = { params: Promise<{ doc: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { doc } = await params;
  return { title: DOCS[doc]?.title ?? "Informations légales" };
}

export default async function LegalPage({ params }: Params) {
  const { doc } = await params;
  const meta = DOCS[doc];
  if (!meta) notFound();
  const article = await fetchArticle(meta.slug);

  return (
    <div className="space-y-5">
      <nav aria-label="Fil d'Ariane" className="text-sm text-stone-600">
        <Link href="/aide" className="underline underline-offset-2">Aide</Link>
      </nav>
      <h1 className="text-2xl font-semibold text-stone-900 sm:text-3xl">{meta.title}</h1>
      {article ? (
        <>
          <ArticleBody body={article.body} />
          <p className="text-sm text-stone-500">Dernière mise à jour : {formatDateFr(article.updated_at)}</p>
        </>
      ) : (
        <p className="rounded-xl border border-stone-200 bg-white p-5 text-stone-700">
          Ce document sera publié prochainement.
        </p>
      )}
    </div>
  );
}
