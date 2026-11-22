"use client";
import { useCallback, useEffect, useState } from "react";
import { btnGhost, btnPrimary, cardCls, ConfirmDialog, ErrorBox, Skeleton, Switch } from "@/components/dashboard/ui";
import { getInvite, regenerateInvite, setInviteActive } from "@/lib/team/api";
import { teamError } from "@/lib/team/errors";
import { downloadDataUrl, qrDataUrl } from "@/lib/qr";
import "./team.css";
import { siteOrigin } from "@/config/public";

const base = () => siteOrigin();

export default function InviteCard({ restaurantId, restaurantName, notify }: { restaurantId: string; restaurantName: string; notify: (t: string, tone?: "ok" | "err") => void }) {
  const [inv, setInv] = useState<{ code: string; active: boolean } | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  // « invite » et non « code » : Supabase utilise déjà ?code= au retour du lien magique par e-mail.
  const link = inv?.code ? `${base()}/rejoindre?invite=${encodeURIComponent(inv.code)}` : "";

  const load = useCallback(async () => {
    setErr(null);
    try { setInv(await getInvite(restaurantId)); } catch (e) { setErr(teamError(e)); }
  }, [restaurantId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { let live = true; setQr(null); if (link) qrDataUrl(link, 512).then((u) => live && setQr(u)).catch(() => {}); return () => { live = false; }; }, [link]);

  async function run(fn: () => Promise<unknown>, okMsg: string) {
    setBusy(true);
    try { await fn(); await load(); notify(okMsg); } catch (e) { notify(teamError(e), "err"); } finally { setBusy(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(link); notify("Lien copié ✓"); } catch { notify("Copie impossible : sélectionne le lien et copie-le à la main.", "err"); }
  }
  const text = `Salut ! Rejoins l'équipe de ${restaurantName} sur Resto : ${link}`;

  if (err) return <ErrorBox message={err} onRetry={load} />;
  if (!inv) return <Skeleton className="h-48" />;
  return (
    <section className={`${cardCls} fade-in`} aria-labelledby="inv-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="inv-title" className="text-lg font-bold">Inviter quelqu&apos;un</h2>
          <p className="text-sm text-stone-600">Envoie ce lien ou montre le QR code. Tu valides ensuite chaque personne.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>{inv.active ? "Actif" : "Désactivé"}</span>
          <Switch checked={inv.active} disabled={busy} label="Activer ou désactiver l'invitation"
            onChange={(v) => run(() => setInviteActive(restaurantId, v), v ? "Invitation activée." : "Invitation désactivée : plus personne ne peut l'utiliser.")} />
        </div>
      </div>

      {!inv.code ? (
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">Aucun lien n&apos;a encore été créé pour ce restaurant.</p>
      ) : (
        <div className={`mt-4 grid gap-4 sm:grid-cols-[auto,1fr] ${inv.active ? "" : "opacity-50"}`}>
          <div className="mx-auto w-40">
            {qr ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={qr} alt="QR code pour rejoindre l'équipe" width={160} height={160} className="rounded-xl border border-stone-200" /> : <Skeleton className="h-40 w-40" />}
          </div>
          <div className="min-w-0 space-y-2">
            <input readOnly value={link} aria-label="Lien d'invitation" onFocus={(e) => e.currentTarget.select()} className="min-h-11 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <a className={`${btnPrimary} col-span-2`} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(text)}`}>Inviter sur WhatsApp</a>
              <button type="button" className={btnGhost} onClick={copy}>Copier le lien</button>
              <button type="button" className={btnGhost} disabled={!qr} onClick={() => qr && downloadDataUrl(qr, "qr-equipe.png")}>Télécharger le QR</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-stone-100 pt-3">
        <button type="button" disabled={busy} onClick={() => setConfirm(true)} className="min-h-11 text-sm font-semibold underline disabled:opacity-50">Créer un nouveau lien</button>
      </div>
      <ConfirmDialog open={confirm} title="Créer un nouveau lien ?" text="L'ancien lien et l'ancien QR code ne marcheront plus. Les demandes déjà envoyées restent en attente." confirmLabel="Oui, créer un nouveau lien"
        onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); run(() => regenerateInvite(restaurantId), "Nouveau lien créé. Pense à renvoyer l'invitation."); }} />
    </section>
  );
}
