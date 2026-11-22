import Link from "next/link";
import type { ReactNode } from "react";
import { parseBlocks, type Inline } from "@/lib/aide/markdown";
import { Illustration } from "./Illustration";

function renderInline(nodes: Inline[]): ReactNode {
  return nodes.map((n, i) => {
    switch (n.k) {
      case "t":
        return n.v;
      case "b":
        return <strong key={i} className="font-semibold text-stone-900">{renderInline(n.v)}</strong>;
      case "i":
        return <em key={i}>{renderInline(n.v)}</em>;
      case "a": {
        const internal = n.href.startsWith("/");
        return internal ? (
          <Link key={i} href={n.href} className="font-medium text-emerald-800 underline underline-offset-2">
            {renderInline(n.v)}
          </Link>
        ) : (
          <a
            key={i}
            href={n.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-800 underline underline-offset-2"
          >
            {renderInline(n.v)}
          </a>
        );
      }
    }
  });
}

/** Rend le texte d'un article. Aucun HTML n'est interprete : tout passe par des elements React. */
export function ArticleBody({ body }: { body: string }) {
  const blocks = parseBlocks(body);
  return (
    <div className="space-y-4 text-base leading-7 text-stone-700">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} className="pt-4 text-xl font-semibold text-stone-900">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="pt-2 text-lg font-semibold text-stone-900">
                {b.text}
              </h3>
            );
          case "p":
            return <p key={i}>{renderInline(b.inline)}</p>;
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-2 pl-6 marker:text-emerald-700">
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-3">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-sm font-semibold text-white"
                    >
                      {j + 1}
                    </span>
                    <span>
                      <span className="sr-only">Étape {j + 1} : </span>
                      {renderInline(it)}
                    </span>
                  </li>
                ))}
              </ol>
            );
          case "tip":
            return (
              <p key={i} className="rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-amber-950">
                {renderInline(b.inline)}
              </p>
            );
          case "illustration":
            return <Illustration key={i} name={b.name} />;
        }
      })}
    </div>
  );
}
