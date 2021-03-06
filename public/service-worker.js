const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/assets/js/jquery-3.5.1.min.js",
  "/assets/js/chart.js",
  "/assets/js/foundation.min.js",
  "/assets/css/global/reset.css",
  "/assets/css/index.css",
  "/assets/css/app-foundation.css",
  "/assets/css/styles.css",
  "/assets/css/foundation.min.css",
  "/assets/css/font-awesome.min.css",
  "/dist/manifest.webmanifest",
  "/dist/app.bundle.js",
  "/assets/images/vacation-beach-anders-wideskott-unsplash-t.jpg",
];

const STATIC_CACHE = "mt-static-cache-v3";
const RUNTIME_CACHE = "mt-runtime-cache-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.

self.addEventListener("activate", (event) => {
  const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        // return array of cache names that are old to delete
        return cacheNames.filter(
          (i) => currentCaches.includes(i)
          );
        })
        .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // non GET requests are not cached and requests to other origins are not cached
  //
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // console.log(event.request.url);

  // handle runtime GET requests for data from /api routes
  if (event.request.url.includes("/api/transaction")) {
    // make network request and fallback to cache if network request fails (offline)
    event.respondWith(
      caches
        .open(RUNTIME_CACHE)
        .then(async (cache) => {
          try {
            const response = await fetch(event.request);
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          } catch (err) {
            // Network request failed, try to get it from the cache.
            return cache.match(event.request);
          }
        })
        .catch((err) => console.log(err))
    );

    return;
  }

  // use cache first for all other requests for performance
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // request is not in cache. make network request and cache the response
      return caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(event.request).then((response) => {
          return cache.put(event.request, response.clone()).then(() => {
            return response;
          });
        });
      });
    })
  );
});
