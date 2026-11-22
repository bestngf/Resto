"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSiteCart } from "@/lib/site/cart";
import { fcfa, safeUrl } from "@/lib/site/safe";
import type { SiteCategory, SiteItem } from "@/lib/site/types";

export default function MenuClient({ slug, currency, canOrder, categories, items }: { slug: string; currency: string; canOrder: boolean; categories: SiteCategory[]; items: SiteItem[] }) {
  const cart = useSiteCart(slug);
  const [saver, setSaver] = useState(false);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  // Mode économie de données : activé tout seul sur connexion lente ou si le téléphone le demande.
  useEffect(() => {
    try {
      const c = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
      const saved = localStorage.getItem("resto:saver");
      setSaver(saved ? saved === "1" : !!c?.saveData || /^(slow-2g|2g|3g)$/.test(c?.effectiveType ?? ""));
    } catch {}
  }, []);
  const toggle = () => { const n = !saver; setSaver(n); try { localStorage.setItem("resto:saver", n ? "1" : "0"); } catch {} };

  if (!items.length) return <p className="rounded-2xl bg-[var(--brand-soft)] p-4">Le menu n&apos;est pas encore en ligne. Reviens bientôt ou écris-nous sur WhatsApp !</p>;
  const groups = [...categories.map((c) => ({ id: c.id, name: c.name, items: items.filter((i) => i.category_id === c.id) })), { id: "_", name: "Autres", items: items.filter((i) => !categories.some((c) => c.id === i.category_id)) }].filter((g) => g.items.length);
  const qty = (id: string) => cart.lines.find((l) => l.id === id)?.qty ?? 0;

  return (
    <div>
      <label className="mb-4 flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={saver} onChange={toggle} className="h-5 w-5" /> Économiser mes données (photos au toucher)
      </label>
      <nav aria-label="Catégories" className="sticky top-0 z-10 -mx-4 mb-4 flex gap-2 overflow-x-auto bg-white px-4 py-2">
        {groups.map((g) => <a key={g.id} href={`#cat-${g.id}`} className="shrink-0 rounded-full border border-neutral-300 px-4 py-2 text-sm">{g.name}</a>)}
      </nav>
      {groups.map((g) => (
        <section key={g.id} id={`cat-${g.id}`} className="mb-8 scroll-mt-16">
          <h2 className="mb-3 text-xl font-bold">{g.name}</h2>
          <ul className="space-y-3">
            {g.items.map((it) => {
              const photo = safeUrl(it.photo_url), n = qty(it.id), visible = photo && (!saver || shown[it.id]);
              return (
                <li key={it.id} className={`r-rise flex gap-3 rounded-2xl border border-neutral-200 p-3 ${it.available ? "" : "opacity-50"}`}>
                  {photo && (
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                      {visible ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={photo} alt={it.name} loading="lazy" decoding="async" width={96} height={96} className="h-full w-full object-cover" />
                        : <button type="button" onClick={() => setShown((s) => ({ ...s, [it.id]: true }))} className="h-full w-full text-xs text-neutral-600">Voir la photo</button>}
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="font-semibold">{it.name}</p>
                    {it.description && <p className="line-clamp-2 text-sm text-neutral-600">{it.description}</p>}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="font-bold text-[var(--brand-text)]">{fcfa(it.price_fcfa, currency)}</span>
                      {!it.available ? <span className="text-sm">Indisponible aujourd&apos;hui</span> : !canOrder ? null : n === 0 ? (
                        <button type="button" onClick={() => cart.add({ id: it.id, name: it.name, price: it.price_fcfa })} className="min-h-11 rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-[var(--on-brand)]">Ajouter</button>
                      ) : (
                        <span className="flex items-center gap-2">
                          <button type="button" aria-label={`Retirer un ${it.name}`} onClick={() => cart.setQty(it.id, n - 1)} className="h-11 w-11 rounded-xl border border-neutral-300 text-lg">−</button>
                          <span className="r-pop w-6 text-center font-semibold" key={n}>{n}</span>
                          <button type="button" aria-label={`Ajouter un ${it.name}`} onClick={() => cart.setQty(it.id, n + 1)} className="h-11 w-11 rounded-xl bg-[var(--brand)] text-lg text-[var(--on-brand)]">+</button>
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {cart.count > 0 && (
        <Link href={`/r/${slug}/commander`} className="r-rise fixed inset-x-4 bottom-20 z-30 mx-auto flex min-h-14 max-w-3xl items-center justify-between rounded-2xl bg-[var(--brand)] px-5 font-semibold text-[var(--on-brand)] shadow-lg">
          <span>Voir mon panier ({cart.count})</span><span>{fcfa(cart.total, currency)}</span>
        </Link>
      )}
    </div>
  );
}
