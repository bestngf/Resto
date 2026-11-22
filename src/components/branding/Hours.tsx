import { DAYS, hhmm } from "@/lib/site/hours";
import type { SiteHour } from "@/lib/site/types";

export default function Hours({ hours }: { hours: SiteHour[] }) {
  if (!hours.length) return <p className="text-sm text-neutral-600">Les horaires ne sont pas encore renseignés. Écris-nous sur WhatsApp pour savoir si nous sommes ouverts.</p>;
  const today = new Date().getUTCDay();
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200">
      {order.map((d) => {
        const rows = hours.filter((h) => h.weekday % 7 === d);
        const closed = !rows.length || rows.every((h) => h.closed);
        return (
          <li key={d} className={`flex justify-between px-4 py-3 text-sm ${d === today ? "bg-[var(--brand-soft)] font-semibold" : ""}`}>
            <span>{DAYS[d]}</span>
            <span>{closed ? "Fermé" : rows.filter((h) => !h.closed).map((h) => `${hhmm(h.opens)} – ${hhmm(h.closes)}`).join(" · ")}</span>
          </li>
        );
      })}
    </ul>
  );
}
