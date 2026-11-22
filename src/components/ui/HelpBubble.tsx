"use client";
import { useEffect, useState } from "react";

// Petit mot d'accueil ou bulle d'aide, fermable définitivement.
export default function HelpBubble({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const key = `resto:help:${id}`;
  useEffect(() => {
    try { setVisible(localStorage.getItem(key) !== "1"); } catch { setVisible(true); }
  }, [key]);
  if (!visible) return null;
  return (
    <section role="note" className="r-pop mb-4 rounded-2xl border border-[var(--r-line)] bg-white p-4">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-1 text-sm text-[var(--r-muted)]">{children}</div>
      <button
        type="button"
        onClick={() => { try { localStorage.setItem(key, "1"); } catch {} setVisible(false); }}
        className="mt-3 min-h-11 rounded-xl bg-[var(--r-brand)] px-4 text-sm font-semibold text-[var(--r-brand-ink)]"
      >
        Compris, ne plus afficher
      </button>
    </section>
  );
}
