"use client"

import { useState, useEffect, useCallback } from "react"
import { trackPwaInstallPrompted } from "../analytics/posthog"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function useInstallPrompt(): {
  canInstall: boolean
  promptInstall: () => void
} {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const promptInstall = useCallback(() => {
    if (!deferredPrompt) return
    trackPwaInstallPrompted()
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(() => {
      setDeferredPrompt(null)
    })
  }, [deferredPrompt])

  return { canInstall: deferredPrompt !== null, promptInstall }
}
