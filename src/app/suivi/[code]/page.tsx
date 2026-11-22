"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { cancelOrderByCode, getOrderByCode, startPayment, type OrderView } from "@/lib/resto-api";
import { humanError } from "@/lib/errors";
import { formatFcfa } from "@/lib/format";
import { STEPS, type Mode } from "@/lib/orders";

// Suivi d'une commande par code (sans compte) : état, paiement (avec reprise), annulation, WhatsApp.
export default function SuiviCommande() {
  const { code } = useParams<{ code: string }>();
  const back = useSearchParams().get("paiement") === "retour";
  const [o, setO] = useState<OrderView | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const polls = useRef(0);

  const load = useCallback(async () => {
    try { setO(await getOrderByCode(code)); setErr(""); } catch (e) { setErr(humanError(e)); }
  }, [code]);
  useEffect(() => { load(); const t = setInterval(() => { polls.current += 1; load(); }, 6000); return () => clearInterval(t); }, [load]);

  async function pay() {
    if (!o?.payment_id) return; setBusy(true); setErr("");
    try { window.location.href = (await startPayment(o.payment_id, code)).url; } catch (e) { setErr(humanError(e)); setBusy(false); }
  }
  async function cancel() {
    if (!confirm("Annuler cette commande ?")) return; setBusy(true);
    try { await cancelOrderByCode(code); await load(); } catch (e) { setErr(humanError(e)); } setBusy(false);
  }

  if (!o) return <main className="mx-auto max-w-xl p-4"><p aria-busy="true">{err || "Chargement de ta commande…"}</p></main>;
  const steps = STEPS[(o.mode as Mode) in STEPS ? (o.mode as Mode) : "emporter"]; const idx = steps.findIndex((s) => s.key === o.status);
  const canceled = o.status === "annulee"; const paid = o.payment_status === "paye";
  return (
    <main className="mx-auto max-w-xl space-y-5 p-4">
      <h1 className="text-2xl font-bold">{o.restaurant.name}</h1>
      <p className="text-sm text-neutral-600">Ta commande · {formatFcfa(o.total)}</p>

      {back && !paid && o.payment_method === "mobile_money" && !canceled && <p role="status" className="rounded-xl bg-[#fff4cc] p-3 text-sm">Nous vérifions ton paiement. Cela peut prendre une minute…</p>}
      {paid && <p role="status" className="rounded-xl bg-[#e3f6e8] p-3 text-sm font-medium">Paiement reçu. Merci !</p>}
      {!paid && !canceled && o.payment_method === "mobile_money" && o.can_retry && (
        <div className="rounded-xl border border-neutral-300 p-3">
          <p className="text-sm">Le paiement n&apos;est pas encore confirmé. Tu peux le reprendre sans risque : une commande payée ne peut pas être payée deux fois.</p>
          <button type="button" disabled={busy} onClick={pay} className="mt-2 min-h-12 w-full rounded-xl bg-neutral-900 px-4 font-semibold text-white disabled:opacity-60">Payer {formatFcfa(o.total)}</button>
        </div>
      )}
      {!paid && o.payment_method === "especes" && !canceled && <p className="rounded-xl bg-neutral-100 p-3 text-sm">Paiement en espèces au restaurant ou à la livraison.</p>}

      {canceled ? <p role="status" className="rounded-xl bg-[#fde4e1] p-3 font-medium">Commande annulée.</p> : (
        <ol className="space-y-2" aria-label="Étapes de la commande">
          {steps.map((s, i) => (
            <li key={s.key} aria-current={i === idx ? "step" : undefined} className={`flex items-center gap-3 rounded-xl border p-3 ${i <= idx ? "border-neutral-900 font-semibold" : "border-neutral-200 text-neutral-500"}`}>
              <span aria-hidden>{i < idx ? "✓" : i === idx ? "●" : "○"}</span>{s.label}
            </li>
          ))}
        </ol>
      )}

      <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 text-sm">
        {o.items.map((it, i) => <li key={i} className="flex justify-between p-3"><span>{it.quantity} × {it.name}</span><span>{formatFcfa(it.line_total)}</span></li>)}
        {o.delivery_fee > 0 && <li className="flex justify-between p-3"><span>Livraison</span><span>{formatFcfa(o.delivery_fee)}</span></li>}
      </ul>

      {err && <p role="alert" className="rounded-xl bg-[#fde4e1] p-3 text-sm">{err}</p>}
      <div className="flex flex-wrap gap-2">
        {o.whatsapp_link && <a href={o.whatsapp_link} target="_blank" rel="noopener noreferrer" className="min-h-12 flex-1 rounded-xl border-2 border-neutral-900 px-4 py-3 text-center font-semibold">Écrire au restaurant sur WhatsApp</a>}
        {o.restaurant.phone && <a href={`tel:${o.restaurant.phone.replace(/[^\d+]/g, "")}`} className="min-h-12 rounded-xl border border-neutral-300 px-4 py-3 text-center">Appeler</a>}
        {o.status === "recue" && !paid && !canceled && <button type="button" disabled={busy} onClick={cancel} className="min-h-12 rounded-xl border border-neutral-300 px-4">Annuler</button>}
      </div>
      <p className="text-xs text-neutral-500">Garde cette page : le lien contient ton code de suivi. <Link href={`/r/${o.restaurant.slug}`} className="underline">Retour au restaurant</Link></p>
    </main>
  );
}
