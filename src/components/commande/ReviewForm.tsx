"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

export default function ReviewForm({ orderId, restaurantId, userId }: { orderId: string; restaurantId: string; userId: string }) {
  const [done, setDone] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSupabase().from("resto_reviews").select("id", { count: "exact", head: true }).eq("order_id", orderId).eq("customer_id", userId)
      .then(({ count }) => setDone((count ?? 0) > 0));
  }, [orderId, userId]);

  if (done === null) return null;
  if (done) return <p className="mt-4 rounded-2xl bg-[#d9f2e5] p-4 text-sm font-medium">Merci pour ton avis !</p>;

  async function send() {
    if (rating < 1) { setError("Choisis une note de 1 à 5."); return; }
    setBusy(true); setError(null);
    const { error: err } = await getSupabase().from("resto_reviews").insert({ order_id: orderId, restaurant_id: restaurantId, customer_id: userId, rating, comment: comment.trim() || null });
    if (err) { setError("Ton avis n'a pas pu être envoyé. Réessaie."); setBusy(false); return; }
    setDone(true);
  }

  return (
    <section className="r-pop mt-4 rounded-2xl border border-[var(--r-line)] bg-white p-4">
      <h2 className="font-semibold">Comment c&apos;était ?</h2>
      <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Note de 1 à 5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} sur 5`} onClick={() => setRating(n)} className={`h-12 w-12 rounded-xl border text-lg font-bold ${rating >= n ? "border-[var(--r-sun)] bg-[var(--r-sun)]" : "border-[var(--r-line)] bg-white"}`}>{n}</button>
        ))}
      </div>
      <label className="mt-3 block text-sm font-medium">Un commentaire (facultatif)
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} rows={3} className="mt-1 w-full rounded-xl border border-[var(--r-line)] p-3 text-base" />
      </label>
      {error && <p role="alert" className="mt-2 text-sm">{error}</p>}
      <button type="button" disabled={busy} onClick={send} className="mt-3 min-h-12 w-full rounded-xl bg-[var(--r-brand)] font-semibold text-[var(--r-brand-ink)] disabled:opacity-60">{busy ? "Envoi…" : "Envoyer mon avis"}</button>
    </section>
  );
}
