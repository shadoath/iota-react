export function registerServiceWorker(onUpdateAvailable: () => void): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
  if (window.location.hostname === "localhost") return

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            onUpdateAvailable()
          }
        })
      })
    } catch (err) {
      console.error("Service worker registration failed:", err)
    }
  })

  let refreshing = false
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true
      window.location.reload()
    }
  })
}

export function applyUpdate(): void {
  navigator.serviceWorker.getRegistration().then((reg) => {
    reg?.waiting?.postMessage({ type: "SKIP_WAITING" })
  })
}
