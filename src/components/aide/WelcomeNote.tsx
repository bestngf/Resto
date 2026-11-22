"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useDismissed, useEntered } from "./useDismissed";

type NoteProps = {
  /** Identifiant unique (ex. "dashboard-menus"). Sert a ne plus afficher le mot apres fermeture. */
  id: string;
  title: string;
  children: ReactNode;
  /** Article d'aide a proposer (facultatif). */
  helpSlug?: string;
  className?: string;
};

/** Petit mot d'accueil en haut d'un onglet. S'ouvre en douceur, se ferme avec « Compris ». */
export function WelcomeNote({ id, title, children, helpSlug, className = "" }: NoteProps) {
  const { visible, dismiss } = useDismissed(`welcome:${id}`);
  const entered = useEntered(visible);
  if (!visible) return null;
  return (
    <section
      aria-label={title}
      className={`rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 transition duration-300 motion-reduce:transition-none ${entered ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"} ${className}`}
    >
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-1 text-sm leading-6">{children}</div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={dismiss}
          className="min-h-11 rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-700/30"
        >
          Compris, ne plus afficher
        </button>
        {helpSlug && (
          <Link href={`/aide/${helpSlug}`} className="text-sm font-medium text-emerald-900 underline underline-offset-2">
            Voir le guide
          </Link>
        )}
      </div>
    </section>
  );
}

/** Bulle d'aide contextuelle, a placer pres d'un champ ou d'un bouton. */
export function HelpTip({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const { visible, dismiss } = useDismissed(`tip:${id}`);
  const entered = useEntered(visible);
  if (!visible) return null;
  return (
    <div
      role="note"
      className={`flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-950 transition duration-300 motion-reduce:transition-none ${entered ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"} ${className}`}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white"
      >
        i
      </span>
      <div className="flex-1">
        <div>{children}</div>
        <button
          type="button"
          onClick={dismiss}
          className="mt-2 min-h-11 rounded-md px-1 text-sm font-semibold text-amber-950 underline underline-offset-2"
        >
          Compris, ne plus afficher
        </button>
      </div>
    </div>
  );
}
