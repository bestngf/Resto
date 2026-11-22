import Link from "next/link";
import type { Restaurant } from "@/lib/types";
import { isOpenNow } from "@/lib/format";

export default function RestaurantCard({ r }: { r: Restaurant }) {
  const open = isOpenNow(r.resto_opening_hours);
  const modes = [r.accepts_dine_in && "Sur place", r.accepts_takeaway && "À emporter", r.accepts_delivery && "Livraison"].filter(Boolean).join(", ");
  return (
    <Link href={`/restaurant/${r.slug}`} className="block overflow-hidden rounded-2xl border border-[var(--r-line)] bg-[var(--r-card)]">
      <div className="h-32 w-full bg-[var(--r-line)]" style={r.primary_color ? { backgroundColor: r.primary_color } : undefined}>
        {r.cover_url && <img src={r.cover_url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />}
      </div>
      <div className="flex items-start gap-3 p-3">
        {r.logo_url && <img src={r.logo_url} alt="" loading="lazy" decoding="async" className="-mt-10 h-14 w-14 shrink-0 rounded-xl border-2 border-white bg-white object-cover" />}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{r.name}</h3>
          <p className="truncate text-sm text-[var(--r-muted)]">{[r.cuisine, r.address].filter(Boolean).join(" – ")}</p>
          {modes && <p className="mt-1 text-xs text-[var(--r-muted)]">{modes}</p>}
        </div>
        {open !== null && (
          <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${open ? "bg-[#d9f2e5] text-[#0b5a3d]" : "bg-[#eceeed] text-[var(--r-muted)]"}`}>
            {open ? "Ouvert" : "Fermé"}
          </span>
        )}
      </div>
    </Link>
  );
}
