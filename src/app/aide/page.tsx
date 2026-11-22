import Link from "next/link";
import { SearchBox } from "@/components/aide/SearchBox";
import { CATEGORIES, categoryLabel, type HelpIndexItem } from "@/lib/aide/categories";
import { hasWhatsApp, supportWhatsAppLink } from "@/lib/aide/config";
import { fetchPopular, fetchPublishedArticles } from "@/lib/aide/data";
import { makeSummary } from "@/lib/aide/markdown";
import { TOUR_LINKS } from "@/lib/aide/tour";

export const revalidate = 300;

export default async function AidePage() {
  const [articles, popular] = await Promise.all([fetchPublishedArticles(), fetchPopular(6)]);
  const index: HelpIndexItem[] = articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    category: a.category,
    summary: makeSummary(a.body),
  }));
  const wa = supportWhatsAppLink("Bonjour, j'ai besoin d'aide.");

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold text-stone-900 sm:text-3xl">Comment pouvons-nous vous aider ?</h1>
        <p className="mt-1 text-base text-stone-600">Posez votre question avec vos mots, nous trouvons le bon guide.</p>
        <div className="mt-4">
          <SearchBox index={index} />
        </div>
      </section>

      {articles.length === 0 && (
        <section className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Les guides arrivent bientôt</h2>
          <p className="mt-1 text-stone-700">
            Nous préparons les guides pas à pas. En attendant, écrivez-nous : nous répondons à vos questions.
          </p>
          <Link
            href="/aide/contact"
            className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white"
          >
            Contacter le support
          </Link>
        </section>
      )}

      {popular.length > 0 && popular.some((p) => p.views > 0) && (
        <section aria-labelledby="populaires">
          <h2 id="populaires" className="text-lg font-semibold text-stone-900">
            Les plus consultés
          </h2>
          <ul className="mt-3 divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
            {popular.map((p) => (
              <li key={p.slug}>
                <Link href={`/aide/${p.slug}`} className="block min-h-14 px-4 py-3 hover:bg-emerald-50">
                  <span className="block font-medium text-stone-900">{p.title}</span>
                  <span className="block text-sm text-stone-500">{categoryLabel(p.category)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="themes">
        <h2 id="themes" className="text-lg font-semibold text-stone-900">
          Parcourir par thème
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map((c) => (
            <li key={c.key}>
              <Link
                href={c.href}
                className="block h-full rounded-xl border border-stone-200 bg-white p-4 hover:border-emerald-700 hover:bg-emerald-50"
              >
                <span className="block text-base font-semibold text-stone-900">{c.label}</span>
                <span className="mt-1 block text-sm text-stone-600">{c.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="visites">
        <h2 id="visites" className="text-lg font-semibold text-stone-900">
          Revoir la visite guidée
        </h2>
        <ul className="mt-3 space-y-2">
          {TOUR_LINKS.map((t) => (
            <li key={t.space}>
              <Link
                href={t.href}
                className="flex min-h-14 flex-col justify-center rounded-xl border border-stone-200 bg-white px-4 py-3 hover:border-emerald-700 hover:bg-emerald-50"
              >
                <span className="font-medium text-stone-900">{t.label}</span>
                <span className="text-sm text-stone-600">{t.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-emerald-900 p-5 text-white">
        <h2 className="text-lg font-semibold">Vous ne trouvez pas votre réponse ?</h2>
        <p className="mt-1 text-emerald-50">Écrivez-nous, une vraie personne vous répond.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {wa && hasWhatsApp && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-lg bg-white px-4 text-sm font-semibold text-emerald-950"
            >
              Écrire sur WhatsApp
            </a>
          )}
          <Link
            href="/aide/contact"
            className="inline-flex min-h-11 items-center rounded-lg border border-white/70 px-4 text-sm font-semibold text-white"
          >
            Envoyer un message
          </Link>
        </div>
      </section>
    </div>
  );
}
