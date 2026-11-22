"use client";
import Link from "next/link";
import { useState } from "react";
import { HelpBubble, ListSkeleton, ErrorBox, PageHeader, btnPrimary, cardCls, useToast } from "@/components/dashboard/ui";
import { useRestaurant } from "@/components/dashboard/RestaurantProvider";
import { db, must } from "@/lib/dashboard/db";
import { humanError } from "@/lib/dashboard/errors";
import { fcfa, todayStartIso } from "@/lib/dashboard/format";
import { useLoad } from "@/lib/dashboard/useLoad";

interface Summary { orders: number; sales: number; waiting: number; resaPending: number; items: number; tables: number }

export default function DashboardHome() {
  const { restaurant, reload } = useRestaurant();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const id = restaurant?.id;

  const { data, loading, error, reload: refresh } = useLoad<Summary | null>(async () => {
    if (!id) return null;
    const c = db();
    const [o, r, m, t] = await Promise.all([
      c.from("resto_orders").select("status,total,payment_status").eq("restaurant_id", id).gte("created_at", todayStartIso()),
      c.from("resto_reservations").select("id", { count: "exact", head: true }).eq("restaurant_id", id).eq("status", "en_attente").gte("starts_at", new Date().toISOString()),
      c.from("resto_menu_items").select("id", { count: "exact", head: true }).eq("restaurant_id", id).eq("active", true),
      c.from("resto_tables").select("id", { count: "exact", head: true }).eq("restaurant_id", id).eq("active", true),
    ]);
    const orders = must(o) as { status: string; total: number; payment_status: string }[];
    return {
      orders: orders.filter((x) => x.status !== "annulee").length,
      sales: orders.filter((x) => x.payment_status === "paye" && x.status !== "annulee").reduce((s, x) => s + x.total, 0),
      waiting: orders.filter((x) => x.status === "recue").length,
      resaPending: r.count ?? 0, items: m.count ?? 0, tables: t.count ?? 0,
    };
  }, [id]);

  async function goOnline() {
    if (!restaurant) return;
    setBusy(true);
    const { error } = await db().from("resto_restaurants").update({ status: "actif" }).eq("id", restaurant.id);
    setBusy(false);
    if (error) return toast.show(humanError(error), "err");
    await reload();
    toast.show("Votre restaurant est en ligne 🎉");
  }

  if (!restaurant) return null;
  const steps = [
    { done: !!restaurant.logo_url, label: "Ajouter votre logo et vos couleurs", href: "/dashboard/identite" },
    { done: (data?.items ?? 0) > 0, label: "Ajouter votre premier plat", href: "/dashboard/menus" },
    { done: (data?.tables ?? 0) > 0, label: "Créer vos tables et QR codes", href: "/dashboard/tables" },
    { done: restaurant.status === "actif", label: "Mettre votre restaurant en ligne", href: "" },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  // Une seule action recommandée à la fois.
  let action: { text: string; href: string; cta: string } | null = null;
  if (data) {
    if (data.waiting > 0) action = { text: `${data.waiting} commande${data.waiting > 1 ? "s attendent" : " attend"} votre réponse`, href: "/dashboard/commandes", cta: "Voir les commandes" };
    else if (data.resaPending > 0) action = { text: `${data.resaPending} réservation${data.resaPending > 1 ? "s" : ""} à confirmer`, href: "/dashboard/reservations", cta: "Répondre" };
    else if (data.items === 0) action = { text: "Votre menu est vide : ajoutez un premier plat.", href: "/dashboard/menus", cta: "Ajouter un plat" };
    else if (data.tables === 0) action = { text: "Créez vos tables pour recevoir des commandes par QR code.", href: "/dashboard/tables", cta: "Créer les tables" };
  }

  return (
    <>
      <PageHeader title="Résumé du jour" subtitle={restaurant.name} />
      <HelpBubble id="accueil" title="Bienvenue sur votre tableau de bord">
        Ici, vous voyez l&apos;essentiel de la journée et la prochaine chose à faire. Les onglets en haut mènent à chaque outil.
      </HelpBubble>

      {loading ? <ListSkeleton /> : error ? <ErrorBox message={error} onRetry={refresh} /> : data && (
        <div className="space-y-4">
          {action && (
            <div className={`${cardCls} flex flex-wrap items-center justify-between gap-3 border-emerald-600 bg-emerald-50`}>
              <p className="font-semibold text-emerald-950">👉 {action.text}</p>
              <Link href={action.href} className={btnPrimary}>{action.cta}</Link>
            </div>
          )}
          {!action && <p className={`${cardCls} font-medium`}>✅ Tout est calme pour le moment.</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className={cardCls}><p className="text-sm text-stone-600">Commandes aujourd&apos;hui</p><p className="text-3xl font-extrabold">{data.orders}</p></div>
            <div className={cardCls}><p className="text-sm text-stone-600">Ventes payées</p><p className="text-2xl font-extrabold">{fcfa(data.sales, restaurant.currency)}</p></div>
          </div>

          {doneCount < steps.length && (
            <section className={cardCls} aria-label="Mise en route">
              <div className="mb-2 flex items-center justify-between"><h2 className="font-bold">Mise en route</h2><span className="text-sm font-semibold">{doneCount}/{steps.length}</span></div>
              <div className="mb-3 h-2 rounded-full bg-stone-200" role="progressbar" aria-valuenow={doneCount} aria-valuemin={0} aria-valuemax={steps.length}>
                <div className="h-2 rounded-full bg-emerald-700 transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
              </div>
              <ul className="space-y-1">
                {steps.map((s) => (
                  <li key={s.label} className="flex min-h-11 items-center gap-2">
                    <span aria-hidden>{s.done ? "✅" : "⬜"}</span>
                    {s.done ? <span className="text-stone-600 line-through">{s.label}</span>
                      : s.href ? <Link href={s.href} className="font-semibold underline">{s.label}</Link>
                      : <button className="font-semibold underline" disabled={busy} onClick={goOnline}>{s.label}</button>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
      {toast.node}
    </>
  );
}
