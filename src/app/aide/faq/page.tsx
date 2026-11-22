import type { Metadata } from "next";
import Link from "next/link";
import { AccordionList } from "@/components/aide/AccordionList";
import { fetchPublishedArticles } from "@/lib/aide/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Questions fréquentes" };

export default async function Page() {
  const articles = (await fetchPublishedArticles()).filter((a) => a.category === "faq");
  return (
    <div className="space-y-5">
      <nav aria-label="Fil d'Ariane" className="text-sm text-stone-600">
        <Link href="/aide" className="underline underline-offset-2">Aide</Link>
      </nav>
      <header>
        <h1 className="text-2xl font-semibold text-stone-900 sm:text-3xl">Questions fréquentes</h1>
        <p className="mt-1 text-stone-600">Les réponses rapides aux questions les plus posées.</p>
      </header>
      {articles.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="font-medium text-stone-900">Cette page se remplit bientôt.</p>
          <p className="mt-1 text-stone-700">En attendant, écrivez-nous : nous vous répondons.</p>
          <Link href="/aide/contact" className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white">
            Contacter le support
          </Link>
        </div>
      ) : (
        <AccordionList articles={articles} />
      )}
    </div>
  );
}
