import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching"
import { registerRoute, NavigationRoute } from "workbox-routing"
import { CacheFirst, NetworkFirst, NetworkOnly } from "workbox-strategies"
import { CacheableResponsePlugin } from "workbox-cacheable-response"
import { ExpirationPlugin } from "workbox-expiration"

// Injected by workbox-build at build time
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Cache Next.js static assets (content-hashed, immutable)
registerRoute(
  ({ url }) => url.pathname.startsWith("/_next/static/"),
  new CacheFirst({
    cacheName: "next-static",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
)

// Cache static assets (icons, manifest, etc.)
registerRoute(
  ({ url }) =>
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json" ||
    url.pathname === "/favicon.ico",
  new CacheFirst({
    cacheName: "static-assets",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
)

// Network-only for Socket.io and API routes
registerRoute(
  ({ url }) =>
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/socket.io/"),
  new NetworkOnly()
)

// Navigation requests: NetworkFirst with offline fallback
const navigationHandler = new NetworkFirst({
  cacheName: "navigation",
  networkTimeoutSeconds: 3,
  plugins: [
    new CacheableResponsePlugin({ statuses: [0, 200] }),
  ],
})

const navigationRoute = new NavigationRoute(navigationHandler, {
  denylist: [/^\/_next\//, /\/api\//],
})

// Override the handler to provide offline fallback
const originalHandler = navigationRoute.handler
navigationRoute.handler = async (params) => {
  try {
    return await originalHandler.handle(params)
  } catch {
    const cache = await caches.open("precache")
    const fallback = await cache.match("/offline.html")
    if (fallback) return fallback
    // Try the precache with the workbox revision key
    const keys = await cache.keys()
    const offlineKey = keys.find((k) => k.url.includes("offline.html"))
    if (offlineKey) return cache.match(offlineKey)
    return new Response("Offline", { status: 503 })
  }
}

registerRoute(navigationRoute)

// Listen for skip waiting message from the client
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// Take control immediately on activation
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})
