"use client"

import React from "react"
import { useServiceWorker } from "../hooks/useServiceWorker"
import styles from "./UpdatePrompt.module.css"

export const UpdatePrompt: React.FC = () => {
  const { updateAvailable, applyUpdate } = useServiceWorker()

  if (!updateAvailable) return null

  return (
    <div className={styles.banner} role="alert">
      <span>A new version is available</span>
      <button className={styles.refreshBtn} onClick={applyUpdate}>
        Refresh
      </button>
    </div>
  )
}
