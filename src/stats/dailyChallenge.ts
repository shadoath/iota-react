/**
 * Daily challenge: same deck for everyone on the same day.
 * Scores stored in localStorage, keyed by date.
 */

import { createSeededRandom, dateSeed, getTodayString, seededShuffle } from "../utils/seededRandom"
import type { Card, CardNumber, CardColor, CardShape } from "../types/game"
import { CARD_NUMBERS, CARD_COLORS, CARD_SHAPES } from "../constants/game"

const STORAGE_KEY = "nodusnexus-daily"

export interface DailyResult {
  date: string
  score: number
  completed: boolean
}

export interface DailyHistory {
  results: DailyResult[]
  currentStreak: number
  bestStreak: number
}

/**
 * Generate the deterministic deck for a given date.
 */
export function getDailyDeck(dateStr: string = getTodayString()): Card[] {
  const seed = dateSeed(dateStr)
  const random = createSeededRandom(seed)

  const deck: Card[] = []
  let id = 0

  for (const number of CARD_NUMBERS) {
    for (const color of CARD_COLORS) {
      for (const shape of CARD_SHAPES) {
        deck.push({ id: `daily-${id++}`, number, color, shape })
      }
    }
  }

  // Add 2 wild cards
  deck.push({
    id: `daily-wild-1`,
    number: 0 as CardNumber,
    color: "wild" as CardColor,
    shape: "wild" as CardShape,
    isWild: true,
  } as Card)
  deck.push({
    id: `daily-wild-2`,
    number: 0 as CardNumber,
    color: "wild" as CardColor,
    shape: "wild" as CardShape,
    isWild: true,
  } as Card)

  return seededShuffle(deck, random)
}

/**
 * Check if today's challenge has been completed.
 */
export function hasTodayBeenPlayed(): boolean {
  const history = getHistory()
  const today = getTodayString()
  return history.results.some((r) => r.date === today && r.completed)
}

/**
 * Record a daily challenge result.
 */
export function recordDailyResult(score: number): void {
  if (typeof window === "undefined") return

  const history = getHistory()
  const today = getTodayString()

  // Don't overwrite a completed result
  const existing = history.results.find((r) => r.date === today)
  if (existing?.completed) return

  if (existing) {
    existing.score = score
    existing.completed = true
  } else {
    history.results.push({ date: today, score, completed: true })
  }

  // Recalculate streaks
  updateStreaks(history)

  // Keep last 60 days
  if (history.results.length > 60) {
    history.results = history.results.slice(-60)
  }

  saveHistory(history)
}

/**
 * Get the daily challenge history.
 */
export function getDailyHistory(): DailyHistory {
  return getHistory()
}

/**
 * Get today's best score (or null if not played).
 */
export function getTodayScore(): number | null {
  const history = getHistory()
  const today = getTodayString()
  const result = history.results.find((r) => r.date === today)
  return result?.completed ? result.score : null
}

// --- Internal ---

function getHistory(): DailyHistory {
  if (typeof window === "undefined") {
    return { results: [], currentStreak: 0, bestStreak: 0 }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { results: [], currentStreak: 0, bestStreak: 0 }
  } catch {
    return { results: [], currentStreak: 0, bestStreak: 0 }
  }
}

function saveHistory(history: DailyHistory): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

function updateStreaks(history: DailyHistory): void {
  // Sort by date descending
  const sorted = [...history.results]
    .filter((r) => r.completed)
    .sort((a, b) => b.date.localeCompare(a.date))

  let streak = 0
  const today = new Date()

  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)
    const expectedStr = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, "0")}-${String(expected.getDate()).padStart(2, "0")}`

    if (sorted[i].date === expectedStr) {
      streak++
    } else {
      break
    }
  }

  history.currentStreak = streak
  history.bestStreak = Math.max(history.bestStreak, streak)
}
