"use client";
import { useEffect, useState } from "react";
import { ConfirmDialog, EmptyState, ErrorBox, Field, HelpBubble, ListSkeleton, PageHeader, btnGhost, btnPrimary, cardCls, inputCls, useToast } from "@/components/dashboard/ui";
import { useRestaurant } from "@/components/dashboard/RestaurantProvider";
import { db, must } from "@/lib/dashboard/db";
import { humanError } from "@/lib/dashboard/errors";
import { siteUrl } from "@/lib/dashboard/format";
import { useLoad } from "@/lib/dashboard/useLoad";
import { downloadDataUrl, qrDataUrl, tableUrl } from "@/lib/qr";
import type { TableRow } from "@/lib/dashboard/types";

export default function TablesPage() {
  const { restaurant } = useRestaurant();
  const toast = useToast();
  const id = restaurant?.id;
  const [label, setLabel] = useState("");
  const [seats, setSeats] = useState("4");
  const [count, setCount] = useState("");
  const [qr, setQr] = useState<Record<string, string>>({});
  const [removeT, setRemoveT] = useState<TableRow | null>(null);

  const { data, loading, error, reload } = useLoad(async () => {
    if (!id) return [] as TableRow[];
    return must(await db().from("resto_tables").select("*").eq("restaurant_id", id).eq("active", true).order("label")) as TableRow[];
  }, [id]);
  const tables = data ?? [];

  useEffect(() => {
    if (!restaurant) return;
    let alive = true;
    Promise.all(tables.map(async (t) => [t.id, await qrDataUrl(tableUrl(siteUrl(), restaurant.slug, t.qr_token), 480)] as const))
      .then((pairs) => { if (alive) setQr(Object.fromEntries(pairs)); })
      .catch(() => {});
    return () => { alive = false; };
  }, [tables.map((t) => t.qr_token).join(","), restaurant?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!restaurant) return null;
  const nSeats = Math.min(50, Math.max(1, parseInt(seats) || 1));

  async function add() {
    const n = parseInt(count);
    const rows = n > 1
      ? Array.from({ length: Math.min(n, 50) }, (_, i) => ({ restaurant_id: id, label: `${label.trim() || "Table"} ${tables.length + i + 1}`, seats: nSeats }))
      : [{ restaurant_id: id, label: label.trim() || `Table ${tables.length + 1}`, seats: nSeats }];
    const { error } = await db().from("resto_tables").insert(rows);
    if (error) return toast.show(humanError(error), "err");
    setLabel(""); setCount(""); toast.show(rows.length > 1 ? `${rows.length} tables créées ✅` : "Table créée ✅"); reload();
  }
  async function remove() {
    if (!removeT) return;
    const t = removeT; setRemoveT(null);
    const { error } = await db().from("resto_tables").update({ active: false }).eq("id", t.id);
    if (error) return toast.show(humanError(error), "err");
    toast.show(`${t.label} retirée.`); reload();
  }
  const safeName = (s: string) => s.normalize("NFD").replace(/[^\w-]+/g, "-").toLowerCase();

  return (
    <>
      <PageHeader title="Tables et QR codes" subtitle="Un QR code par table : le client commande depuis son téléphone."
        right={tables.length > 0 ? <button className={btnPrimary} onClick={() => window.print()}>🖨️ Imprimer les QR</button> : undefined} />
      <HelpBubble id="tables" title="Comment ça marche ?">
        Créez vos tables, imprimez les QR codes et posez-les dessus. Le client scanne, choisit ses plats, et la commande arrive ici avec le numéro de la table.
      </HelpBubble>

      <section className={`${cardCls} mb-4 space-y-3`}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Nom"><input className={inputCls} value={label} maxLength={30} placeholder="Table" onChange={(e) => setLabel(e.target.value)} /></Field>
          <Field label="Places"><input className={inputCls} inputMode="numeric" value={seats} onChange={(e) => setSeats(e.target.value.replace(/\D/g, ""))} /></Field>
          <Field label="Combien ?" hint="Laissez vide pour une seule"><input className={inputCls} inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value.replace(/\D/g, ""))} /></Field>
        </div>
        <button className={btnPrimary} onClick={add}>+ Créer</button>
      </section>

      {loading ? <ListSkeleton /> : error ? <ErrorBox message={error} onRetry={reload} /> : tables.length === 0 ? (
        <EmptyState icon="🪑" title="Aucune table pour l'instant" text="Créez votre première table ci-dessus. Pensez à indiquer le nombre de places : il sert aussi aux réservations." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {tables.map((t) => (
            <li key={t.id} className={`${cardCls} fade-in text-center`}>
              <p className="font-bold">{t.label}</p>
              <p className="mb-2 text-sm text-stone-600">{t.seats} place{t.seats > 1 ? "s" : ""}</p>
              {qr[t.id] ? <img src={qr[t.id]} alt={`QR code de ${t.label}`} className="mx-auto h-40 w-40" /> : <div className="mx-auto h-40 w-40 animate-pulse rounded-xl bg-stone-200" />}
              <div className="mt-3 flex justify-center gap-2">
                <button className={btnGhost} disabled={!qr[t.id]} onClick={() => downloadDataUrl(qr[t.id], `qr-${safeName(t.label)}.png`)}>⬇️ Image</button>
                <button className={btnGhost} onClick={() => setRemoveT(t)} aria-label={`Retirer ${t.label}`}>🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Feuille d'impression : React échappe les noms, aucun HTML injecté */}
      <div className="print-sheet" aria-hidden>
        {tables.map((t) => (
          <div key={t.id} className="print-card">
            <p style={{ fontSize: 22, fontWeight: 800 }}>{restaurant.name}</p>
            <p style={{ fontSize: 28, fontWeight: 800, margin: "8px 0" }}>{t.label}</p>
            {qr[t.id] && <img src={qr[t.id]} alt="" style={{ width: 240, height: 240, margin: "0 auto" }} />}
            <p style={{ marginTop: 8 }}>Scannez pour commander</p>
          </div>
        ))}
      </div>

      <ConfirmDialog open={!!removeT} danger title={`Retirer « ${removeT?.label} » ?`} text="Son QR code ne fonctionnera plus. Les anciennes commandes restent dans l'historique."
        confirmLabel="Oui, retirer" onCancel={() => setRemoveT(null)} onConfirm={remove} />
      {toast.node}
    </>
  );
}
