import { mapsLink, safeUrl, waLink } from "@/lib/site/safe";
import type { SiteRestaurant } from "@/lib/site/types";

export default function Hero({ r, status }: { r: SiteRestaurant; status: { open: boolean; label: string } | null }) {
  const cover = safeUrl(r.cover_url), logo = safeUrl(r.logo_url);
  const wa = waLink(r.whatsapp ?? r.phone, `Bonjour ${r.name} !`);
  const btn = "inline-flex min-h-12 items-center justify-center rounded-2xl px-5 text-base font-semibold";
  return (
    <header className="r-rise">
      <div className="relative h-52 w-full overflow-hidden bg-[var(--brand)] sm:h-72">
        {cover && (/* eslint-disable-next-line @next/next/no-img-element */
          <img src={cover} alt="" className="h-full w-full object-cover" fetchPriority="high" decoding="async" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="mx-auto -mt-10 max-w-3xl px-4">
        <div className="flex items-end gap-3">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-[var(--brand)] text-2xl font-bold text-[var(--on-brand)] shadow">
            {logo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={logo} alt={`Logo ${r.name}`} className="h-full w-full object-cover" /> : r.name.slice(0, 1).toUpperCase()}
          </div>
          {status && (
            <span className={`mb-1 rounded-full px-3 py-1 text-sm font-medium ${status.open ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-700"}`}>{status.label}</span>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{r.name}</h1>
        {r.slogan && <p className="mt-1 text-[var(--brand-text)]">{r.slogan}</p>}
        <p className="mt-1 text-sm text-neutral-600">{[r.cuisine, r.address].filter(Boolean).join(" · ")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={mapsLink(r)} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[var(--brand)] text-[var(--on-brand)]`}>Y aller</a>
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className={`${btn} border-2 border-[var(--brand)] text-[var(--brand-text)]`}>Écrire sur WhatsApp</a>}
        </div>
      </div>
    </header>
  );
}
