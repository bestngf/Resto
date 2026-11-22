import Link from "next/link";

// Ouvre le centre d'aide (agent 6). Chemin à confirmer : /aide?sujet=<sujet>.
export default function HelpButton({ topic }: { topic: string }) {
  return (
    <Link href={`/aide?sujet=${encodeURIComponent(topic)}`} className="inline-flex min-h-11 items-center rounded-xl border border-[var(--r-line)] bg-white px-4 text-sm font-medium text-[var(--r-ink)]">
      Besoin d&apos;aide ?
    </Link>
  );
}
