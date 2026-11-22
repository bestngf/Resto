import type { SiteReview } from "@/lib/site/types";

export default function Reviews({ reviews }: { reviews: SiteReview[] }) {
  if (!reviews.length) return <p className="text-sm text-neutral-600">Pas encore d&apos;avis. Commande, puis donne le premier !</p>;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <div>
      <p className="mb-3 text-lg font-semibold"><span aria-hidden>★</span> {avg.toFixed(1)} <span className="text-sm font-normal text-neutral-600">({reviews.length} avis)</span></p>
      <ul className="space-y-3">
        {reviews.slice(0, 5).map((r) => (
          <li key={r.id} className="rounded-2xl border border-neutral-200 p-4 text-sm">
            <p className="font-medium" aria-label={`${r.rating} sur 5`}>{"★".repeat(r.rating)}<span className="text-neutral-300">{"★".repeat(Math.max(0, 5 - r.rating))}</span></p>
            {r.comment && <p className="mt-1 text-neutral-700">{r.comment}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
