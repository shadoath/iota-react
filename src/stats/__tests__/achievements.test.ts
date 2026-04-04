import { describe, it, expect, beforeEach } from 'vitest'
import { checkAchievements, getAchievements, unlockAchievement, ACHIEVEMENTS } from '../achievements'
import type { GameResult, PlayerStats } from '../types'

// Mock localStorage
const store: Record<string, string> = {}
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k])
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value },
      removeItem: (key: string) => { delete store[key] },
    },
    writable: true,
  })
})

function makeResult(overrides: Partial<GameResult> = {}): GameResult {
  return {
    id: 'test-1',
    date: new Date().toISOString(),
    mode: 'classic',
    players: [
      { name: 'You', type: 'human', score: 42, bestTurn: 8 },
      { name: 'Dot', type: 'ai', difficulty: 'medium', score: 35, bestTurn: 6 },
    ],
    winner: 'You',
    totalTurns: 20,
    duration: 300,
    ...overrides,
  }
}

function makeStats(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return {
    gamesPlayed: 1,
    gamesWon: 1,
    totalScore: 42,
    highScore: 42,
    bestSingleTurn: 8,
    totalTurns: 20,
    averageScore: 42,
    winRate: 100,
    currentStreak: 1,
    bestStreak: 1,
    byMode: {},
    byDifficulty: {},
    recentGames: [],
    ...overrides,
  }
}

describe('achievements', () => {
  it('has all defined achievements', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(15)
  })

  it('unlocks first_game on any game completion', () => {
    const result = makeResult()
    const stats = makeStats()
    const unlocked = checkAchievements(result, stats)
    expect(unlocked).toContain('first_game')
  })

  it('unlocks first_win when player wins', () => {
    const result = makeResult({ winner: 'You' })
    const stats = makeStats()
    const unlocked = checkAchievements(result, stats)
    expect(unlocked).toContain('first_win')
  })

  it('does not unlock first_win when player loses', () => {
    const result = makeResult({ winner: 'Dot' })
    const stats = makeStats()
    const unlocked = checkAchievements(result, stats)
    expect(unlocked).not.toContain('first_win')
  })

  it('unlocks century for 100+ score', () => {
    const result = makeResult({
      players: [
        { name: 'You', type: 'human', score: 105, bestTurn: 12 },
        { name: 'Dot', type: 'ai', difficulty: 'easy', score: 50, bestTurn: 8 },
      ],
    })
    const stats = makeStats()
    const unlocked = checkAchievements(result, stats)
    expect(unlocked).toContain('century')
  })

  it('unlocks beat_hard when winning against hard AI', () => {
    const result = makeResult({
      players: [
        { name: 'You', type: 'human', score: 60, bestTurn: 10 },
        { name: 'Dot', type: 'ai', difficulty: 'hard', score: 50, bestTurn: 8 },
      ],
      winner: 'You',
    })
    const stats = makeStats()
    const unlocked = checkAchievements(result, stats)
    expect(unlocked).toContain('beat_hard')
  })

  it('unlocks ten_games after 10 games', () => {
    const result = makeResult()
    const stats = makeStats({ gamesPlayed: 10 })
    const unlocked = checkAchievements(result, stats)
    expect(unlocked).toContain('ten_games')
  })

  it('does not double-unlock achievements', () => {
    const result = makeResult()
    const stats = makeStats()
    checkAchievements(result, stats)
    const second = checkAchievements(result, stats)
    expect(second).not.toContain('first_game') // already unlocked
  })

  it('getAchievements returns all with unlock status', () => {
    unlockAchievement('first_game')
    const all = getAchievements()
    const firstGame = all.find(a => a.id === 'first_game')
    expect(firstGame?.unlockedAt).toBeDefined()
    const firstWin = all.find(a => a.id === 'first_win')
    expect(firstWin?.unlockedAt).toBeUndefined()
  })
})
