/// <reference lib="webworker" />

const CACHE_NAME = "api-studio-v2";
const OFFLINE_URL = "/sign-in";

// Assets to cache on install (excluding homepage and docs)
const STATIC_ASSETS = ["/sign-in", "/logo.png", "/thumbnail.png"];

// Routes to exclude from PWA caching (homepage and docs)
const EXCLUDED_ROUTES = ["/docs"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip API requests and external URLs
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/") || url.origin !== location.origin) {
    return;
  }

  // Skip homepage and docs - don't cache these for PWA
  if (
    url.pathname === "/" ||
    EXCLUDED_ROUTES.some((route) => url.pathname.startsWith(route))
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update in background
        event.waitUntil(
          fetch(event.request).then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response);
              });
            }
          }),
        );
        return cachedResponse;
      }

      // Network first, cache fallback
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          return new Response("Offline", { status: 503 });
        });
    }),
  );
});

export {};
