"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-stone-200 bg-white p-6">
      <h1 className="text-xl font-semibold text-stone-900">Le centre d&apos;aide ne s&apos;est pas ouvert</h1>
      <p className="mt-2 text-stone-700">Cela arrive quand le réseau est faible. Réessayez dans un instant.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white"
        >
          Réessayer
        </button>
        <Link href="/aide/hors-ligne" className="inline-flex min-h-11 items-center rounded-lg border border-stone-300 px-4 text-sm font-semibold text-stone-800">
          Lire les guides enregistrés
        </Link>
      </div>
    </div>
  );
}
