import { ROLE_ICON, ROLE_LABEL } from "@/lib/team/roles";
import type { Role } from "@/lib/team/types";
const TONE: Record<Role, string> = {
  patron: "bg-amber-100 text-amber-950", gerant: "bg-indigo-100 text-indigo-950", serveur: "bg-emerald-100 text-emerald-950",
  cuisinier: "bg-orange-100 text-orange-950", caissier: "bg-sky-100 text-sky-950", livreur: "bg-rose-100 text-rose-950",
};
export default function RoleBadge({ role }: { role: Role }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[role]}`}><span aria-hidden>{ROLE_ICON[role]}</span>{ROLE_LABEL[role]}</span>;
}
