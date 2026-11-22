"use client";
import { useEffect, useState } from "react";

/** Petit mot d'accueil fermable + lien « Besoin d'aide ? » toujours visible. */
export default function HelpHint({ id, text, helpTopic }: { id: string; text: string; helpTopic: string }) {
  const [show, setShow] = useState(false);
  const k = `resto:hint:${id}`;
  useEffect(() => { try { setShow(localStorage.getItem(k) !== "1"); } catch { setShow(true); } }, [k]);
  return (
    <div className="mb-4">
      {show && (
        <div role="note" className="r-rise rounded-2xl bg-[var(--brand-soft)] p-4 text-sm">
          <p>{text}</p>
          <button type="button" className="mt-2 min-h-11 font-semibold text-[var(--brand-text)]" onClick={() => { try { localStorage.setItem(k, "1"); } catch {} setShow(false); }}>
            Compris, ne plus afficher
          </button>
        </div>
      )}
      <a href={`/aide?page=${encodeURIComponent(helpTopic)}`} className="mt-1 inline-block min-h-11 py-2 text-sm text-neutral-600 underline">Besoin d&apos;aide ?</a>
    </div>
  );
}
