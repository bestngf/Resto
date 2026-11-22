"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteCart } from "@/lib/site/cart";

export default function SiteNav({ slug, canOrder }: { slug: string; canOrder: boolean }) {
  const path = usePathname();
  const { count } = useSiteCart(slug);
  const base = `/r/${slug}`;
  const tabs = [
    { href: base, label: "Accueil", icon: "🏠" },
    { href: `${base}/menu`, label: "Menu", icon: "📖" },
    ...(canOrder ? [{ href: `${base}/commander`, label: "Commander", icon: "🛒" }] : []),
    { href: `${base}/reserver`, label: "Réserver", icon: "📅" },
  ];
  return (
    <nav aria-label="Navigation du restaurant" className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-3xl">
        {tabs.map((t) => {
          const on = t.href === base ? path === base : path.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link href={t.href} aria-current={on ? "page" : undefined} className={`relative flex min-h-14 flex-col items-center justify-center text-xs ${on ? "font-bold text-[var(--brand-text)]" : "text-neutral-600"}`}>
                <span aria-hidden className="text-lg">{t.icon}</span>{t.label}
                {t.label === "Commander" && count > 0 && <span className="absolute right-[22%] top-1 rounded-full bg-[var(--brand)] px-1.5 text-[10px] text-[var(--on-brand)]">{count}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
