"use client";
// Sonnerie des commandes : sons générés par le navigateur (aucun fichier, libre de droits, gratuit).
// Les navigateurs bloquent le son tant que l'utilisateur n'a pas touché l'écran :
// le bouton « Démarrer le service » sert à le débloquer.

type WakeLockSentinelLike = { release: () => Promise<void> };

let ctx: AudioContext | null = null;
let wake: WakeLockSentinelLike | null = null;
let lastRing = 0;
let visibilityBound = false;

async function requestWake() {
  try {
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinelLike> } };
    if (nav.wakeLock && document.visibilityState === "visible") wake = await nav.wakeLock.request("screen");
  } catch { /* non supporté : on continue sans */ }
}

export async function startService(): Promise<boolean> {
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ctx) ctx = new Ctor();
    await ctx.resume();
    playTone(660, 0, 0.12, 0.05); // petit « clic » de confirmation
  } catch { /* son indisponible */ }
  await requestWake();
  if (!visibilityBound) {
    visibilityBound = true;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && ctx) { ctx.resume().catch(() => {}); requestWake(); }
    });
  }
  return isAudioReady();
}

export function stopService() {
  wake?.release().catch(() => {});
  wake = null;
  ctx?.close().catch(() => {});
  ctx = null;
}

export const isAudioReady = () => ctx?.state === "running";

function playTone(freq: number, start: number, dur: number, vol = 0.35) {
  if (!ctx) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Joue la sonnerie (deux notes x3). Retourne false si le son est bloqué. */
export function playRing(): boolean {
  const now = Date.now();
  if (now - lastRing < 2500) return isAudioReady(); // évite les doubles sonneries
  lastRing = now;
  try { navigator.vibrate?.([300, 150, 300]); } catch { /* ignoré */ }
  if (!ctx || ctx.state !== "running") return false;
  for (let i = 0; i < 3; i++) {
    playTone(880, i * 0.6, 0.25);
    playTone(1175, i * 0.6 + 0.25, 0.3);
  }
  return true;
}
