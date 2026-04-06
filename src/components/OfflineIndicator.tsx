"use client"

import React from "react"
import { useOnlineStatus } from "../hooks/useOnlineStatus"
import styles from "./OfflineIndicator.module.css"

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className={styles.banner} role="alert">
      You&apos;re offline &mdash; single-player modes are still available
    </div>
  )
}
