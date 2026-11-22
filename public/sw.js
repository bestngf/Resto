// Service worker simple (sans dépendance) : fichiers statiques en cache, pages réseau d'abord, page hors connexion de secours.
const VERSION = "resto-v1";
const SHELL = ["/hors-ligne.html", "/manifest.webmanifest", "/icons/icon-192.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== VERSION).map((x) => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // jamais de cache pour Supabase ni les paiements
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return r; })));
    return;
  }
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((r) => { if (r.ok && !url.pathname.startsWith("/dashboard") && !url.pathname.startsWith("/suivi")) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return r; })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("/hors-ligne.html"))));
  }
});
