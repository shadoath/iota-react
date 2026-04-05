"use client"

import { useState, useEffect, useCallback } from "react"
import { registerServiceWorker, applyUpdate as swApplyUpdate } from "../sw/sw-registration"

export function useServiceWorker(): {
  updateAvailable: boolean
  applyUpdate: () => void
} {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    registerServiceWorker(() => setUpdateAvailable(true))
  }, [])

  const applyUpdate = useCallback(() => {
    swApplyUpdate()
  }, [])

  return { updateAvailable, applyUpdate }
}
