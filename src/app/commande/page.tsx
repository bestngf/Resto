"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ClientShell from "@/components/layout/ClientShell";
import HelpBubble from "@/components/ui/HelpBubble";
import HelpButton from "@/components/ui/HelpButton";
import Checkout, { type TableInfo } from "@/components/commande/Checkout";
import { cartCount, cartTotal, clearCart, setQty, useCarts } from "@/lib/cart/cart";
import { formatFcfa } from "@/lib/format";
import { getSupabase } from "@/lib/supabase/client";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function Commander() {
  const carts = useCarts();
  const list = Object.values(carts).filter((c) => cartCount(c) > 0);
  const [table, setTable] = useState<TableInfo>(null);
  const [open, setOpen] = useState<string | null>(null);

  // Arrivée par QR code : /commande?t=<qr_token>. La table est gardée pour la session.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("t");
    const stored = (() => { try { return sessionStorage.getItem("resto:table"); } catch { return null; } })();
    const token = t && UUID.test(t) ? t : null;
    if (!token && stored) { try { setTable(JSON.parse(stored)); } catch {} return; }
    if (!token) return;
    getSupabase().rpc("resto_table_by_token", { p_token: token }).then(({ data }) => {
      if (data) {
        const info = data as { restaurant_id: string; table_id: string; label: string; slug: string; name: string };
        setTable(info);
        try { sessionStorage.setItem("resto:table", JSON.stringify(info)); } catch {}
      }
    });
  }, []);

  const btn = "flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--r-line)] bg-white text-lg font-semibold";
  return (
    <ClientShell>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Commander</h1>
        <HelpButton topic="client-commander" />
      </header>
      <HelpBubble id="client-panier" title="Ton panier">Ajuste les quantités, choisis comment tu veux être servi, puis envoie ta commande.</HelpBubble>
      {table && <p className="mb-4 rounded-xl ngf-ok p-3 text-sm font-medium">Tu es à la table {table.label}.</p>}
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--r-line)] bg-white p-6 text-center">
          <p className="font-semibold">Ton panier est vide</p>
          <p className="mt-1 text-sm text-[var(--r-muted)]">Choisis un restaurant pour ajouter des plats.</p>
          <Link href="/" className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-[var(--r-brand)] px-4 text-sm font-semibold text-[var(--r-brand-ink)]">Voir les restaurants</Link>
        </div>
      ) : list.map((c) => (
        <section key={c.restaurantId} className="mb-6 rounded-2xl border border-[var(--r-line)] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{c.restaurantName}</h2>
            <Link href={`/restaurant/${c.slug}`} className="text-sm font-medium text-[var(--r-brand)]">Ajouter des plats</Link>
          </div>
          <ul className="mt-3 divide-y divide-[var(--r-line)]">
            {c.lines.map((l) => (
              <li key={l.itemId} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{l.name}</p><p className="text-sm text-[var(--r-muted)]">{formatFcfa(l.priceFcfa)}</p></div>
                <button type="button" className={btn} aria-label={`Retirer un ${l.name}`} onClick={() => setQty(c.restaurantId, l.itemId, l.qty - 1)}>−</button>
                <span className="w-6 text-center font-semibold" aria-live="polite">{l.qty}</span>
                <button type="button" className={btn} aria-label={`Ajouter un ${l.name}`} onClick={() => setQty(c.restaurantId, l.itemId, l.qty + 1)}>+</button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-[var(--r-line)] pt-3">
            <span className="font-semibold">Sous-total</span><span className="font-bold">{formatFcfa(cartTotal(c))}</span>
          </div>
          {open === c.restaurantId ? (
            <Checkout cart={c} table={table} />
          ) : (
            <button type="button" onClick={() => setOpen(c.restaurantId)} className="mt-3 min-h-12 w-full rounded-xl bg-[var(--r-brand)] px-4 font-semibold text-[var(--r-brand-ink)]">Commander</button>
          )}
          <button type="button" onClick={() => { if (window.confirm("Vider ce panier ?")) clearCart(c.restaurantId); }} className="mt-3 min-h-11 text-sm font-medium text-[var(--r-muted)] underline">Vider ce panier</button>
        </section>
      ))}
    </ClientShell>
  );
}
