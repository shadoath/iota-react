/**
 * Stats tracking service using localStorage.
 * All reads/writes go through this module for easy migration later.
 */

import type { GameResult, PlayerStats, ModeStats, DifficultyStats } from "./types"

const STORAGE_KEY = "nodusnexus-game-results"
const MAX_RECENT = 50

function getResults(): GameResult[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveResults(results: GameResult[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results.slice(-MAX_RECENT)))
}

export function recordGame(result: GameResult): void {
  const results = getResults()
  results.push(result)
  saveResults(results)
}

export function getPlayerStats(): PlayerStats {
  const results = getResults()

  const stats: PlayerStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    highScore: 0,
    bestSingleTurn: 0,
    totalTurns: 0,
    averageScore: 0,
    winRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    byMode: {},
    byDifficulty: {},
    recentGames: results.slice(-10).reverse(),
  }

  let streak = 0

  for (const result of results) {
    const human = result.players.find((p) => p.type === "human")
    if (!human) continue

    stats.gamesPlayed++
    stats.totalScore += human.score
    stats.totalTurns += result.totalTurns
    stats.highScore = Math.max(stats.highScore, human.score)
    stats.bestSingleTurn = Math.max(stats.bestSingleTurn, human.bestTurn)

    const won = result.winner === human.name
    if (won) {
      stats.gamesWon++
      streak++
      stats.bestStreak = Math.max(stats.bestStreak, streak)
    } else {
      streak = 0
    }

    // By mode
    const mode = result.mode || "classic"
    if (!stats.byMode[mode]) {
      stats.byMode[mode] = { played: 0, won: 0, totalScore: 0, highScore: 0 }
    }
    const modeStats = stats.byMode[mode]
    modeStats.played++
    if (won) modeStats.won++
    modeStats.totalScore += human.score
    modeStats.highScore = Math.max(modeStats.highScore, human.score)

    // By difficulty (highest AI difficulty in the game)
    const aiDifficulties = result.players
      .filter((p) => p.type === "ai" && p.difficulty)
      .map((p) => p.difficulty!)
    const hardestDiff = aiDifficulties.includes("hard")
      ? "hard"
      : aiDifficulties.includes("medium")
        ? "medium"
        : aiDifficulties.includes("easy")
          ? "easy"
          : null

    if (hardestDiff) {
      if (!stats.byDifficulty[hardestDiff]) {
        stats.byDifficulty[hardestDiff] = { played: 0, won: 0 }
      }
      stats.byDifficulty[hardestDiff].played++
      if (won) stats.byDifficulty[hardestDiff].won++
    }
  }

  stats.currentStreak = streak
  stats.averageScore = stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0
  stats.winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0

  return stats
}

export function clearStats(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}
