"use client";

import { useCallback, useEffect, useState } from "react";
import { dismissedKey } from "@/lib/aide/tour";

/**
 * Memorise (dans le telephone) qu'un petit message a ete ferme.
 * `ready` reste faux tant que la lecture n'est pas faite, pour eviter un clignotement.
 */
export function useDismissed(id: string) {
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(dismissedKey(id)) === "1");
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, [id]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(dismissedKey(id), "1");
    } catch {
      /* stockage indisponible : le message reviendra, ce n'est pas grave */
    }
  }, [id]);

  return { visible: ready && !dismissed, dismiss };
}

/** Passe a vrai juste apres l'apparition, pour declencher une transition douce (opacite, glissement). */
export function useEntered(active: boolean) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!active) {
      setEntered(false);
      return;
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [active]);
  return entered;
}
