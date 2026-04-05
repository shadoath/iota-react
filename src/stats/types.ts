/**
 * Game result and player stats types.
 * Stored in localStorage, designed to migrate to a database later.
 */

import type { GameMode, AIDifficulty } from "../types/game"

export interface GameResult {
  id: string
  date: string // ISO string
  mode: GameMode
  players: GameResultPlayer[]
  winner: string // player name
  totalTurns: number
  duration: number // seconds
}

export interface GameResultPlayer {
  name: string
  type: "human" | "ai"
  difficulty?: AIDifficulty
  score: number
  bestTurn: number
}

export interface PlayerStats {
  gamesPlayed: number
  gamesWon: number
  totalScore: number
  highScore: number
  bestSingleTurn: number
  totalTurns: number
  averageScore: number
  winRate: number
  currentStreak: number
  bestStreak: number
  byMode: Record<string, ModeStats>
  byDifficulty: Record<string, DifficultyStats>
  recentGames: GameResult[]
}

export interface ModeStats {
  played: number
  won: number
  totalScore: number
  highScore: number
}

export interface DifficultyStats {
  played: number
  won: number
}

export type AchievementId =
  // Beginner
  | "first_game"
  | "first_win"
  | "tutorial_complete"
  // Skill
  | "four_of_a_kind"
  | "century"
  | "perfect_line"
  | "high_roller"
  // Dedication
  | "ten_games"
  | "fifty_games"
  | "centurion"
  // Difficulty
  | "beat_easy"
  | "beat_medium"
  | "beat_hard"
  // Modes
  | "practice_player"
  | "speed_demon"
  | "multi_player"

export interface Achievement {
  id: AchievementId
  name: string
  description: string
  icon: string
  unlockedAt?: string // ISO string, undefined = locked
}
