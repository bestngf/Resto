"use client";
import { useState } from "react";
import { btnDanger, btnGhost, btnPrimary, ConfirmDialog, Modal } from "@/components/dashboard/ui";
import { changeRole, setMemberStatus } from "@/lib/team/api";
import { teamError } from "@/lib/team/errors";
import { assignableRoles, canManageMember, ROLE_HINT, ROLE_LABEL } from "@/lib/team/roles";
import type { Member, Role } from "@/lib/team/types";
import Avatar from "./Avatar";
import RoleBadge from "./RoleBadge";

const STATUS: Record<string, { label: string; tone: string }> = {
  actif: { label: "Actif", tone: "bg-emerald-100 text-emerald-950" },
  suspendu: { label: "Suspendu", tone: "bg-amber-100 text-amber-950" },
  retire: { label: "Retiré", tone: "bg-stone-200 text-stone-800" },
};

export default function MemberRow({ m, actorRole, myUserId, activePatrons, onDone, notify }: {
  m: Member; actorRole: Role | null; myUserId: string | null; activePatrons: number; onDone: () => void; notify: (t: string, tone?: "ok" | "err") => void;
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>(m.role);
  const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState<null | "suspendu" | "retire">(null);
  const name = m.profile?.full_name || "Membre sans nom";
  const me = m.user_id === myUserId;
  const lastPatron = m.role === "patron" && m.status === "actif" && activePatrons <= 1;
  const manageable = canManageMember(actorRole, m.role) && !me && m.status !== "retire";
  const st = STATUS[m.status] ?? STATUS.actif;

  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try { await fn(); notify(ok); setOpen(false); onDone(); } catch (e) { notify(teamError(e), "err"); } finally { setBusy(false); setAsk(null); }
  }

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3">
      <Avatar name={name} url={m.profile?.photo_url} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{name}{me && <span className="ml-1 text-xs font-normal text-stone-600">(toi)</span>}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5"><RoleBadge role={m.role} /><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.tone}`}>{st.label}</span></div>
      </div>
      {manageable && <button type="button" onClick={() => { setRole(m.role); setOpen(true); }} className={btnGhost}>Modifier</button>}

      <Modal open={open} title={name} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Rôle</span>
            <select value={role} disabled={lastPatron} onChange={(e) => setRole(e.target.value as Role)} className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-base">
              {assignableRoles(actorRole).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
            <span className="mt-1 block text-xs text-stone-600">{ROLE_HINT[role]}</span>
          </label>
          {lastPatron && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">C&apos;est le seul patron : il doit toujours en rester un. Nomme d&apos;abord un autre patron.</p>}
          <button type="button" disabled={busy || role === m.role || lastPatron} onClick={() => run(() => changeRole(m.id, role), `${name} est maintenant ${ROLE_LABEL[role].toLowerCase()}.`)} className={`${btnPrimary} w-full`}>Enregistrer le rôle</button>
          <div className="grid grid-cols-2 gap-2 border-t border-stone-100 pt-3">
            {m.status === "suspendu"
              ? <button type="button" disabled={busy} onClick={() => run(() => setMemberStatus(m.id, "actif"), `${name} peut de nouveau accéder au restaurant.`)} className={btnGhost}>Réactiver</button>
              : <button type="button" disabled={busy || lastPatron} onClick={() => setAsk("suspendu")} className={btnGhost}>Suspendre</button>}
            <button type="button" disabled={busy || lastPatron} onClick={() => setAsk("retire")} className={btnDanger}>Retirer de l&apos;équipe</button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={ask === "suspendu"} title={`Suspendre ${name} ?`} text="Il n'aura plus accès au restaurant jusqu'à ce que tu le réactives. Rien n'est supprimé." confirmLabel="Oui, suspendre"
        onCancel={() => setAsk(null)} onConfirm={() => run(() => setMemberStatus(m.id, "suspendu"), `${name} est suspendu.`)} />
      <ConfirmDialog open={ask === "retire"} danger title={`Retirer ${name} de l'équipe ?`} text="Il perdra son accès. Pour revenir, il devra refaire une demande avec une invitation." confirmLabel="Oui, retirer"
        onCancel={() => setAsk(null)} onConfirm={() => run(() => setMemberStatus(m.id, "retire"), `${name} a été retiré de l'équipe.`)} />
    </li>
  );
}
