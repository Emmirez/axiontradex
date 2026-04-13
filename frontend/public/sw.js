const CACHE_NAME = "axiontrade-v3"; // bumped version to clear old caches

const urlsToCache = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // ✅ take control immediately without waiting for refresh
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // ✅ Skip API calls, chrome extensions, and non-GET requests
  if (
    event.request.method !== "GET" ||
    url.pathname.includes("/api/") ||
    url.protocol === "chrome-extension:"
  ) {
    return;
  }

  // ✅ Network first for HTML (always get fresh index.html)
  if (event.request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("/index.html")) // fallback to cached
    );
    return;
  }

  // ✅ Cache first for assets (js, css, images)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            // Only cache valid responses
            if (!response || response.status !== 200) return response;
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
          .catch(() => caches.match("/index.html")) // fallback for offline
      );
    })
  );
});