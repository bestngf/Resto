"use client";
import { useEffect } from "react";
// Enregistre le service worker (installation de l'application et page hors connexion). Sans effet en développement.
export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => { /* facultatif */ });
  }, []);
  return null;
}
