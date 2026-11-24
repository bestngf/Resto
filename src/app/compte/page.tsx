"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ClientShell from "@/components/layout/ClientShell";
import HelpBubble from "@/components/ui/HelpBubble";
import HelpButton from "@/components/ui/HelpButton";
import Skeleton from "@/components/ui/Skeleton";
import { getSupabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/useSession";
import { addToCart } from "@/lib/cart/cart";
import { formatFcfa } from "@/lib/format";

type Profile = { full_name: string; phone: string | null; last_momo_phone: string | null };
type OrderRow = { id: string; restaurant_id: string; status: string; total: number; created_at: string; resto_restaurants: { name: string; slug: string } | null; resto_order_items: { menu_item_id: string | null; name_snapshot: string; quantity: number }[] };
type ResaRow = { id: string; starts_at: string; party_size: number; status: string; resto_restaurants: { name: string; slug: string } | null };
type FavRow = { restaurant_id: string; resto_restaurants: { name: string; slug: string; cuisine: string | null } | null };

const STATUS: Record<string, string> = { recue: "Reçue", en_preparation: "En préparation", prete: "Prête", servie: "Servie", en_route: "En route", livree: "Livrée", annulee: "Annulée" };
const input = "mt-1 min-h-12 w-full rounded-xl border border-[var(--r-line)] bg-white px-4 text-base";
const fmtDate = (d: string) => new Date(d).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });

