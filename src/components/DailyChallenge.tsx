"use client"

import React, { useMemo } from "react"
import { getTodayString } from "../utils/seededRandom"
import {
  getDailyDeck,
  hasTodayBeenPlayed,
  getDailyHistory,
  getTodayScore,
} from "../stats/dailyChallenge"
import type { GameSettings } from "../types/game"
import styles from "./DailyChallenge.module.css"

interface DailyChallengeProps {
  onStart: (settings: GameSettings) => void
  onBack: () => void
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({ onStart, onBack }) => {
  const today = getTodayString()
  const played = hasTodayBeenPlayed()
  const todayScore = getTodayScore()
  const history = useMemo(() => getDailyHistory(), [])

  const handleStart = () => {
    const deck = getDailyDeck(today)
    onStart({
      playerCount: 2,
      aiPlayers: [{ name: "Daily Bot", difficulty: "hard" }],
      mode: "daily",
      prebuiltDeck: deck,
    })
  }

  const recentResults = [...history.results]
    .filter((r) => r.completed)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Daily Challenge</h1>
        <span className={styles.date}>{today}</span>

        <div className={styles.divider} />

        <div className={styles.streakRow}>
          <div className={styles.streakItem}>
            <span className={styles.streakValue}>{history.currentStreak}</span>
            <span className={styles.streakLabel}>Streak</span>
          </div>
          <div className={styles.streakItem}>
            <span className={styles.streakValue}>{history.bestStreak}</span>
            <span className={styles.streakLabel}>Best</span>
          </div>
          <div className={styles.streakItem}>
            <span className={styles.streakValue}>
              {history.results.filter((r) => r.completed).length}
            </span>
            <span className={styles.streakLabel}>Played</span>
          </div>
        </div>

        {played ? (
          <>
            <div className={styles.completedBadge}>Completed Today!</div>
            <div className={styles.scoreDisplay}>Score: {todayScore}</div>
          </>
        ) : (
          <button className={styles.playBtn} onClick={handleStart}>
            Play Today&apos;s Challenge
          </button>
        )}

        {recentResults.length > 0 && (
          <>
            <div className={styles.divider} />
            <div className={styles.recentList}>
              {recentResults.map((r) => (
                <div key={r.date} className={styles.recentItem}>
                  <span>{r.date}</span>
                  <span className={styles.recentScore}>{r.score}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <button className={styles.backBtn} onClick={onBack}>
          Back to Menu
        </button>
      </div>
    </div>
  )
}
