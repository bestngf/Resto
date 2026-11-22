"use client";
import Link from "next/link";
import { useEffect } from "react";
import { saveTable } from "@/lib/site/cart";

export default function TableWelcome({ slug, name, table }: { slug: string; name: string; table: { id: string; label: string } }) {
  useEffect(() => saveTable(slug, table), [slug, table]);
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-6 text-center">
      <div className="r-rise">
        <p className="r-pop text-5xl" aria-hidden>👋</p>
        <h1 className="mt-4 text-2xl font-bold">Bienvenue chez {name}</h1>
        <p className="mt-2 text-lg">Tu es à la table <strong>{table.label}</strong>.</p>
        <p className="mt-1 text-sm text-neutral-700">Choisis tes plats : ta commande arrive directement en cuisine.</p>
        <Link href={`/r/${slug}/menu`} className="mt-6 inline-flex min-h-14 items-center rounded-2xl bg-[var(--brand)] px-8 text-lg font-bold text-[var(--on-brand)]">Voir le menu</Link>
      </div>
    </main>
  );
}
