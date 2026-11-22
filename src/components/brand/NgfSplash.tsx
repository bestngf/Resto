"use client";
import { useEffect } from "react";

type SplashWindow = Window & { ngfSplash?: (o?: { short?: boolean; onDone?: () => void }) => unknown; __ngfSplashDone?: boolean };

/** Écran de lancement NGF (voir public/ngf-splash.js). Complet à la première ouverture, court ensuite. Pas sur les liens partagés par un restaurant ni sur le suivi de commande. */
export default function NgfSplash() {
  useEffect(() => {
    const w = window as SplashWindow;
    if (w.__ngfSplashDone) return;
    if (/^\/(r|restaurant|suivi|commande\/suivi)(\/|$)/.test(window.location.pathname)) return;
    w.__ngfSplashDone = true;
    const s = document.createElement("script");
    s.src = "/ngf-splash.js";
    s.async = true;
    s.onload = () => { w.ngfSplash?.({}); };
    document.body.appendChild(s);
  }, []);
  return null;
}