export default function Compte() {
  const router = useRouter();
  const { user, ready } = useSession();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [resas, setResas] = useState<ResaRow[]>([]);
  const [favs, setFavs] = useState<FavRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [momo, setMomo] = useState("");

  const load = useCallback(async (uid: string) => {
    setError(null);
    const sb = getSupabase();
    try {
      const p = await sb.from("resto_profiles").select("full_name,phone,last_momo_phone").eq("id", uid).maybeSingle();
      if (p.error) throw p.error;
      setProfile((p.data as Profile | null) ?? null);
      setName(p.data?.full_name ?? ""); setPhone(p.data?.phone ?? ""); setMomo(p.data?.last_momo_phone ?? "");
      const [o, r, f] = await Promise.all([
        sb.from("resto_orders").select("id,restaurant_id,status,total,created_at,resto_restaurants(name,slug),resto_order_items(menu_item_id,name_snapshot,quantity)").eq("customer_id", uid).order("created_at", { ascending: false }).limit(15),
        sb.from("resto_reservations").select("id,starts_at,party_size,status,resto_restaurants(name,slug)").eq("customer_id", uid).order("starts_at", { ascending: false }).limit(10),
        sb.from("resto_favorites").select("restaurant_id,resto_restaurants(name,slug,cuisine)").order("created_at", { ascending: false }),
      ]);
      setOrders((o.data ?? []) as unknown as OrderRow[]);
      setResas((r.data ?? []) as unknown as ResaRow[]);
      setFavs((f.data ?? []) as unknown as FavRow[]);
    } catch {
      setError("Impossible de charger ton compte. Vérifie ta connexion puis réessaie.");
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/connexion?next=/compte"); return; }
    load(user.id);
  }, [ready, user, router, load]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setMsg(null);
    if (name.trim().length < 2) { setMsg("Écris ton prénom ou ton nom."); return; }
    const sb = getSupabase();
    const row = { full_name: name.trim(), phone: phone.trim() || null, last_momo_phone: momo.trim() || null };
    const { error: err } = profile
      ? await sb.from("resto_profiles").update(row).eq("id", user.id)
      : await sb.from("resto_profiles").insert({ id: user.id, role: "client", ...row });
    if (err) { setMsg("Enregistrement impossible. Vérifie les numéros (chiffres, espaces et +) puis réessaie."); return; }
    setMsg("Enregistré.");
    load(user.id);
  }

  async function reorder(o: OrderRow) {
    setMsg(null);
    const ids = o.resto_order_items.map((i) => i.menu_item_id).filter(Boolean) as string[];
    if (ids.length === 0 || !o.resto_restaurants) { setMsg("Cette commande ne peut pas être refaite."); return; }
    // Prix et disponibilité actuels : on relit le menu au lieu de recopier l'ancienne commande.
    const { data } = await getSupabase().from("resto_menu_items").select("id,name,price_fcfa,available").in("id", ids).eq("restaurant_id", o.restaurant_id).eq("active", true);
    const current = new Map((data ?? []).filter((m) => m.available).map((m) => [m.id as string, m]));
    let added = 0;
    for (const it of o.resto_order_items) {
      const m = it.menu_item_id ? current.get(it.menu_item_id) : undefined;
      if (m) { addToCart({ id: o.restaurant_id, slug: o.resto_restaurants.slug, name: o.resto_restaurants.name }, { id: m.id, name: m.name, price_fcfa: m.price_fcfa }, it.quantity); added++; }
    }
    if (added === 0) { setMsg("Ces plats ne sont plus disponibles."); return; }
    router.push("/commande");
  }

  if (!ready || (user && profile === undefined && !error)) return <ClientShell><div className="space-y-3" aria-busy="true"><Skeleton className="h-10" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>      <div className="mt-4"><a href="/changer-code" className="block min-h-11 rounded-xl border border-[var(--r-line)] bg-white px-4 py-3 text-center text-sm font-semibold">Changer mon code</a></div>
    </ClientShell>;
  if (!user) return null;

  return (
    <ClientShell>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon compte</h1>
        <HelpButton topic="client-compte" />
      </header>
      <HelpBubble id="client-compte" title="Tes commandes au même endroit">Retrouve tes commandes, refais-en une en un geste et garde tes restaurants préférés.</HelpBubble>
      {error && <div role="alert" className="mb-4 rounded-2xl bg-red-50 p-4 text-sm">{error} <button type="button" className="font-semibold underline" onClick={() => load(user.id)}>Réessayer</button></div>}
      {msg && <p role="status" className="mb-4 rounded-xl ngf-ok p-3 text-sm font-medium">{msg}</p>}

      <section className="mb-6 rounded-2xl border border-[var(--r-line)] bg-white p-4">
        <h2 className="text-lg font-semibold">{profile ? "Mon profil" : "Termine ton profil"}</h2>
        <p className="text-sm text-[var(--r-muted)]">{user.email}</p>
        <form onSubmit={saveProfile} className="mt-3 space-y-3">
          <label className="block text-sm font-medium">Ton nom<input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" className={input} /></label>
          <label className="block text-sm font-medium">Téléphone (facultatif)<input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" className={input} /></label>
          <label className="block text-sm font-medium">Numéro mobile money (facultatif)<input value={momo} onChange={(e) => setMomo(e.target.value)} inputMode="tel" className={input} /></label>
          <button type="submit" className="min-h-12 w-full rounded-xl bg-[var(--r-brand)] font-semibold text-[var(--r-brand-ink)]">Enregistrer</button>
        </form>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Mes commandes</h2>
        {orders === null ? <Skeleton className="h-24" /> : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--r-line)] bg-white p-6 text-center"><p className="font-semibold">Aucune commande pour le moment</p><Link href="/" className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-[var(--r-brand)] px-4 text-sm font-semibold text-[var(--r-brand-ink)]">Choisir un restaurant</Link></div>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="rounded-2xl border border-[var(--r-line)] bg-white p-4">
                <div className="flex items-start justify-between gap-2"><div><p className="font-semibold">{o.resto_restaurants?.name}</p><p className="text-sm text-[var(--r-muted)]">{fmtDate(o.created_at)} – {STATUS[o.status] ?? o.status}</p></div><p className="font-bold">{formatFcfa(o.total)}</p></div>
                <p className="mt-1 text-sm text-[var(--r-muted)]">{o.resto_order_items.map((i) => `${i.quantity} × ${i.name_snapshot}`).join(", ")}</p>
                <div className="mt-3 flex gap-2">
                  <Link href={`/commande/suivi/${o.id}`} className="inline-flex min-h-11 items-center rounded-xl border border-[var(--r-line)] px-4 text-sm font-medium">Voir</Link>
                  <button type="button" onClick={() => reorder(o)} className="min-h-11 rounded-xl bg-[var(--r-brand)] px-4 text-sm font-semibold text-[var(--r-brand-ink)]">Recommander</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Mes réservations</h2>
        {resas.length === 0 ? <p className="rounded-2xl border border-dashed border-[var(--r-line)] bg-white p-4 text-sm text-[var(--r-muted)]">Aucune réservation. Va dans « Réserver » pour en faire une.</p> : (
          <ul className="space-y-2">{resas.map((r) => <li key={r.id} className="rounded-2xl border border-[var(--r-line)] bg-white p-4 text-sm"><p className="font-semibold">{r.resto_restaurants?.name}</p><p className="text-[var(--r-muted)]">{fmtDate(r.starts_at)} – {r.party_size} pers. – {r.status}</p></li>)}</ul>
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Mes favoris</h2>
        {favs.length === 0 ? <p className="rounded-2xl border border-dashed border-[var(--r-line)] bg-white p-4 text-sm text-[var(--r-muted)]">Touche « Favori » sur la fiche d&apos;un restaurant pour le retrouver ici.</p> : (
          <ul className="space-y-2">{favs.map((f) => f.resto_restaurants && <li key={f.restaurant_id}><Link href={`/restaurant/${f.resto_restaurants.slug}`} className="flex min-h-14 items-center justify-between rounded-2xl border border-[var(--r-line)] bg-white p-4"><span className="font-semibold">{f.resto_restaurants.name}</span><span className="text-sm text-[var(--r-muted)]">{f.resto_restaurants.cuisine}</span></Link></li>)}</ul>
        )}
      </section>

      <a href="/changer-code" className="mb-3 block min-h-12 rounded-xl border border-[var(--r-line)] bg-white px-4 py-3 text-center text-sm font-semibold">Changer mon code</a>
      <button type="button" onClick={async () => { await getSupabase().auth.signOut(); router.replace("/"); }} className="min-h-12 w-full rounded-xl border border-[var(--r-line)] bg-white font-medium">Me déconnecter</button>
    </ClientShell>
  );
}
