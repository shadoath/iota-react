"use client"

import { useState, useEffect, useCallback } from "react"

export type CardTheme = "classic" | "neon" | "pastel" | "monochrome"
export type BoardTheme = "default" | "wood" | "felt" | "midnight"

export interface ThemeConfig {
  cardTheme: CardTheme
  boardTheme: BoardTheme
}

const STORAGE_KEY = "nodusnexus-card-theme"

const CARD_THEME_COLORS: Record<CardTheme, Record<string, string>> = {
  classic: {
    red: "#ef4444",
    green: "#22c55e",
    blue: "#3b82f6",
    yellow: "#eab308",
  },
  neon: {
    red: "#ff2d55",
    green: "#30d158",
    blue: "#0a84ff",
    yellow: "#ffd60a",
  },
  pastel: {
    red: "#f9a8b8",
    green: "#a8e6cf",
    blue: "#a8c8f9",
    yellow: "#f9e8a8",
  },
  monochrome: {
    red: "#e5e5e5",
    green: "#b0b0b0",
    blue: "#7a7a7a",
    yellow: "#4a4a4a",
  },
}

const BOARD_THEME_STYLES: Record<BoardTheme, { bg: string; surface: string }> = {
  default: { bg: "var(--color-board-bg)", surface: "transparent" },
  wood: { bg: "#c4a882", surface: "rgba(139, 90, 43, 0.1)" },
  felt: { bg: "#2d5a3d", surface: "rgba(255, 255, 255, 0.05)" },
  midnight: { bg: "#0f172a", surface: "rgba(255, 255, 255, 0.03)" },
}

function getStored(): ThemeConfig {
  if (typeof window === "undefined") return { cardTheme: "classic", boardTheme: "default" }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { cardTheme: "classic", boardTheme: "default" }
  } catch {
    return { cardTheme: "classic", boardTheme: "default" }
  }
}

export function useCardTheme() {
  const [config, setConfig] = useState<ThemeConfig>(getStored)

  useEffect(() => {
    applyCardTheme(config.cardTheme)
    applyBoardTheme(config.boardTheme)
  }, [config])

  const setCardTheme = useCallback((theme: CardTheme) => {
    setConfig((prev) => {
      const next = { ...prev, cardTheme: theme }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const setBoardTheme = useCallback((theme: BoardTheme) => {
    setConfig((prev) => {
      const next = { ...prev, boardTheme: theme }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return {
    cardTheme: config.cardTheme,
    boardTheme: config.boardTheme,
    cardColors: CARD_THEME_COLORS[config.cardTheme],
    boardStyles: BOARD_THEME_STYLES[config.boardTheme],
    setCardTheme,
    setBoardTheme,
  }
}

function applyCardTheme(theme: CardTheme) {
  const root = document.documentElement
  const colors = CARD_THEME_COLORS[theme]
  root.style.setProperty("--color-red", colors.red)
  root.style.setProperty("--color-green", colors.green)
  root.style.setProperty("--color-blue", colors.blue)
  root.style.setProperty("--color-yellow", colors.yellow)
}

function applyBoardTheme(theme: BoardTheme) {
  const root = document.documentElement
  const styles = BOARD_THEME_STYLES[theme]
  root.style.setProperty("--color-board-bg", styles.bg)
}

export const CARD_THEMES: Array<{ id: CardTheme; name: string }> = [
  { id: "classic", name: "Classic" },
  { id: "neon", name: "Neon" },
  { id: "pastel", name: "Pastel" },
  { id: "monochrome", name: "Mono" },
]

export const BOARD_THEMES: Array<{ id: BoardTheme; name: string }> = [
  { id: "default", name: "Default" },
  { id: "wood", name: "Wood" },
  { id: "felt", name: "Felt" },
  { id: "midnight", name: "Midnight" },
]
