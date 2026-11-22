"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";
// Panier du site restaurant : enregistré sur le téléphone (fonctionne sans connexion).
export type CartLine = { id: string; name: string; price: number; qty: number };
const key = (slug: string) => `resto:cart:${slug}`;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const sub = (cb: () => void) => { listeners.add(cb); window.addEventListener("storage", cb); return () => { listeners.delete(cb); window.removeEventListener("storage", cb); }; };
const readRaw = (slug: string) => { try { return localStorage.getItem(key(slug)) ?? "[]"; } catch { return "[]"; } };
const parse = (raw: string): CartLine[] => { try { const v = JSON.parse(raw); return Array.isArray(v) ? v : []; } catch { return []; } };

export function useSiteCart(slug: string) {
  const raw = useSyncExternalStore(sub, () => readRaw(slug), () => "[]");
  const lines = useMemo(() => parse(raw), [raw]);
  const write = useCallback((next: CartLine[]) => { try { localStorage.setItem(key(slug), JSON.stringify(next)); } catch {} emit(); }, [slug]);
  const add = useCallback((it: Omit<CartLine, "qty">) => {
    const cur = parse(readRaw(slug)); const f = cur.find((l) => l.id === it.id);
    write(f ? cur.map((l) => (l.id === it.id ? { ...l, qty: Math.min(l.qty + 1, 50) } : l)) : [...cur, { ...it, qty: 1 }]);
  }, [slug, write]);
  const setQty = useCallback((id: string, qty: number) => write(parse(readRaw(slug)).map((l) => (l.id === id ? { ...l, qty } : l)).filter((l) => l.qty > 0)), [slug, write]);
  const clear = useCallback(() => write([]), [write]);
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  return { lines, add, setQty, clear, total, count };
}

// Table scannée par QR code, et dernière commande (récapitulatif affiché sans connexion).
export const saveTable = (slug: string, t: { id: string; label: string }) => { try { localStorage.setItem(`resto:table:${slug}`, JSON.stringify(t)); } catch {} };
export const loadTable = (slug: string): { id: string; label: string } | null => { try { return JSON.parse(localStorage.getItem(`resto:table:${slug}`) ?? "null"); } catch { return null; } };
export type LastOrder = { id: string; mode: string; lines: CartLine[]; total: number; fee: number; landmark?: string; at: string };
export const saveLastOrder = (o: LastOrder) => { try { localStorage.setItem(`resto:last:${o.id}`, JSON.stringify(o)); } catch {} };
export const loadLastOrder = (id: string): LastOrder | null => { try { return JSON.parse(localStorage.getItem(`resto:last:${id}`) ?? "null"); } catch { return null; } };
