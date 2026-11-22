"use client";
import { useState } from "react";

export default function ShareBar({ url, name }: { url: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Découvre ${name} : ${url}`;
  const b = "inline-flex min-h-11 items-center rounded-xl border border-neutral-300 px-4 text-sm font-medium";
  async function share() {
    try {
      if (navigator.share) { await navigator.share({ title: name, url }); return; }
      await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch {}
  }
  return (
    <div className="flex flex-wrap gap-2">
      <a className={b} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(text)}`}>WhatsApp</a>
      <a className={b} target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>Facebook</a>
      <button type="button" className={b} onClick={share}>{copied ? "Lien copié ✓" : "Copier / partager"}</button>
    </div>
  );
}
