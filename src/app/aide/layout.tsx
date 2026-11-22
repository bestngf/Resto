import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { OfflineSync } from "@/components/aide/OfflineSync";
import { APP_NAME } from "@/lib/aide/config";

export const metadata: Metadata = {
  title: { default: `Centre d'aide ${APP_NAME}`, template: `%s | Aide ${APP_NAME}` },
  description: `Guides pas à pas, questions fréquentes et contact pour utiliser ${APP_NAME}.`,
};

export default function AideLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-stone-50 text-stone-900">
      <OfflineSync />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/aide" className="text-lg font-semibold text-emerald-900">
            Centre d&apos;aide
          </Link>
          <nav aria-label="Aide" className="flex items-center gap-1 text-sm font-medium">
            <Link href="/aide/faq" className="inline-flex min-h-11 items-center rounded-lg px-3 hover:bg-stone-100">
              Questions
            </Link>
            <Link href="/aide/contact" className="inline-flex min-h-11 items-center rounded-lg px-3 hover:bg-stone-100">
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-x-5 gap-y-1 px-4 py-4 text-sm text-stone-600">
          <Link href="/aide/legal/conditions" className="inline-flex min-h-11 items-center underline underline-offset-2">
            Conditions d&apos;utilisation
          </Link>
          <Link href="/aide/legal/confidentialite" className="inline-flex min-h-11 items-center underline underline-offset-2">
            Confidentialité
          </Link>
          <Link href="/aide/glossaire" className="inline-flex min-h-11 items-center underline underline-offset-2">
            Mots utiles
          </Link>
        </div>
      </footer>
    </div>
  );
}
