"use client";
import { useState } from "react";
import { btnGhost, btnPrimary, cardCls, ConfirmDialog } from "@/components/dashboard/ui";
import { decideRequest } from "@/lib/team/api";
import { teamError } from "@/lib/team/errors";
import { timeAgo } from "@/lib/team/format";
import { assignableRoles, DEFAULT_ROLE, ROLE_HINT, ROLE_LABEL, UPGRADE_HREF } from "@/lib/team/roles";
import { digits } from "@/lib/team/phone";
import type { Role, StaffRequest } from "@/lib/team/types";
import Avatar from "./Avatar";

/** Validation en un toucher : le rôle « serveur » est proposé d'office, on peut le changer avant de valider. */
export default function RequestCard({ req, actorRole, onDone, notify }: { req: StaffRequest; actorRole: Role | null; onDone: () => void; notify: (t: string, tone?: "ok" | "err") => void }) {
  const roles = assignableRoles(actorRole);
  const [role, setRole] = useState<Role>(roles.includes(DEFAULT_ROLE) ? DEFAULT_ROLE : roles[0] ?? DEFAULT_ROLE);
  const [busy, setBusy] = useState(false);
  const [refuse, setRefuse] = useState(false);
  const [limit, setLimit] = useState(false);
  const name = req.profile?.full_name || "Nouveau membre";
  const phone = req.profile?.phone;
  const wa = phone && digits(phone).length >= 8 ? `https://wa.me/${digits(phone).length === 8 ? "228" : ""}${digits(phone)}` : null;

  async function decide(accept: boolean) {
    setBusy(true); setLimit(false);
    try {
      await decideRequest(req.id, accept, role);
      notify(accept ? `${name} est maintenant ${ROLE_LABEL[role].toLowerCase()}.` : `La demande de ${name} a été refusée.`);
      onDone();
    } catch (e) {
      const m = teamError(e);
      if (/limite|formule/i.test(m)) setLimit(true);
      notify(m, "err");
    } finally { setBusy(false); }
  }

  return (
    <li className={`${cardCls} fade-in`}>
      <div className="flex items-center gap-3">
        <Avatar name={name} url={req.profile?.photo_url} size={52} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">{name}</p>
          <p className="text-sm text-stone-600">{phone ?? "Téléphone non renseigné"} · {timeAgo(req.created_at)}</p>
        </div>
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className={btnGhost} aria-label={`Écrire à ${name} sur WhatsApp`}>WhatsApp</a>}
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-sm font-semibold">Rôle à donner</span>
        <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-base">
          {roles.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </select>
        <span className="mt-1 block text-xs text-stone-600">{ROLE_HINT[role]}</span>
      </label>

      {limit && (
        <p role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
          Votre formule est complète. Retirez un membre{UPGRADE_HREF ? <> ou <a className="font-semibold underline" href={UPGRADE_HREF}>passez à une formule supérieure</a></> : " ou passez à une formule supérieure"}.
        </p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" disabled={busy || !roles.length} onClick={() => decide(true)} className={btnPrimary}>{busy ? "…" : `Valider comme ${ROLE_LABEL[role].toLowerCase()}`}</button>
        <button type="button" disabled={busy} onClick={() => setRefuse(true)} className={btnGhost}>Refuser</button>
      </div>
      <ConfirmDialog open={refuse} danger title={`Refuser ${name} ?`} text="La personne sera prévenue et n'aura aucun accès au restaurant. Elle pourra redemander avec une nouvelle invitation." confirmLabel="Oui, refuser"
        onCancel={() => setRefuse(false)} onConfirm={() => { setRefuse(false); decide(false); }} />
    </li>
  );
}
