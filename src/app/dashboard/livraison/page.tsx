"use client";
import { useState } from "react";
import { ConfirmDialog, EmptyState, ErrorBox, Field, HelpBubble, ListSkeleton, PageHeader, Switch, btnGhost, btnPrimary, cardCls, inputCls, useToast } from "@/components/dashboard/ui";
import { useRestaurant } from "@/components/dashboard/RestaurantProvider";
import { db, must } from "@/lib/dashboard/db";
import { humanError } from "@/lib/dashboard/errors";
import { fcfa } from "@/lib/dashboard/format";
import { useLoad } from "@/lib/dashboard/useLoad";
import type { DeliveryZone } from "@/lib/dashboard/types";

export default function LivraisonPage() {
  const { restaurant, reload: reloadRestaurant } = useRestaurant();
  const toast = useToast();
  const id = restaurant?.id;
  const cur = restaurant?.currency ?? "FCFA";
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [min, setMin] = useState("");
  const [removeZ, setRemoveZ] = useState<DeliveryZone | null>(null);

  const { data, loading, error, reload } = useLoad(async () => {
    if (!id) return [] as DeliveryZone[];
    return must(await db().from("resto_delivery_zones").select("*").eq("restaurant_id", id).eq("active", true).order("name")) as DeliveryZone[];
  }, [id]);
  if (!restaurant) return null;
  const zones = data ?? [];

  async function toggleDelivery(v: boolean) {
    const { error } = await db().from("resto_restaurants").update({ accepts_delivery: v }).eq("id", id!);
    if (error) return toast.show(humanError(error), "err");
    await reloadRestaurant();
    toast.show(v ? "Livraison activée." : "Livraison désactivée.");
  }
  async function add() {
    if (name.trim().length < 2) return toast.show("Donnez un nom à la zone (ex. Tokoin).", "err");
    const { error } = await db().from("resto_delivery_zones").insert({ restaurant_id: id, name: name.trim(), fee_fcfa: parseInt(fee) || 0, min_order_fcfa: parseInt(min) || 0 });
    if (error) return toast.show(humanError(error), "err");
    setName(""); setFee(""); setMin(""); toast.show("Zone ajoutée ✅"); reload();
  }
  async function update(z: DeliveryZone, patch: Partial<DeliveryZone>) {
    const { error } = await db().from("resto_delivery_zones").update(patch).eq("id", z.id);
    if (error) return toast.show(humanError(error), "err");
    reload();
  }

  return (
    <>
      <PageHeader title="Livraison" subtitle="Vos zones et vos frais." />
      <HelpBubble id="livraison" title="Livrer vos clients">
        Créez une zone par quartier avec ses frais. Le client choisit sa zone, voit les frais avant de payer, et vous recevez sa position et son repère écrit.
      </HelpBubble>

      <section className={`${cardCls} mb-4 flex items-center justify-between gap-3`}>
        <div><p className="font-bold">Accepter les commandes en livraison</p><p className="text-sm text-stone-600">Désactivez-la si vous ne pouvez plus livrer aujourd&apos;hui.</p></div>
        <Switch label="Livraison activée" checked={restaurant.accepts_delivery} onChange={toggleDelivery} />
      </section>

      <section className={`${cardCls} mb-4 space-y-2`}>
        <h2 className="font-bold">Qui livre ?</h2>
        <label className="flex min-h-11 items-center gap-2"><input type="radio" checked readOnly /> <span><strong>Mes livreurs</strong> (actif)</span></label>
        <label className="flex min-h-11 items-center gap-2 text-stone-500"><input type="radio" disabled /> <span>Réseau de livreurs indépendants — <em>bientôt disponible</em></span></label>
      </section>

      <section className={`${cardCls} mb-4 space-y-3`}>
        <h2 className="font-bold">Nouvelle zone</h2>
        <Field label="Nom du quartier"><input className={inputCls} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="Tokoin" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={`Frais (${cur})`}><input className={inputCls} inputMode="numeric" value={fee} onChange={(e) => setFee(e.target.value.replace(/\D/g, ""))} placeholder="500" /></Field>
          <Field label={`Commande minimum (${cur})`}><input className={inputCls} inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} placeholder="0" /></Field>
        </div>
        <button className={btnPrimary} onClick={add}>+ Ajouter la zone</button>
      </section>

      {loading ? <ListSkeleton rows={2} /> : error ? <ErrorBox message={error} onRetry={reload} /> : zones.length === 0 ? (
        <EmptyState icon="🛵" title="Aucune zone de livraison" text="Ajoutez au moins une zone pour que les clients puissent se faire livrer." />
      ) : (
        <ul className="space-y-3">
          {zones.map((z) => (
            <li key={z.id} className={`${cardCls} fade-in grid items-end gap-3 sm:grid-cols-[1fr_130px_130px_auto]`}>
              <div><p className="font-bold">{z.name}</p><p className="text-sm text-stone-600">{fcfa(z.fee_fcfa, cur)} · minimum {fcfa(z.min_order_fcfa, cur)}</p></div>
              <Field label="Frais"><input className={inputCls} inputMode="numeric" defaultValue={z.fee_fcfa} onBlur={(e) => { const v = parseInt(e.target.value) || 0; if (v !== z.fee_fcfa) update(z, { fee_fcfa: v }); }} /></Field>
              <Field label="Minimum"><input className={inputCls} inputMode="numeric" defaultValue={z.min_order_fcfa} onBlur={(e) => { const v = parseInt(e.target.value) || 0; if (v !== z.min_order_fcfa) update(z, { min_order_fcfa: v }); }} /></Field>
              <button className={btnGhost} onClick={() => setRemoveZ(z)} aria-label={`Retirer la zone ${z.name}`}>🗑️</button>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog open={!!removeZ} danger title={`Retirer la zone « ${removeZ?.name} » ?`} text="Les clients de ce quartier ne pourront plus se faire livrer."
        confirmLabel="Oui, retirer" onCancel={() => setRemoveZ(null)}
        onConfirm={() => { const z = removeZ!; setRemoveZ(null); update(z, { active: false }); }} />
      {toast.node}
    </>
  );
}
