import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, isKnownCategory } from "@/lib/aide/categories";
import { fetchPublishedArticles } from "@/lib/aide/data";

export const revalidate = 300;

type Params = { params: Promise<{ cat: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { cat } = await params;
  const category = CATEGORIES.find((c) => c.key === cat);
  return { title: category?.label ?? "Aide" };
}

export default async function CategoryPage({ params }: Params) {
  const { cat } = await params;
  if (!isKnownCategory(cat)) notFound();
  const category = CATEGORIES.find((c) => c.key === cat)!;
  const articles = (await fetchPublishedArticles()).filter((a) => a.category === cat);

  return (
    <div className="space-y-5">
      <nav aria-label="Fil d'Ariane" className="text-sm text-stone-600">
        <Link href="/aide" className="underline underline-offset-2">Aide</Link>
      </nav>
      <header>
        <h1 className="text-2xl font-semibold text-stone-900 sm:text-3xl">{category.label}</h1>
        <p className="mt-1 text-stone-600">{category.description}</p>
      </header>
      {articles.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="font-medium text-stone-900">Aucun guide dans cette catégorie pour l&apos;instant.</p>
          <p className="mt-1 text-stone-700">Ils arrivent bientôt. Une question ? Écrivez-nous.</p>
          <Link href="/aide/contact" className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white">
            Contacter le support
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link href={`/aide/${a.slug}`} className="block min-h-14 px-4 py-3 font-medium text-stone-900 hover:bg-emerald-50">
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
