"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HelpSpace } from "@/lib/aide/contextMap";
import { TOURS, tourDoneKey, type TourStep } from "@/lib/aide/tour";

type Props = {
  space: HelpSpace;
  /** Etapes personnalisees (sinon celles de l'espace). */
  steps?: TourStep[];
};

type Rect = { top: number; left: number; width: number; height: number };

function findTarget(name?: string): HTMLElement | null {
  if (!name) return null;
  const el = document.querySelector<HTMLElement>(`[data-tour="${name}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? el : null;
}

/**
 * Visite guidee. Elle demarre toute seule au premier lancement de l'espace,
 * ou quand l'adresse contient ?visite=1 (bouton « Revoir la visite » du centre d'aide).
 * Sans element cible (attribut data-tour), l'etape s'affiche simplement au centre.
 */
export function TourGuide({ space, steps }: Props) {
  const list = steps ?? TOURS[space];
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  // Demarrage : premier lancement ou demande explicite.
  useEffect(() => {
    let forced = false;
    let done = false;
    try {
      forced = new URLSearchParams(window.location.search).get("visite") === "1";
      done = localStorage.getItem(tourDoneKey(space)) === "1";
    } catch {
      /* ignore */
    }
    if (!forced && done) return;
    const t = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(t);
  }, [space]);

  const close = useCallback(() => {
    setOpen(false);
    setIndex(0);
    try {
      localStorage.setItem(tourDoneKey(space), "1");
      const url = new URL(window.location.href);
      if (url.searchParams.has("visite")) {
        url.searchParams.delete("visite");
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
    } catch {
      /* ignore */
    }
  }, [space]);

  const step = list[index];

  // Met l'element cible en avant et suit son deplacement.
  useEffect(() => {
    if (!open || !step) return;
    const update = () => {
      const el = findTarget(step.target);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 });
    };
    const el = findTarget(step.target);
    if (el) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    }
    update();
    const settle = window.setTimeout(update, 350);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, step]);

  // Clavier : Echap ferme, focus sur le bouton principal.
  useEffect(() => {
    if (!open) return;
    primaryRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, close]);

  if (!open || !step) return null;
  const last = index === list.length - 1;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="visite-titre">
      {rect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-xl ring-4 ring-white transition-all duration-300 motion-reduce:transition-none"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
          }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-black/60" />
      )}
      <div className="fixed inset-x-4 bottom-4 mx-auto max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <p className="text-xs font-medium text-stone-500">
          Étape {index + 1} sur {list.length}
        </p>
        <h2 id="visite-titre" className="mt-1 text-lg font-semibold text-stone-900">
          {step.title}
        </h2>
        <p className="mt-1 text-base leading-6 text-stone-700">{step.text}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={close}
            className="min-h-11 rounded-lg px-3 text-sm font-medium text-stone-600 underline underline-offset-2"
          >
            Passer la visite
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex(index - 1)}
                className="min-h-11 rounded-lg border border-stone-300 px-4 text-sm font-semibold text-stone-800"
              >
                Précédent
              </button>
            )}
            <button
              ref={primaryRef}
              type="button"
              onClick={() => (last ? close() : setIndex(index + 1))}
              className="min-h-11 rounded-lg bg-emerald-800 px-5 text-sm font-semibold text-white hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-700/40"
            >
              {last ? "Terminer" : "Suivant"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
