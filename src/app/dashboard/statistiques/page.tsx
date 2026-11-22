"use client";
import { useMemo, useState } from "react";
import { EmptyState, ErrorBox, HelpBubble, ListSkeleton, PageHeader, btnGhost, btnPrimary, cardCls } from "@/components/dashboard/ui";
import { HorizontalBars, VerticalBars } from "@/components/dashboard/charts";
import { useRestaurant } from "@/components/dashboard/RestaurantProvider";
import { db, must } from "@/lib/dashboard/db";
import { dayKey, fcfa } from "@/lib/dashboard/format";
import { useLoad } from "@/lib/dashboard/useLoad";

interface Row { created_at: string; total: number; status: string; payment_status: string; resto_order_items: { name_snapshot: string; quantity: number }[] }

export default function StatistiquesPage() {
  const { restaurant } = useRestaurant();
  const [days, setDays] = useState(7);
  const id = restaurant?.id;
  const cur = restaurant?.currency ?? "FCFA";

  const { data, loading, error, reload } = useLoad(async () => {
    if (!id) return [] as Row[];
    const since = new Date(Date.now() - days * 86400000).toISOString();
    return must(await db().from("resto_orders").select("created_at,total,status,payment_status,resto_order_items(name_snapshot,quantity)")
      .eq("restaurant_id", id).gte("created_at", since).neq("status", "annulee").order("created_at").limit(3000)) as unknown as Row[];
  }, [id, days]);

  const s = useMemo(() => {
    const rows = data ?? [];
    const byDay = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) byDay.set(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10), 0);
    const dishes = new Map<string, number>();
    const hours = Array(24).fill(0) as number[];
    let sales = 0;
    for (const r of rows) {
      sales += r.total;
      byDay.set(dayKey(r.created_at), (byDay.get(dayKey(r.created_at)) ?? 0) + r.total);
      hours[new Date(r.created_at).getUTCHours()]++; // Lomé = UTC+0
      r.resto_order_items.forEach((i) => dishes.set(i.name_snapshot, (dishes.get(i.name_snapshot) ?? 0) + i.quantity));
    }
    return {
      count: rows.length, sales, avg: rows.length ? sales / rows.length : 0,
      daily: [...byDay].map(([k, v]) => ({ label: k.slice(8) + "/" + k.slice(5, 7), value: v })),
      top: [...dishes].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({ label, value })),
      hours: hours.map((v, h) => ({ label: `${h}h`, value: v })),
      peak: hours.indexOf(Math.max(...hours)),
    };
  }, [data, days]);

  if (!restaurant) return null;
  return (
    <>
      <PageHeader title="Statistiques" subtitle="Ce qui marche dans votre restaurant."
        right={<div className="flex gap-2">{[7, 30].map((d) => <button key={d} aria-pressed={days === d} className={days === d ? btnPrimary : btnGhost} onClick={() => setDays(d)}>{d} jours</button>)}</div>} />
      <HelpBubble id="statistiques" title="Comprendre vos chiffres">
        Les ventes comptent toutes les commandes non annulées. Les heures de pointe vous aident à prévoir votre personnel.
      </HelpBubble>
      {loading ? <ListSkeleton /> : error ? <ErrorBox message={error} onRetry={reload} /> : s.count === 0 ? (
        <EmptyState icon="📊" title="Pas encore de chiffres" text="Dès les premières commandes, vos ventes et vos plats préférés s'afficheront ici." />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className={cardCls}><p className="text-xs text-stone-600">Commandes</p><p className="text-2xl font-extrabold">{s.count}</p></div>
            <div className={cardCls}><p className="text-xs text-stone-600">Ventes</p><p className="text-lg font-extrabold">{fcfa(s.sales, cur)}</p></div>
            <div className={cardCls}><p className="text-xs text-stone-600">Panier moyen</p><p className="text-lg font-extrabold">{fcfa(s.avg, cur)}</p></div>
          </div>
          <section className={cardCls}><h2 className="mb-2 font-bold">Ventes par jour</h2><VerticalBars data={s.daily} title="Ventes par jour" format={(n) => fcfa(n, cur)} /></section>
          <section className={cardCls}><h2 className="mb-2 font-bold">Plats les plus commandés</h2><HorizontalBars data={s.top} title="Plats les plus commandés" format={(n) => `${n} ×`} /></section>
          <section className={cardCls}><h2 className="mb-1 font-bold">Heures de pointe</h2><p className="mb-2 text-sm text-stone-600">Le plus de commandes vers {s.peak} h.</p><VerticalBars data={s.hours} title="Commandes par heure" color="#b45309" /></section>
        </div>
      )}
    </>
  );
}
