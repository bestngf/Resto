"use client";
// File d'attente des changements de statut faits hors connexion.
// Rejoués dans l'ordre au retour du réseau. Aucune donnée personnelle n'y est stockée.
import { db } from "@/lib/dashboard/db";
import { isNetworkError } from "@/lib/dashboard/errors";

const KEY = "resto:queue:v1";
const EVT = "resto-queue";
export interface QueueItem { id: string; order: string; status: string; at: number }

function read(): QueueItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(items: QueueItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* stockage plein ou bloqué */ }
  window.dispatchEvent(new Event(EVT));
}

export const queueSize = () => read().length;
export function onQueueChange(cb: () => void) {
  window.addEventListener(EVT, cb);
  return () => window.removeEventListener(EVT, cb);
}
export function enqueue(order: string, status: string) {
  write([...read(), { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, order, status, at: Date.now() }]);
}

let flushing = false;
/** Envoie les changements gardés. S'arrête dès qu'il n'y a plus de réseau. */
export async function flushQueue(): Promise<{ sent: number; dropped: number; left: number }> {
  if (flushing) return { sent: 0, dropped: 0, left: queueSize() };
  flushing = true;
  let sent = 0, dropped = 0;
  try {
    let items = read();
    while (items.length) {
      const it = items[0];
      const { error } = await db().rpc("resto_set_order_status", { p_order: it.order, p_status: it.status });
      if (error && isNetworkError(error)) break;
      if (error) dropped++; else sent++; // erreur métier (déjà traité ailleurs) : on abandonne ce changement
      items = items.slice(1);
      write(items);
    }
  } catch (e) {
    if (!isNetworkError(e)) throw e;
  } finally {
    flushing = false;
  }
  return { sent, dropped, left: queueSize() };
}
