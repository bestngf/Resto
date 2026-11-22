"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { helpHrefFor } from "@/lib/aide/contextMap";

type Props = {
  /** Article precis a ouvrir. Sinon il est deduit de la page actuelle. */
  slug?: string;
  label?: string;
  className?: string;
};

/**
 * Bouton « Besoin d'aide ? » a placer dans chaque onglet.
 * Sans propriete : il ouvre automatiquement le bon article selon la page.
 * Exemple :  <HelpButton />   ou   <HelpButton slug="tables-et-qr-codes" />
 */
export function HelpButton({ slug, label = "Besoin d'aide ?", className = "" }: Props) {
  const pathname = usePathname();
  const href = slug ? `/aide/${slug}` : helpHrefFor(pathname);
  return (
    <Link
      href={href}
      data-tour="aide"
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-800 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-700/25 ${className}`}
    >
      <span
        aria-hidden="true"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-white"
      >
        ?
      </span>
      {label}
    </Link>
  );
}
