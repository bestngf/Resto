"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ClientShell from "@/components/layout/ClientShell";
import HelpButton from "@/components/ui/HelpButton";
import Skeleton from "@/components/ui/Skeleton";
import ReviewForm from "@/components/commande/ReviewForm";
import { getSupabase } from "@/lib/supabase/client";
import { STEPS, type Mode } from "@/lib/orders";
import { formatFcfa } from "@/lib/format";
import { useSession } from "@/lib/useSession";

type Order = {
  id: string; restaurant_id: string; mode: Mode; status: string; payment_method: string; payment_status: string;
  subtotal: number; delivery_fee: number; total: number;
  resto_order_items: { name_snapshot: string; quantity: number; line_total: number }[];
  resto_restaurants: { name: string; slug: string } | null;
};

export default function Suivi() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await getSupabase()
      .from("resto_orders")
      .select("id,restaurant_id,mode,status,payment_method,payment_status,subtotal,delivery_fee,total,resto_order_items(name_snapshot,quantity,line_total),resto_restaurants(name,slug)")
      .eq("id", id).maybeSingle();
    if (err) { setError("Impossible de charger ta commande. Vérifie ta connexion."); return; }
    if (!data) { setError("Commande introuvable. Connecte-toi avec le compte utilisé pour commander."); return; }
    setError(null);
    setOrder(data as unknown as Order);
  }, [id]);

  useEffect(() => {
    load();
    const sb = getSupabase();
    // Temps réel ; une relecture toutes les 20 s sert de secours si le réseau coupe.
    const ch = sb.channel(`order-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "resto_orders", filter: `id=eq.${id}` }, (p) => {
        setOrder((o) => (o ? { ...o, ...(p.new as Partial<Order>) } : o));
      }).subscribe();
    const timer = setInterval(load, 20000);
    return () => { clearInterval(timer); sb.removeChannel(ch); };
  }, [id, load]);

  if (error) return (
    <ClientShell>
      <div role="alert" className="rounded-2xl border border-[var(--r-line)] bg-white p-6 text-center">
        <p className="font-semibold">{error}</p>
        <button type="button" onClick={load} className="mt-3 min-h-11 rounded-xl bg-[var(--r-brand)] px-4 text-sm font-semibold text-[var(--r-brand-ink)]">Réessayer</button>
      </div>
    </ClientShell>
  );
  if (!order) return <ClientShell><div className="space-y-3" aria-busy="true"><Skeleton className="h-10" /><Skeleton className="h-48" /></div></ClientShell>;

  const steps = STEPS[order.mode];
  const idx = steps.findIndex((s) => s.key === order.status);
  const cancelled = order.status === "annulee";
  const finished = order.status === "servie" || order.status === "livree";

  return (
    <ClientShell>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ma commande</h1>
        <HelpButton topic="client-suivi" />
      </header>
      <p className="mb-4 text-[var(--r-muted)]">{order.resto_restaurants?.name}</p>

      {cancelled ? (
        <p role="status" className="rounded-2xl bg-red-50 p-4 font-semibold">Cette commande a été annulée.</p>
      ) : (
        <ol className="space-y-3" aria-label="Étapes de la commande">
          {steps.map((s, i) => {
            const state = i < idx ? "done" : i === idx ? "now" : "todo";
            return (
              <li key={s.key} aria-current={state === "now" ? "step" : undefined} className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${state === "todo" ? "bg-[var(--r-line)] text-[var(--r-muted)]" : "bg-[var(--r-brand)] text-[var(--r-brand-ink)]"} ${state === "now" ? "animate-pulse motion-reduce:animate-none ring-4 ring-[var(--r-sun)]" : ""}`}>{state === "done" ? "✓" : i + 1}</span>
                <span className={state === "todo" ? "text-[var(--r-muted)]" : "font-semibold"}>{s.label}</span>
              </li>
            );
          })}
        </ol>
      )}

      <section className="mt-6 rounded-2xl border border-[var(--r-line)] bg-white p-4">
        <ul className="divide-y divide-[var(--r-line)]">
          {order.resto_order_items.map((it, i) => (
            <li key={i} className="flex justify-between py-2 text-sm"><span>{it.quantity} × {it.name_snapshot}</span><span>{formatFcfa(it.line_total)}</span></li>
          ))}
        </ul>
        {order.delivery_fee > 0 && <p className="flex justify-between border-t border-[var(--r-line)] py-2 text-sm"><span>Livraison</span><span>{formatFcfa(order.delivery_fee)}</span></p>}
        <p className="flex justify-between border-t border-[var(--r-line)] pt-2 font-bold"><span>Total</span><span>{formatFcfa(order.total)}</span></p>
        <p className="mt-2 text-sm text-[var(--r-muted)]">{order.payment_method === "especes" ? "Paiement en espèces auprès du restaurant." : order.payment_status === "paye" ? "Payé par mobile money." : "Paiement mobile money en attente."}</p>
      </section>

      {finished && user && <ReviewForm orderId={order.id} restaurantId={order.restaurant_id} userId={user.id} />}

      <div className="mt-6 flex gap-2">
        <Link href="/compte" className="inline-flex min-h-11 items-center rounded-xl border border-[var(--r-line)] bg-white px-4 text-sm font-medium">Mes commandes</Link>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-xl border border-[var(--r-line)] bg-white px-4 text-sm font-medium">Accueil</Link>
      </div>
    </ClientShell>
  );
}
