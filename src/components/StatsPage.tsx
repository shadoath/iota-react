"use client"

import React, { useMemo } from "react"
import { getPlayerStats } from "../stats/statsService"
import { getAchievements } from "../stats/achievements"
import styles from "./StatsPage.module.css"

interface StatsPageProps {
  onBack: () => void
}

export const StatsPage: React.FC<StatsPageProps> = ({ onBack }) => {
  const stats = useMemo(() => getPlayerStats(), [])
  const achievements = useMemo(() => getAchievements(), [])
  const unlocked = achievements.filter((a) => a.unlockedAt)
  const locked = achievements.filter((a) => !a.unlockedAt)

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  if (stats.gamesPlayed === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <button className={styles.backBtn} onClick={onBack}>
              &larr;
            </button>
            <h1 className={styles.title}>Stats</h1>
          </div>
          <div className={styles.noData}>
            No games played yet. Play a game to start tracking stats!
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onBack}>
            &larr;
          </button>
          <h1 className={styles.title}>Stats & Achievements</h1>
        </div>

        {/* Overview stats */}
        <div className={styles.statGrid}>
          <div className={`${styles.statCard} ${styles.statHighlight}`}>
            <div className={styles.statLabel}>Games Played</div>
            <div className={styles.statValue}>{stats.gamesPlayed}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statHighlight}`}>
            <div className={styles.statLabel}>Win Rate</div>
            <div className={styles.statValue}>{stats.winRate}%</div>
            <div className={styles.winRateBar}>
              <div className={styles.winRateFill} style={{ width: `${stats.winRate}%` }} />
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>High Score</div>
            <div className={styles.statValue}>{stats.highScore}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Avg Score</div>
            <div className={styles.statValue}>{stats.averageScore}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Best Turn</div>
            <div className={styles.statValue}>{stats.bestSingleTurn}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Win Streak</div>
            <div className={styles.statValue}>{stats.bestStreak}</div>
          </div>
        </div>

        {/* Achievements */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Achievements ({unlocked.length}/{achievements.length})
          </h2>
          <div className={styles.achievementGrid}>
            {unlocked.map((a) => (
              <div key={a.id} className={styles.achievement}>
                <span className={styles.achieveIcon}>{a.icon}</span>
                <div className={styles.achieveInfo}>
                  <div className={styles.achieveName}>{a.name}</div>
                  <div className={styles.achieveDesc}>{a.description}</div>
                  {a.unlockedAt && (
                    <div className={styles.achieveDate}>Unlocked {formatDate(a.unlockedAt)}</div>
                  )}
                </div>
              </div>
            ))}
            {locked.map((a) => (
              <div key={a.id} className={`${styles.achievement} ${styles.locked}`}>
                <span className={styles.achieveIcon}>{a.icon}</span>
                <div className={styles.achieveInfo}>
                  <div className={styles.achieveName}>{a.name}</div>
                  <div className={styles.achieveDesc}>{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent games */}
        {stats.recentGames.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Games</h2>
            <div className={styles.gameList}>
              {stats.recentGames.map((game) => {
                const human = game.players.find((p) => p.type === "human")
                const won = human?.name === game.winner
                return (
                  <div key={game.id} className={styles.gameRow}>
                    <span className={styles.gameMode}>{game.mode}</span>
                    <span
                      className={`${styles.gameResult} ${won ? styles.gameWin : styles.gameLoss}`}
                    >
                      {won ? "Won" : "Lost"}
                    </span>
                    <span className={styles.gameScore}>{human?.score ?? 0}</span>
                    <span className={styles.gameDate}>{formatDate(game.date)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
