"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPublishedArticles } from "@/lib/aide/data";
import { isCacheFresh, saveArticles } from "@/lib/aide/offline";

/**
 * Enregistre les articles dans le telephone (une fois par jour, quand le navigateur est au repos)
 * et affiche un bandeau si le reseau tombe.
 */
export function OfflineSync() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  useEffect(() => {
    if (!navigator.onLine || isCacheFresh()) return;
    const run = async () => {
      const articles = await fetchPublishedArticles();
      if (articles.length > 0) saveArticles(articles);
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => void run());
    else window.setTimeout(() => void run(), 1500);
  }, []);

  if (online) return null;
  return (
    <div role="status" className="bg-amber-100 px-4 py-3 text-center text-sm text-amber-950">
      Vous êtes hors connexion.{" "}
      <Link href="/aide/hors-ligne" className="font-semibold underline underline-offset-2">
        Lire les guides déjà enregistrés
      </Link>
    </div>
  );
}
