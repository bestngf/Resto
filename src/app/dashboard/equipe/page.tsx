"use client";
import Link from "next/link";
import { useRestaurant } from "@/components/dashboard/RestaurantProvider";
import { EmptyState, ErrorBox, HelpBubble, ListSkeleton, PageHeader, useToast } from "@/components/dashboard/ui";
import InviteCard from "@/components/team/InviteCard";
import MemberRow from "@/components/team/MemberRow";
import PermissionsTable from "@/components/team/PermissionsTable";
import RequestCard from "@/components/team/RequestCard";
import RoleGuard from "@/components/team/RoleGuard";
import { useTeam } from "@/hooks/useTeam";
import { playRing } from "@/lib/orders/alert";
import "@/components/team/team.css";

export default function Page() {
  return <RoleGuard allow={["patron", "gerant"]}><Team /></RoleGuard>;
}

function Team() {
  const { restaurant, role, userId } = useRestaurant();
  const toast = useToast();
  const team = useTeam(restaurant?.id ?? null, () => { playRing(); toast.show("👥 Nouvelle demande pour rejoindre l'équipe"); });
  if (!restaurant) return null;
  const requests = team.data?.requests ?? [];
  const members = team.data?.members ?? [];
  const current = members.filter((m) => m.status !== "retire");
  const former = members.filter((m) => m.status === "retire");
  const activePatrons = members.filter((m) => m.role === "patron" && m.status === "actif").length;
  const first = team.loading && !team.data;

  return (
    <div>
      <PageHeader title="Mon équipe" subtitle="Invite ton personnel, valide chaque personne et choisis son rôle."
        right={<Link href="/dashboard/equipe/journal" className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold">📜 Journal</Link>} />
      <HelpBubble id="equipe" title="Bienvenue dans l'équipe !">
        Envoie le lien d&apos;invitation à tes serveurs, cuisiniers et caissiers. Quand quelqu&apos;un le demande, tu le vois ici avec un son : un toucher et il est validé. Tant que tu n&apos;as pas validé, la personne n&apos;a accès à rien.
      </HelpBubble>

      <div className="space-y-6">
        <InviteCard restaurantId={restaurant.id} restaurantName={restaurant.name} notify={toast.show} />

        <section aria-labelledby="h-req">
          <h2 id="h-req" className="mb-2 text-lg font-bold">Demandes à traiter {requests.length > 0 && <span className="ml-1 rounded-full bg-red-700 px-2 py-0.5 text-sm text-white">{requests.length}</span>}</h2>
          {team.error && !team.data ? <ErrorBox message={team.error} onRetry={team.reload} /> : first ? <ListSkeleton rows={1} /> : requests.length === 0 ? (
            <EmptyState icon="📭" title="Aucune demande pour le moment" text="Partage le lien ou le QR code ci-dessus : les nouvelles demandes apparaîtront ici toutes seules." />
          ) : (
            <ul className="space-y-3">{requests.map((r) => <RequestCard key={r.id} req={r} actorRole={role} notify={toast.show} onDone={team.reload} />)}</ul>
          )}
        </section>

        <section aria-labelledby="h-team">
          <h2 id="h-team" className="mb-2 text-lg font-bold">L&apos;équipe ({current.length})</h2>
          {first ? <ListSkeleton rows={2} /> : current.length === 0 ? (
            <EmptyState icon="👥" title="Personne dans l'équipe pour l'instant" text="Invite ton premier collaborateur avec le lien ci-dessus." />
          ) : (
            <ul className="space-y-2">{current.map((m) => <MemberRow key={m.id} m={m} actorRole={role} myUserId={userId} activePatrons={activePatrons} notify={toast.show} onDone={team.reload} />)}</ul>
          )}
          {former.length > 0 && (
            <details className="mt-3 rounded-2xl border border-stone-200 bg-white p-3">
              <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">Anciens membres ({former.length})</summary>
              <ul className="mt-2 space-y-2">{former.map((m) => <MemberRow key={m.id} m={m} actorRole={role} myUserId={userId} activePatrons={activePatrons} notify={toast.show} onDone={team.reload} />)}</ul>
            </details>
          )}
        </section>

        <section aria-labelledby="h-perm">
          <h2 id="h-perm" className="mb-1 text-lg font-bold">Qui peut faire quoi ?</h2>
          <p className="mb-2 text-sm text-stone-600">Les droits de chaque rôle. Fais défiler le tableau sur petit écran.</p>
          <PermissionsTable />
        </section>
      </div>
      {toast.node}
    </div>
  );
}
