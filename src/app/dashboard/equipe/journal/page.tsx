"use client";
import Link from "next/link";
import { useRestaurant } from "@/components/dashboard/RestaurantProvider";
import { EmptyState, ErrorBox, HelpBubble, ListSkeleton, PageHeader } from "@/components/dashboard/ui";
import RoleGuard from "@/components/team/RoleGuard";
import { useLoad } from "@/lib/dashboard/useLoad";
import { loadAudit } from "@/lib/team/api";
import { dateTime } from "@/lib/team/format";
import { ROLE_LABEL } from "@/lib/team/roles";
import type { AuditRow, Role } from "@/lib/team/types";

// Les noms exacts des actions viennent de la base (agent 1) : on les reconnaît par mots-clés, sinon on les affiche tels quels.
function describe(a: AuditRow): string {
  const x = a.action.toLowerCase();
  const role = (a.meta && typeof a.meta === "object" ? (a.meta as Record<string, unknown>).role ?? (a.meta as Record<string, unknown>).role_assigned : null) as Role | null;
  const r = role && ROLE_LABEL[role] ? ` (${ROLE_LABEL[role].toLowerCase()})` : "";
  if (/refus|reject/.test(x)) return "a refusé une demande";
  if (/valid|accept|approve/.test(x)) return `a validé une demande${r}`;
  if (/role/.test(x)) return `a changé un rôle${r}`;
  if (/suspend/.test(x)) return "a suspendu un membre";
  if (/retir|remove/.test(x)) return "a retiré un membre";
  if (/regenerat|invite|invit/.test(x)) return "a modifié l'invitation";
  return `a fait : ${a.action}`;
}

export default function Page() {
  return <RoleGuard allow={["patron", "gerant"]}><Journal /></RoleGuard>;
}
function Journal() {
  const { restaurant } = useRestaurant();
  const { data, loading, error, reload } = useLoad(() => (restaurant ? loadAudit(restaurant.id) : Promise.resolve({ rows: [], names: {} })), [restaurant?.id]);
  const rows = (data?.rows ?? []).filter((a) => /valid|accept|approve|refus|reject|role|suspend|retir|remove|invit|member|staff|equipe/i.test(a.action));
  return (
    <div>
      <PageHeader title="Journal de l'équipe" subtitle="Les décisions sensibles : qui a fait quoi, et quand." right={<Link href="/dashboard/equipe" className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold">← Équipe</Link>} />
      <HelpBubble id="equipe-journal" title="Un historique que personne ne peut effacer">Chaque validation, refus ou changement de rôle est noté ici. Utile en cas de doute ou de désaccord.</HelpBubble>
      {error ? <ErrorBox message={error} onRetry={reload} /> : loading && !data ? <ListSkeleton /> : rows.length === 0 ? (
        <EmptyState icon="📜" title="Rien à signaler pour l'instant" text="Dès que tu valideras une demande ou changeras un rôle, ça s'écrira ici." />
      ) : (
        <ol className="space-y-2">
          {rows.map((a) => (
            <li key={a.id} className="fade-in rounded-2xl border border-stone-200 bg-white p-3 text-sm">
              <p><strong>{(a.actor_id && data?.names[a.actor_id]) || "Un membre"}</strong> {describe(a)}{a.target && data?.names[a.target] ? <> : <strong>{data.names[a.target]}</strong></> : null}</p>
              <p className="text-xs text-stone-600">{dateTime(a.created_at)}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
