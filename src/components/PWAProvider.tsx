"use client"

import React from "react"
import { OfflineIndicator } from "./OfflineIndicator"
import { UpdatePrompt } from "./UpdatePrompt"

export const PWAProvider: React.FC = () => {
  return (
    <>
      <OfflineIndicator />
      <UpdatePrompt />
    </>
  )
}
