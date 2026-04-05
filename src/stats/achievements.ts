/**
 * Achievement definitions and checking logic.
 */

import type { Achievement, AchievementId, GameResult, PlayerStats } from "./types"

const STORAGE_KEY = "nodusnexus-achievements"

// --- Achievement definitions ---

export const ACHIEVEMENTS: Achievement[] = [
  // Beginner
  {
    id: "first_game",
    name: "First Steps",
    description: "Complete your first game",
    icon: "\u{1F3AF}",
  },
  { id: "first_win", name: "Winner", description: "Win your first game", icon: "\u{1F3C6}" },
  {
    id: "tutorial_complete",
    name: "Student",
    description: "Complete the tutorial",
    icon: "\u{1F393}",
  },

  // Skill
  {
    id: "four_of_a_kind",
    name: "Four of a Kind",
    description: "Play all 4 cards in a single turn",
    icon: "\u{1F0CF}",
  },
  { id: "century", name: "Century", description: "Score 100+ in a single game", icon: "\u{1F4AF}" },
  {
    id: "perfect_line",
    name: "Perfect Line",
    description: "Score 16 in a single turn (4+4+4+4)",
    icon: "\u2B50",
  },
  {
    id: "high_roller",
    name: "High Roller",
    description: "Score 10+ in a single turn",
    icon: "\u{1F3B2}",
  },

  // Dedication
  { id: "ten_games", name: "Regular", description: "Play 10 games", icon: "\u{1F3AE}" },
  { id: "fifty_games", name: "Dedicated", description: "Play 50 games", icon: "\u{1F48E}" },
  { id: "centurion", name: "Centurion", description: "Play 100 games", icon: "\u{1F451}" },

  // Difficulty
  { id: "beat_easy", name: "Warming Up", description: "Beat an Easy AI", icon: "\u{1F331}" },
  { id: "beat_medium", name: "Contender", description: "Beat a Medium AI", icon: "\u26A1" },
  { id: "beat_hard", name: "Champion", description: "Beat a Hard AI", icon: "\u{1F525}" },

  // Modes
  {
    id: "practice_player",
    name: "Learner",
    description: "Complete a practice mode game",
    icon: "\u{1F4D6}",
  },
  { id: "speed_demon", name: "Speed Demon", description: "Win a timed mode game", icon: "\u23F1" },
  { id: "multi_player", name: "Social", description: "Play a multiplayer game", icon: "\u{1F310}" },
]

// --- Storage ---

function getUnlocked(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveUnlocked(unlocked: Record<string, string>): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
}

export function unlockAchievement(id: AchievementId): boolean {
  const unlocked = getUnlocked()
  if (unlocked[id]) return false // already unlocked
  unlocked[id] = new Date().toISOString()
  saveUnlocked(unlocked)
  return true // newly unlocked
}

export function getAchievements(): Achievement[] {
  const unlocked = getUnlocked()
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlockedAt: unlocked[a.id],
  }))
}

// --- Check achievements after a game ---

export function checkAchievements(result: GameResult, stats: PlayerStats): AchievementId[] {
  const newlyUnlocked: AchievementId[] = []

  function tryUnlock(id: AchievementId) {
    if (unlockAchievement(id)) {
      newlyUnlocked.push(id)
    }
  }

  const human = result.players.find((p) => p.type === "human")
  if (!human) return newlyUnlocked

  const won = result.winner === human.name

  // Beginner
  tryUnlock("first_game")
  if (won) tryUnlock("first_win")

  // Skill
  if (human.bestTurn >= 10) tryUnlock("high_roller")
  if (human.bestTurn >= 16) tryUnlock("perfect_line")
  if (human.score >= 100) tryUnlock("century")

  // We check four_of_a_kind via turn data — if bestTurn suggests it
  // (This is approximate; would need turn-level data for exact check)

  // Dedication
  if (stats.gamesPlayed >= 10) tryUnlock("ten_games")
  if (stats.gamesPlayed >= 50) tryUnlock("fifty_games")
  if (stats.gamesPlayed >= 100) tryUnlock("centurion")

  // Difficulty
  if (won) {
    const aiDifficulties = result.players
      .filter((p) => p.type === "ai" && p.difficulty)
      .map((p) => p.difficulty!)
    if (aiDifficulties.includes("easy")) tryUnlock("beat_easy")
    if (aiDifficulties.includes("medium")) tryUnlock("beat_medium")
    if (aiDifficulties.includes("hard")) tryUnlock("beat_hard")
  }

  // Modes
  if (result.mode === "practice") tryUnlock("practice_player")
  if (result.mode === "timed" && won) tryUnlock("speed_demon")

  return newlyUnlocked
}

export function unlockTutorialAchievement(): boolean {
  return unlockAchievement("tutorial_complete")
}
