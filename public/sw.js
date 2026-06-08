const CACHE_VERSION = "mztk-pwa-v1";
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const APP_SHELL_URLS = ["/", "/index.html", "/manifest.webmanifest"];
const API_PREFIXES = [
  "/auth",
  "/users",
  "/api",
  "/locations",
  "/levels",
  "/marketplace",
  "/images",
  "/verification",
  "/posts",
  "/questions",
  "/comments",
  "/admin",
  "/v2",
  "/web3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

const isApiRequest = (url) =>
  API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));

const fetchNavigation = async (request) => {
  try {
    const response = await fetch(request);
    const cache = await caches.open(APP_SHELL_CACHE);
    cache.put("/index.html", response.clone());
    return response;
  } catch {
    return caches.match("/index.html");
  }
};

const fetchStaticAsset = async (request) => {
  const cached = await caches.match(request);
  const networkFetch = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkFetch;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(fetchNavigation(request));
    return;
  }

  if (isApiRequest(url)) return;

  if (
    ["style", "script", "worker", "image", "font", "manifest"].includes(
      request.destination
    )
  ) {
    event.respondWith(fetchStaticAsset(request));
  }
});
