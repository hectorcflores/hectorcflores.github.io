// Self-destruct worker for the retired Brain Gym path.
//
// This replaces a network-first worker, so any online open fetches these
// bytes instead of serving from cache — which is what lets an installed
// home-screen icon at this scope find its way to My Anki on its own. It has
// no fetch handler at all: every request falls through to the network, where
// index.html next to this file redirects.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    // ONLY this app's caches. Cache Storage is shared across the whole of
    // hectorcflores.github.io, so a blanket caches.keys() sweep here would
    // delete the live My Anki cache sitting on the same origin — and, on a
    // home-screen container, do it at exactly the moment the user is being
    // handed over to it.
    for (const key of await caches.keys()) {
      if (key.startsWith("brain-gym-")) await caches.delete(key);
    }
    // Nothing below this point should keep serving the old app.
    await self.registration.unregister();
    // Push any window still sitting on the old path over to the new one.
    // Storage is untouched on purpose: the old localStorage keys are what My
    // Anki copies its review history from on first load.
    for (const client of await self.clients.matchAll({ type: "window" })) {
      client.navigate("https://hectorcflores.github.io/my-anki/app/").catch(() => {});
    }
  })());
});
