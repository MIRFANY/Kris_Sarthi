const CACHE_NAME = "krishi-saarthi-cache-v2";
const RUNTIME_CACHE = "krishi-saarthi-runtime-v2";
const API_CACHE = "krishi-saarthi-api-v2";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
  "/pic.jpg",
  "/favicon.ico"
];

// Install Service Worker and Cache Files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("✅ Service Worker installed - caching essential files");
      return cache.addAll(urlsToCache);
    }).catch(err => {
      console.error("❌ Cache install failed:", err);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate Service Worker (cleanup old caches)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      console.log("🧹 Cleaning old caches...");
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME && name !== RUNTIME_CACHE && name !== API_CACHE) {
            console.log("Deleting old cache:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control immediately
});

// Fetch Requests (intelligent caching strategy)
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // API requests (network-first, fallback to cache)
  if (url.pathname.includes("/api/") || url.pathname.includes("/generate-text")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses
          if (response && response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if offline
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              console.log("📦 Serving from cache (offline):", request.url);
              return cachedResponse;
            }
            // Return offline fallback
            return new Response(
              JSON.stringify({
                error: "Offline - Data not available",
                message: "You are offline. Some features may not work until you reconnect."
              }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" }
              }
            );
          });
        })
    );
    return;
  }

  // Static assets (cache-first)
  if (request.destination === "style" || request.destination === "script" || request.destination === "image") {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(response => {
          if (!response || response.status !== 200) {
            return response;
          }
          const clonedResponse = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, clonedResponse);
          });
          return response;
        });
      }).catch(() => {
        // Fallback for images
        if (request.destination === "image") {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50" fill="#999">Offline</text></svg>',
            { headers: { "Content-Type": "image/svg+xml" } }
          );
        }
      })
    );
    return;
  }

  // HTML pages (network-first)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (!response || response.status !== 200) {
            return response;
          }
          const clonedResponse = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then(response => {
            return response || caches.match("/index.html");
          });
        })
    );
    return;
  }

  // Default strategy (network-first)
  event.respondWith(
    fetch(request).then(response => {
      if (!response || response.status !== 200) {
        return response;
      }
      const clonedResponse = response.clone();
      caches.open(RUNTIME_CACHE).then(cache => {
        cache.put(request, clonedResponse);
      });
      return response;
    }).catch(() => {
      return caches.match(request);
    })
  );
});

// Handle messages from clients
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
