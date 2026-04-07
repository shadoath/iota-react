"use client"

import { useState, useCallback } from "react"

export interface HelpersConfig {
  setCompletion: boolean // Highlight cards that can complete a line of 4
  bestMove: boolean // Star on the highest-scoring position
  attributeGuide: boolean // Show what attributes are needed at valid positions
  showCardValidMoves: boolean // Only highlight positions where selected card can actually be placed
}

const STORAGE_KEY = "nodusnexus-helpers"

const DEFAULTS: HelpersConfig = {
  setCompletion: false,
  bestMove: false,
  attributeGuide: false,
  showCardValidMoves: false,
}

function getStored(): HelpersConfig {
  if (typeof window === "undefined") return DEFAULTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export function useHelpers() {
  const [config, setConfig] = useState<HelpersConfig>(getStored)

  const toggleHelper = useCallback((key: keyof HelpersConfig) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const setHelper = useCallback((key: keyof HelpersConfig, value: boolean) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { helpers: config, toggleHelper, setHelper }
}
