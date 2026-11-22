"use client";
import { useState } from "react";
import { ConfirmDialog, EmptyState, ErrorBox, Field, HelpBubble, ListSkeleton, Modal, PageHeader, Switch, btnGhost, btnPrimary, cardCls, inputCls, useToast } from "@/components/dashboard/ui";
import { MoveButtons, SortableList } from "@/components/dashboard/Sortable";
import { useRestaurant } from "@/components/dashboard/RestaurantProvider";
import { db, must } from "@/lib/dashboard/db";
import { humanError } from "@/lib/dashboard/errors";
import { fcfa } from "@/lib/dashboard/format";
import { uploadImage } from "@/lib/dashboard/image";
import { useLoad } from "@/lib/dashboard/useLoad";
import type { Category, MenuItem, OptionGroup } from "@/lib/dashboard/types";

interface Draft { id?: string; name: string; description: string; price: string; category_id: string; photo_url: string; options: { name: string; choices: string }[] }
const emptyDraft = (cat = ""): Draft => ({ name: "", description: "", price: "", category_id: cat, photo_url: "", options: [] });

export default function MenusPage() {
  const { restaurant } = useRestaurant();
  const toast = useToast();
  const id = restaurant?.id;
  const cur = restaurant?.currency ?? "FCFA";
  const [newCat, setNewCat] = useState("");
  const [editCat, setEditCat] = useState<{ id: string; name: string } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ kind: "item" | "cat"; id: string; name: string } | null>(null);

  const { data, loading, error, reload, setData } = useLoad(async () => {
    if (!id) return { cats: [] as Category[], items: [] as MenuItem[] };
    const [c, i] = await Promise.all([
      db().from("resto_categories").select("*").eq("restaurant_id", id).eq("active", true).order("sort"),
      db().from("resto_menu_items").select("*").eq("restaurant_id", id).eq("active", true).order("sort"),
    ]);
    return { cats: must(c) as Category[], items: must(i) as MenuItem[] };
  }, [id]);

  if (!restaurant) return null;
  const cats = data?.cats ?? [], items = data?.items ?? [];

  async function persistOrder(table: "resto_categories" | "resto_menu_items", rows: { id: string }[]) {
    const res = await Promise.all(rows.map((r, i) => db().from(table).update({ sort: i }).eq("id", r.id)));
    if (res.some((r) => r.error)) { toast.show("Le nouvel ordre n'a pas pu être enregistré.", "err"); reload(); }
  }

  async function addCategory() {
    const name = newCat.trim();
    if (!name || !id) return;
    const { error } = await db().from("resto_categories").insert({ restaurant_id: id, name, sort: cats.length });
    if (error) return toast.show(humanError(error), "err");
    setNewCat(""); reload();
  }
  async function renameCategory() {
    if (!editCat || !editCat.name.trim()) return;
    const { error } = await db().from("resto_categories").update({ name: editCat.name.trim() }).eq("id", editCat.id);
    if (error) return toast.show(humanError(error), "err");
    setEditCat(null); reload();
  }
  async function toggle(item: MenuItem, available: boolean) {
    setData((d) => d && { ...d, items: d.items.map((x) => (x.id === item.id ? { ...x, available } : x)) });
    const { error } = await db().rpc("set_item_availability", { p_item: item.id, p_available: available });
    if (error) { toast.show(humanError(error), "err"); reload(); }
    else toast.show(available ? `${item.name} est de nouveau disponible.` : `${item.name} est retiré pour aujourd'hui.`);
  }
  async function pickPhoto(file?: File) {
    if (!file || !id) return;
    setBusy(true);
    try { const url = await uploadImage("resto-photos-plats", id, "plat", file, 900); setDraft((d) => d && { ...d, photo_url: url }); }
    catch (e) { toast.show(humanError(e), "err"); }
    setBusy(false);
  }
  async function saveItem() {
    if (!draft || !id) return;
    const price = Math.round(Number(draft.price));
    if (draft.name.trim().length < 1) return toast.show("Donnez un nom au plat.", "err");
    if (!Number.isFinite(price) || price < 0) return toast.show("Le prix est incorrect.", "err");
    const options: OptionGroup[] = draft.options
      .map((o) => ({ name: o.name.trim(), choices: o.choices.split(",").map((c) => c.trim()).filter(Boolean) }))
      .filter((o) => o.name && o.choices.length > 0);
    const row = { name: draft.name.trim(), description: draft.description.trim() || null, price_fcfa: price, category_id: draft.category_id || null, photo_url: draft.photo_url || null, options };
    setBusy(true);
    const res = draft.id
      ? await db().from("resto_menu_items").update(row).eq("id", draft.id)
      : await db().from("resto_menu_items").insert({ ...row, restaurant_id: id, sort: items.length });
    setBusy(false);
    if (res.error) return toast.show(humanError(res.error), "err");
    setDraft(null); toast.show("Plat enregistré ✅"); reload();
  }
  // « Retirer » = masquer (aucune suppression de données) : les anciennes commandes gardent leur historique.
  async function remove() {
    if (!removeTarget) return;
    const t = removeTarget; setRemoveTarget(null);
    const { error } = await db().from(t.kind === "item" ? "resto_menu_items" : "resto_categories").update({ active: false }).eq("id", t.id);
    if (error) return toast.show(humanError(error), "err");
    toast.show(`${t.name} a été retiré du menu.`); reload();
  }

  const groups = [...cats.map((c) => ({ cat: c as Category | null, list: items.filter((i) => i.category_id === c.id) })),
    { cat: null, list: items.filter((i) => !i.category_id || !cats.some((c) => c.id === i.category_id)) }].filter((g) => g.cat || g.list.length > 0);

  return (
    <>
      <PageHeader title="Mes menus" subtitle="Catégories et plats. Déplacez-les pour choisir l'ordre."
        right={<button className={btnPrimary} onClick={() => setDraft(emptyDraft(cats[0]?.id))}>+ Ajouter un plat</button>} />
      <HelpBubble id="menus" title="Votre menu en quelques minutes">
        Créez une catégorie (ex. « Plats », « Boissons »), puis ajoutez vos plats avec photo et prix. Un plat fini pour aujourd&apos;hui ? Coupez l&apos;interrupteur : il disparaît pour les clients.
      </HelpBubble>

      <div className={`${cardCls} mb-4 flex gap-2`}>
        <input className={inputCls} aria-label="Nom de la nouvelle catégorie" placeholder="Nouvelle catégorie (ex. Boissons)" value={newCat} maxLength={60}
          onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCategory()} />
        <button className={btnPrimary} onClick={addCategory}>Ajouter</button>
      </div>

      {loading ? <ListSkeleton /> : error ? <ErrorBox message={error} onRetry={reload} /> : groups.length === 0 ? (
        <EmptyState icon="🍲" title="Votre menu est vide" text="Ajoutez votre premier plat : nom, prix et une belle photo suffisent."
          action={<button className={btnPrimary} onClick={() => setDraft(emptyDraft())}>Ajouter mon premier plat</button>} />
      ) : (
        <SortableList className="space-y-4" items={groups.filter((g) => g.cat).map((g) => g.cat!)} onReorder={(next) => { setData((d) => d && { ...d, cats: next }); persistOrder("resto_categories", next); }}
          render={(cat, ctl) => {
            const list = items.filter((i) => i.category_id === cat.id);
            return (
              <section className={cardCls} aria-label={cat.name}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1">{ctl.handle}
                    {editCat?.id === cat.id ? (
                      <input className={inputCls} autoFocus value={editCat.name} onChange={(e) => setEditCat({ id: cat.id, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && renameCategory()} onBlur={renameCategory} />
                    ) : <h2 className="truncate text-lg font-bold">{cat.name}</h2>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <MoveButtons ctl={ctl} label={cat.name} />
                    <button className={btnGhost} onClick={() => setEditCat({ id: cat.id, name: cat.name })} aria-label={`Renommer ${cat.name}`}>✏️</button>
                    <button className={btnGhost} onClick={() => setRemoveTarget({ kind: "cat", id: cat.id, name: cat.name })} aria-label={`Retirer ${cat.name}`}>🗑️</button>
                  </div>
                </div>
                {list.length === 0 && <p className="py-2 text-sm text-stone-600">Aucun plat ici. <button className="font-semibold underline" onClick={() => setDraft(emptyDraft(cat.id))}>Ajouter un plat</button></p>}
                <SortableList className="space-y-2" items={list}
                  onReorder={(next) => { setData((d) => d && { ...d, items: [...d.items.filter((i) => i.category_id !== cat.id), ...next] }); persistOrder("resto_menu_items", next); }}
                  render={(it, c2) => <ItemRow item={it} ctl={c2} cur={cur} onToggle={toggle} onEdit={() => setDraft({ id: it.id, name: it.name, description: it.description ?? "", price: String(it.price_fcfa), category_id: it.category_id ?? "", photo_url: it.photo_url ?? "", options: (it.options ?? []).map((o) => ({ name: o.name, choices: o.choices.join(", ") })) })} onRemove={() => setRemoveTarget({ kind: "item", id: it.id, name: it.name })} />} />
              </section>
            );
          }} />
      )}
      {groups.find((g) => !g.cat) && (
        <section className={`${cardCls} mt-4`}>
          <h2 className="mb-2 text-lg font-bold">Sans catégorie</h2>
          <div className="space-y-2">{groups.find((g) => !g.cat)!.list.map((it) => (
            <ItemRow key={it.id} item={it} cur={cur} onToggle={toggle} onEdit={() => setDraft({ id: it.id, name: it.name, description: it.description ?? "", price: String(it.price_fcfa), category_id: "", photo_url: it.photo_url ?? "", options: (it.options ?? []).map((o) => ({ name: o.name, choices: o.choices.join(", ") })) })} onRemove={() => setRemoveTarget({ kind: "item", id: it.id, name: it.name })} />
          ))}</div>
        </section>
      )}

      <Modal open={!!draft} title={draft?.id ? "Modifier le plat" : "Nouveau plat"} onClose={() => setDraft(null)}>
        {draft && (
          <div className="space-y-3">
            <Field label="Nom du plat"><input className={inputCls} value={draft.name} maxLength={120} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
            <Field label={`Prix (${cur})`}><input className={inputCls} inputMode="numeric" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value.replace(/[^\d]/g, "") })} /></Field>
            <Field label="Catégorie">
              <select className={inputCls} value={draft.category_id} onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}>
                <option value="">Sans catégorie</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Description (facultatif)"><textarea className={inputCls} rows={2} maxLength={500} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
            <Field label="Photo" hint="Réduite automatiquement pour charger vite.">
              <input type="file" accept="image/*" className={inputCls} disabled={busy} onChange={(e) => pickPhoto(e.target.files?.[0])} />
            </Field>
            {draft.photo_url && <img src={draft.photo_url} alt="" className="h-28 w-28 rounded-xl object-cover" />}
            <fieldset className="space-y-2 rounded-xl border border-stone-200 p-3">
              <legend className="px-1 text-sm font-semibold">Options (piment, accompagnement…)</legend>
              {draft.options.map((o, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
                  <input className={inputCls} aria-label="Nom de l'option" placeholder="Piment" value={o.name} onChange={(e) => setDraft({ ...draft, options: draft.options.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
                  <input className={inputCls} aria-label="Choix séparés par des virgules" placeholder="Sans, Doux, Fort" value={o.choices} onChange={(e) => setDraft({ ...draft, options: draft.options.map((x, j) => (j === i ? { ...x, choices: e.target.value } : x)) })} />
                  <button className={btnGhost} aria-label="Retirer cette option" onClick={() => setDraft({ ...draft, options: draft.options.filter((_, j) => j !== i) })}>✕</button>
                </div>
              ))}
              <button type="button" className={btnGhost} onClick={() => setDraft({ ...draft, options: [...draft.options, { name: "", choices: "" }] })}>+ Ajouter une option</button>
              <p className="text-xs text-stone-600">Les options n&apos;ajoutent pas de supplément de prix.</p>
            </fieldset>
            <button className={`${btnPrimary} w-full`} disabled={busy} onClick={saveItem}>{busy ? "Patientez…" : "Enregistrer le plat"}</button>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!removeTarget} danger title={`Retirer « ${removeTarget?.name} » ?`}
        text={removeTarget?.kind === "cat" ? "La catégorie disparaît du menu. Ses plats restent dans « Sans catégorie »." : "Le plat disparaît du menu. Vos anciennes commandes ne changent pas."}
        confirmLabel="Oui, retirer" onCancel={() => setRemoveTarget(null)} onConfirm={remove} />
      {toast.node}
    </>
  );
}

function ItemRow({ item, ctl, cur, onToggle, onEdit, onRemove }: {
  item: MenuItem; ctl?: { handle: React.ReactNode; up: () => void; down: () => void; isFirst: boolean; isLast: boolean }; cur: string;
  onToggle: (i: MenuItem, v: boolean) => void; onEdit: () => void; onRemove: () => void;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border border-stone-200 p-2 ${item.available ? "" : "bg-stone-100"}`}>
      {ctl?.handle}
      {item.photo_url ? <img src={item.photo_url} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-lg object-cover" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-stone-200 text-2xl" aria-hidden>🍽️</div>}
      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold ${item.available ? "" : "text-stone-500 line-through"}`}>{item.name}</p>
        <p className="text-sm text-stone-700">{fcfa(item.price_fcfa, cur)}{!item.available && " · indisponible aujourd'hui"}</p>
      </div>
      <Switch checked={item.available} onChange={(v) => onToggle(item, v)} label={`${item.name} disponible aujourd'hui`} />
      {ctl && <MoveButtons ctl={ctl} label={item.name} />}
      <button className="min-h-11 min-w-11 rounded-lg border border-stone-300" onClick={onEdit} aria-label={`Modifier ${item.name}`}>✏️</button>
      <button className="min-h-11 min-w-11 rounded-lg border border-stone-300" onClick={onRemove} aria-label={`Retirer ${item.name}`}>🗑️</button>
    </div>
  );
}
