/// <reference lib="webworker" />

const CACHE_NAME = "api-studio-v3";
const OFFLINE_URL = "/sign-in";

// App shell — pre-cached on install so the app opens instantly offline
const STATIC_ASSETS = [
  "/sign-in",
  "/workspace",
  "/logo.png",
  "/thumbnail.png",
  "/manifest.json",
  "/manifest.webmanifest",
];

// Routes to exclude from caching (public marketing / docs pages)
const EXCLUDED_ROUTES = ["/docs"];

// -----------------------------------------------------------------------
// Install — pre-cache the app shell
// -----------------------------------------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// -----------------------------------------------------------------------
// Activate — remove old caches + claim all clients immediately
// -----------------------------------------------------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// -----------------------------------------------------------------------
// Message — support SKIP_WAITING from update prompt in the app
// -----------------------------------------------------------------------
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// -----------------------------------------------------------------------
// Fetch — tiered caching strategy
// -----------------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  // Always pass-through non-GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Pass-through: localhost — always let local server requests through
  const host = url.hostname;
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".localhost")
  ) {
    return;
  }

  // Pass-through: API calls — never cache proxy or auth responses
  if (url.pathname.startsWith("/api/")) return;

  // Pass-through: external URLs
  if (url.origin !== location.origin) return;

  // Pass-through: excluded routes (homepage, docs)
  if (
    url.pathname === "/" ||
    EXCLUDED_ROUTES.some((route) => url.pathname.startsWith(route))
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Stale-while-revalidate for shell assets (instant load + background refresh)
      if (cached) {
        event.waitUntil(
          fetch(event.request)
            .then((fresh) => {
              if (fresh.ok) {
                caches
                  .open(CACHE_NAME)
                  .then((cache) => cache.put(event.request, fresh));
              }
            })
            .catch(() => {
              /* offline — cached copy is fine */
            }),
        );
        return cached;
      }

      // Network-first for uncached resources; fallback to offline page on nav
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          return new Response("Offline", { status: 503 });
        });
    }),
  );
});

export {};
