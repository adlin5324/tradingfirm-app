self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
// Always load the newest app: skip the browser's copy of the page (GitHub Pages lets it keep one for 10 minutes).
self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") e.respondWith(fetch(e.request, {cache: "no-store"}).catch(() => fetch(e.request)));
});
