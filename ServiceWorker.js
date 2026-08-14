const cacheName = "DefaultCompany-AR for Web Project-0.1.0";
const contentToCache = [
    "Build/AR for Web 2026.loader.js",
    "Build/AR for Web 2026.framework.js.unityweb",
    "Build/AR for Web 2026.data.unityweb",
    "Build/AR for Web 2026.wasm.unityweb",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    // Take over from any previously-active worker as soon as this one finishes
    // installing, rather than waiting for every open tab to fully close first -
    // otherwise a returning visitor can stay pinned to the OLD worker (and its old
    // cache) for the whole session even after a new build has shipped.
    self.skipWaiting();

    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('activate', function (e) {
    e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      // Network-first: always prefer a fresh copy so returning visitors get
      // bug fixes/updates automatically. The cache is only a fallback for when
      // there's no connection, not the primary source.
      try {
        const response = await fetch(e.request);
        const cache = await caches.open(cacheName);
        cache.put(e.request, response.clone());
        return response;
      } catch (err) {
        console.log(`[Service Worker] Network fetch failed, trying cache: ${e.request.url}`);
        const cached = await caches.match(e.request);
        if (cached) { return cached; }
        throw err;
      }
    })());
});
