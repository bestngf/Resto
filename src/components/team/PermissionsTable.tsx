import { PERMISSIONS, ROLES, ROLE_ICON, ROLE_LABEL } from "@/lib/team/roles";

/** Tableau des permissions par rôle, lisible par le patron (✓ = oui, – = non, le texte reste lisible sans les couleurs). */
export default function PermissionsTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <table className="w-full min-w-[34rem] text-sm">
        <caption className="sr-only">Ce que chaque rôle peut faire</caption>
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50">
            <th scope="col" className="p-3 text-left font-semibold">Action</th>
            {ROLES.map((r) => <th key={r} scope="col" className="p-2 text-center text-xs font-semibold"><span aria-hidden>{ROLE_ICON[r]}</span><br />{ROLE_LABEL[r]}</th>)}
          </tr>
        </thead>
        <tbody>
          {PERMISSIONS.map((p) => (
            <tr key={p.label} className="border-b border-stone-100 last:border-0">
              <th scope="row" className="p-3 text-left font-medium">
                {p.label}
                {p.detail && <span className="block text-xs font-normal text-stone-600">{p.detail}</span>}
              </th>
              {ROLES.map((r) => {
                const ok = p.roles.includes(r);
                return <td key={r} className={`p-2 text-center font-bold ${ok ? "bg-emerald-50 text-emerald-800" : "text-stone-400"}`}><span aria-hidden>{ok ? "✓" : "–"}</span><span className="sr-only">{ok ? "Oui" : "Non"}</span></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
