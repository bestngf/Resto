"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCarts, cartCount } from "@/lib/cart/cart";

const items = [
  { href: "/commande", label: "Commander", d: "M3 4h2l2 12h11l2-8H6M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" },
  { href: "/reserver", label: "Réserver", d: "M7 3v3m10-3v3M4 8h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" },
  { href: "/carte", label: "Trouver", d: "M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
];

export default function BottomNav() {
  const path = usePathname();
  const carts = useCarts();
  const count = Object.values(carts).reduce((n, c) => n + cartCount(c), 0);
  return (
    <nav aria-label="Menu principal" className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--r-line)] bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-2xl">
        {items.map((it) => {
          const active = path.startsWith(it.href);
          return (
            <li key={it.href} className="flex-1">
              <Link href={it.href} aria-current={active ? "page" : undefined} className={`relative flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-medium ${active ? "text-[var(--r-brand)]" : "text-[var(--r-muted)]"}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={it.d} /></svg>
                {it.label}
                {it.href === "/commande" && count > 0 && (
                  <span className="absolute right-[28%] top-2 min-w-5 rounded-full bg-[var(--r-sun)] px-1 text-center text-xs font-bold text-[var(--r-ink)]">{count}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
