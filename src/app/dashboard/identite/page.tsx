"use client";
import { useEffect, useState } from "react";
import { Field, HelpBubble, PageHeader, Switch, btnGhost, btnPrimary, cardCls, inputCls, useToast } from "@/components/dashboard/ui";
import { useRestaurant } from "@/components/dashboard/RestaurantProvider";
import { db } from "@/lib/dashboard/db";
import { humanError } from "@/lib/dashboard/errors";
import { contrastRatio, fcfa, isHex, readableText, siteUrl } from "@/lib/dashboard/format";
import { uploadImage } from "@/lib/dashboard/image";
import { normalizePhone, whatsappLink } from "@/lib/orders/whatsapp";

const CURRENCIES = ["FCFA", "GHS", "NGN", "EUR", "USD"];

export default function IdentitePage() {
  const { restaurant: r, reload } = useRestaurant();
  const toast = useToast();
  const [f, setF] = useState({ name: "", cuisine: "", phone: "", whatsapp: "", address: "", landmark: "", currency: "FCFA", primary: "#c2410c", secondary: "#f59e0b", logo: "", cover: "", dine: true, take: true, deliv: false });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!r) return;
    setF({
      name: r.name, cuisine: r.cuisine ?? "", phone: r.phone ?? "", whatsapp: r.whatsapp ?? "", address: r.address ?? "", landmark: r.landmark ?? "",
      currency: r.currency || "FCFA", primary: r.primary_color ?? "#c2410c", secondary: r.secondary_color ?? "#f59e0b",
      logo: r.logo_url ?? "", cover: r.cover_url ?? "", dine: r.accepts_dine_in, take: r.accepts_takeaway, deliv: r.accepts_delivery,
    });
  }, [r]);
  if (!r) return null;
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  async function pick(kind: "logo" | "cover", file?: File) {
    if (!file || !r) return;
    setBusy(true);
    try {
      const url = kind === "logo" ? await uploadImage("resto-logos", r.id, "logo", file, 512) : await uploadImage("resto-couvertures", r.id, "cover", file, 1280);
      set(kind, url);
      toast.show("Image ajoutée. Pensez à enregistrer.");
    } catch (e) { toast.show(humanError(e), "err"); }
    setBusy(false);
  }

  async function save() {
    if (!r) return;
    if (!isHex(f.primary) || !isHex(f.secondary)) return toast.show("Choisissez des couleurs valides.", "err");
    if (f.name.trim().length < 2) return toast.show("Le nom du restaurant est trop court.", "err");
    setBusy(true);
    const { error } = await db().from("resto_restaurants").update({
      name: f.name.trim(), cuisine: f.cuisine || null, phone: normalizePhone(f.phone), whatsapp: normalizePhone(f.whatsapp),
      address: f.address || null, landmark: f.landmark || null, currency: f.currency,
      primary_color: f.primary, secondary_color: f.secondary, logo_url: f.logo || null, cover_url: f.cover || null,
      accepts_dine_in: f.dine, accepts_takeaway: f.take, accepts_delivery: f.deliv,
    }).eq("id", r.id);
    setBusy(false);
    if (error) return toast.show(humanError(error), "err");
    await reload();
    toast.show("Enregistré ✅");
  }

  async function setStatus(status: "actif" | "ferme") {
    if (!r) return;
    const { error } = await db().from("resto_restaurants").update({ status }).eq("id", r.id);
    if (error) return toast.show(humanError(error), "err");
    await reload();
    toast.show(status === "actif" ? "Votre restaurant est en ligne 🎉" : "Votre restaurant est fermé aux clients.");
  }

  const pText = readableText(f.primary), sText = readableText(f.secondary);
  const readable = Math.max(contrastRatio(f.primary, "#ffffff"), contrastRatio(f.primary, "#111111"));
  const link = `${siteUrl()}/r/${r.slug}`;

  return (
    <>
      <PageHeader title="Identité du restaurant" subtitle="Votre logo, vos couleurs et vos infos. L'aperçu change en direct." />
      <HelpBubble id="identite" title="Faites-le à votre image">
        Ajoutez votre logo et choisissez deux couleurs : votre site et l&apos;application les utilisent automatiquement. Le texte reste lisible tout seul.
      </HelpBubble>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className={`${cardCls} space-y-3`}>
            <h2 className="font-bold">Logo et photo de couverture</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Logo" hint="Image carrée de préférence. Réduite automatiquement.">
                <input type="file" accept="image/*" disabled={busy} className={inputCls} onChange={(e) => pick("logo", e.target.files?.[0])} />
              </Field>
              <Field label="Photo de couverture" hint="Photo large de votre salle ou d'un plat.">
                <input type="file" accept="image/*" disabled={busy} className={inputCls} onChange={(e) => pick("cover", e.target.files?.[0])} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Couleur principale"><input type="color" className="h-12 w-full rounded-xl border border-stone-300" value={f.primary} onChange={(e) => set("primary", e.target.value)} /></Field>
              <Field label="Couleur d'accent"><input type="color" className="h-12 w-full rounded-xl border border-stone-300" value={f.secondary} onChange={(e) => set("secondary", e.target.value)} /></Field>
            </div>
            {readable < 4.5 && <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-950">Cette couleur est difficile à lire avec du texte. Une couleur un peu plus claire ou plus foncée sera plus confortable.</p>}
          </section>

          <section className={`${cardCls} space-y-3`}>
            <h2 className="font-bold">Informations</h2>
            <Field label="Nom"><input className={inputCls} value={f.name} maxLength={80} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Type de cuisine"><input className={inputCls} value={f.cuisine} onChange={(e) => set("cuisine", e.target.value)} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Téléphone"><input className={inputCls} inputMode="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
              <Field label="Numéro WhatsApp" hint="Pour le bouton « Écrire sur WhatsApp »"><input className={inputCls} inputMode="tel" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
            </div>
            <Field label="Repère écrit"><input className={inputCls} value={f.landmark} onChange={(e) => set("landmark", e.target.value)} /></Field>
            <Field label="Adresse ou quartier"><input className={inputCls} value={f.address} onChange={(e) => set("address", e.target.value)} /></Field>
            <Field label="Monnaie des prix">
              <select className={inputCls} value={f.currency} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
            </Field>
          </section>

          <section className={`${cardCls} space-y-2`}>
            <h2 className="font-bold">Façons de commander</h2>
            {([["dine", "Sur place (QR code de la table)"], ["take", "À emporter"], ["deliv", "Livraison"]] as const).map(([k, label]) => (
              <div key={k} className="flex min-h-11 items-center justify-between gap-3"><span>{label}</span><Switch label={label} checked={f[k]} onChange={(v) => set(k, v)} /></div>
            ))}
          </section>

          <button className={`${btnPrimary} w-full min-h-14 text-base`} disabled={busy} onClick={save}>{busy ? "Patientez…" : "Enregistrer"}</button>

          <section className={`${cardCls} space-y-3`}>
            <h2 className="font-bold">Mise en ligne</h2>
            <p className="text-sm">Statut actuel : <strong>{r.status === "actif" ? "en ligne" : r.status === "ferme" ? "fermé" : r.status === "suspendu" ? "suspendu" : "brouillon (invisible des clients)"}</strong></p>
            {r.status === "suspendu" ? <p className="text-sm text-red-800">Votre restaurant est suspendu. Contactez le support.</p>
              : r.status === "actif" ? <button className={btnGhost} onClick={() => setStatus("ferme")}>Fermer aux clients</button>
              : <button className={btnPrimary} onClick={() => setStatus("actif")}>Mettre en ligne</button>}
            <p className="break-all text-sm text-stone-700">Votre lien : <a className="font-semibold underline" href={link}>{link}</a></p>
            <a className={btnGhost} href={whatsappLink(null, `Découvrez ${r.name} : ${link}`)} target="_blank" rel="noopener noreferrer">💬 Partager sur WhatsApp</a>
          </section>
        </div>

        <aside aria-label="Aperçu" className="lg:sticky lg:top-36 lg:self-start">
          <p className="mb-2 text-sm font-semibold text-stone-700">Aperçu sur téléphone</p>
          <div className="overflow-hidden rounded-3xl border-4 border-stone-800 bg-white">
            <div className="h-24 bg-stone-300 bg-cover bg-center" style={{ backgroundColor: f.primary, backgroundImage: f.cover ? `url(${f.cover})` : undefined }} />
            <div className="flex items-center gap-3 px-3 py-3" style={{ background: f.primary, color: pText }}>
              {f.logo ? <img src={f.logo} alt="" className="h-12 w-12 rounded-full bg-white object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-stone-900">🍽️</div>}
              <div className="min-w-0"><p className="truncate font-bold">{f.name || "Votre restaurant"}</p><p className="truncate text-xs opacity-90">{f.cuisine || "Cuisine"}</p></div>
            </div>
            <div className="space-y-2 p-3">
              <div className="flex items-center justify-between rounded-xl border border-stone-200 p-2 text-sm"><span>Riz au poulet</span><strong>{fcfa(2500, f.currency)}</strong></div>
              <button type="button" className="w-full rounded-xl py-3 text-sm font-bold" style={{ background: f.secondary, color: sText }}>Commander</button>
            </div>
          </div>
        </aside>
      </div>
      {toast.node}
    </>
  );
}
