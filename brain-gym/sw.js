// Offline cache for Brain Gym. Bump CACHE when shipping new content —
// old caches are dropped on activate, so a deploy never serves a stale deck.
const CACHE = "brain-gym-v8";
const ASSETS = [
  "./",
  "./index.html",
  "./data.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./geist-latin.woff2",
  "./geist-latin-ext.woff2",
];

// `cache: "reload"` bypasses the browser's own HTTP cache. GitHub Pages serves
// HTML with a ten-minute max-age, so without this a fresh install can populate
// itself from the very copy it is meant to replace.
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first so a fresh deck lands as soon as you're online, with the
// cache as the offline fallback. Same-origin requests skip the HTTP cache for
// the same reason install does — otherwise "network-first" can still be served
// a ten-minute-old page and it looks like the deploy never happened.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const sameOrigin = new URL(e.request.url).origin === self.location.origin;
  const req = sameOrigin ? new Request(e.request, { cache: "reload" }) : e.request;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match("./index.html")))
  );
});
