"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog, EmptyState, ErrorBox, ListSkeleton, useToast } from "@/components/dashboard/ui";
import { isManager, useRestaurant } from "@/components/dashboard/RestaurantProvider";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { db } from "@/lib/dashboard/db";
import { humanError, isNetworkError } from "@/lib/dashboard/errors";
import { enqueue, flushQueue, onQueueChange, queueSize } from "@/lib/orders/offlineQueue";
import { orderMessage, whatsappLink } from "@/lib/orders/whatsapp";
import { playRing } from "@/lib/orders/alert";
import type { Order, OrderStatus } from "@/lib/dashboard/types";
import { OrderCard, STATUS_TITLE, useNow } from "./OrderCard";
import { ServiceBar } from "./ServiceBar";

type View = "tout" | "cuisine" | "salle";
const VIEW_STATUSES: Record<View, string[]> = {
  tout: ["recue", "en_preparation", "prete", "en_route"],
  cuisine: ["recue", "en_preparation"],
  salle: ["recue", "prete", "en_route"],
};
const DONE = ["servie", "livree", "annulee"];

export function OrdersBoard() {
  const { restaurant, role } = useRestaurant();
  const toast = useToast();
  const now = useNow();
  const [view, setView] = useState<View>("tout");
  const [queued, setQueued] = useState(0);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [showDone, setShowDone] = useState(false);

  const { orders, loading, error, link, refresh, patchLocal } = useRealtimeOrders(restaurant?.id ?? null, () => { playRing(); });

  useEffect(() => { if (role === "cuisinier") setView("cuisine"); else if (role === "serveur" || role === "caissier") setView("salle"); }, [role]);
  useEffect(() => { setQueued(queueSize()); return onQueueChange(() => setQueued(queueSize())); }, []);

  // Au retour du réseau (ou du direct) : envoi des changements gardés puis rafraîchissement.
  const flush = useCallback(async () => {
    if (queueSize() === 0) return;
    const r = await flushQueue();
    if (r.sent > 0) toast.show(`${r.sent} changement(s) envoyé(s).`);
    await refresh();
  }, [refresh, toast]);
  useEffect(() => {
    const on = () => { flush(); };
    window.addEventListener("online", on);
    if (link === "live") flush();
    return () => window.removeEventListener("online", on);
  }, [link, flush]);

  async function changeStatus(o: Order, to: OrderStatus) {
    const before = o.status;
    patchLocal(o.id, { status: to });
    try {
      if (!navigator.onLine) throw new TypeError("offline");
      const { error } = await db().rpc("resto_set_order_status", { p_order: o.id, p_status: to });
      if (error) throw error;
    } catch (e) {
      if (isNetworkError(e)) {
        enqueue(o.id, to);
        toast.show("Pas de réseau : le changement est gardé et sera envoyé dès que possible.");
      } else {
        patchLocal(o.id, { status: before });
        toast.show(humanError(e), "err");
        refresh();
      }
    }
  }

  async function confirmCash(o: Order) {
    const { error } = await db().rpc("resto_confirm_cash", { p_order: o.id });
    if (error) return toast.show(humanError(error), "err");
    patchLocal(o.id, { payment_status: "paye" });
    toast.show("Paiement en espèces enregistré.");
  }

  async function whatsapp(o: Order, kind: "prete" | "retard") {
    let phone: string | null = null;
    if (o.customer_id) {
      // Peut être vide si les règles de sécurité ne l'autorisent pas : on ouvre alors WhatsApp sans numéro.
      const { data } = await db().from("resto_profiles").select("phone").eq("id", o.customer_id).maybeSingle();
      phone = (data as { phone?: string } | null)?.phone ?? null;
    }
    const url = whatsappLink(phone, orderMessage(kind, o, restaurant?.name ?? "notre restaurant"));
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const visible = useMemo(() => {
    const allowed = VIEW_STATUSES[view];
    return allowed.map((s) => ({
      status: s,
      list: orders.filter((o) => o.status === s).sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)),
    })).filter((g) => g.list.length > 0);
  }, [orders, view]);
  const done = useMemo(() => orders.filter((o) => DONE.includes(o.status) && Date.now() - +new Date(o.updated_at) < 6 * 3600 * 1000), [orders]);
  const pending = orders.filter((o) => o.status === "recue").length;

  const cardProps = {
    role, now, onNext: changeStatus, onCancel: setCancelTarget, onCash: confirmCash, onWhatsApp: whatsapp,
  };

  return (
    <div>
      <ServiceBar pending={pending} link={link} queued={queued} />

      {isManager(role) || role === "caissier" ? (
        <div role="tablist" aria-label="Vue des commandes" className="mb-4 grid grid-cols-3 gap-2">
          {(["tout", "cuisine", "salle"] as View[]).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
              className={`min-h-11 rounded-xl text-sm font-semibold ${view === v ? "bg-emerald-700 text-white" : "bg-white text-stone-800 border border-stone-300"}`}>
              {v === "tout" ? "Tout" : v === "cuisine" ? "👨‍🍳 Cuisine" : "🍽️ Salle"}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? <ListSkeleton /> : error ? <ErrorBox message={error} onRetry={refresh} /> : (
        <>
          {visible.length === 0 ? (
            <EmptyState icon="😌" title="Aucune commande en cours"
              text="Dès qu'un client commande, elle apparaît ici avec une sonnerie. Gardez cet écran ouvert pendant le service." />
          ) : visible.map((g) => (
            <section key={g.status} className="mb-6" aria-label={STATUS_TITLE[g.status]}>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-600">{STATUS_TITLE[g.status]} ({g.list.length})</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {g.list.map((o) => <OrderCard key={o.id} order={o} {...cardProps} />)}
              </div>
            </section>
          ))}

          {done.length > 0 && (
            <section className="mt-6">
              <button className="min-h-11 text-sm font-semibold underline" onClick={() => setShowDone((v) => !v)}>
                {showDone ? "Masquer" : "Voir"} les commandes terminées récemment ({done.length})
              </button>
              {showDone && <div className="mt-2 grid gap-3 md:grid-cols-2">{done.map((o) => <OrderCard key={o.id} order={o} {...cardProps} />)}</div>}
            </section>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!cancelTarget} danger title="Annuler cette commande ?"
        text={cancelTarget?.payment_status === "paye" ? "Cette commande est déjà payée : un remboursement sera à traiter." : "Le client sera prévenu que sa commande est annulée."}
        confirmLabel="Oui, annuler"
        onCancel={() => setCancelTarget(null)}
        onConfirm={() => { const o = cancelTarget!; setCancelTarget(null); changeStatus(o, "annulee"); }}
      />
      {toast.node}
    </div>
  );
}
