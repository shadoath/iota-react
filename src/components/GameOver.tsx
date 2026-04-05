import React from "react"
import type { Player, TurnRecord, PlacedCard } from "../types/game"
import styles from "./GameOver.module.css"

interface GameOverProps {
  players: Player[]
  turnHistory: TurnRecord[]
  initialBoard: PlacedCard[]
  onPlayAgain: () => void
  onNewSetup: () => void
  onReplay: () => void
}

export const GameOver: React.FC<GameOverProps> = ({
  players,
  turnHistory,
  initialBoard,
  onPlayAgain,
  onNewSetup,
  onReplay,
}) => {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const winnerScore = sorted[0]?.score ?? 0

  // Stats
  const totalTurns = turnHistory.length
  const bestTurn = turnHistory.reduce((max, t) => Math.max(max, t.score), 0)
  const humanPlayer = players.find((p) => p.type === "human")
  const humanTurns = turnHistory.filter((t) => t.playerId === humanPlayer?.id)
  const humanBestTurn = humanTurns.reduce((max, t) => Math.max(max, t.score), 0)
  const humanWon = humanPlayer?.score === winnerScore

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <h2 className={styles.title}>{humanWon ? "You Win!" : `${sorted[0]?.name} Wins!`}</h2>

        <div className={styles.scoreboard}>
          {sorted.map((player, index) => {
            const isWinner = player.score === winnerScore
            return (
              <div
                key={player.id}
                className={`${styles.playerRow} ${isWinner ? styles.winner : ""}`}
              >
                <span className={styles.rank}>
                  {index === 0 ? "1st" : index === 1 ? "2nd" : index === 2 ? "3rd" : "4th"}
                </span>
                <span className={styles.playerName}>
                  {player.name}
                  {player.type === "ai" && (
                    <span className={styles.playerType}>({player.difficulty})</span>
                  )}
                </span>
                <span className={styles.playerScore}>{player.score}</span>
              </div>
            )
          })}
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Total Turns</div>
            <div className={styles.statValue}>{totalTurns}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Best Turn</div>
            <div className={styles.statValue}>{bestTurn}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Your Best</div>
            <div className={styles.statValue}>{humanBestTurn}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Your Score</div>
            <div className={styles.statValue}>{humanPlayer?.score ?? 0}</div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.playAgainBtn} onClick={onPlayAgain}>
            Play Again
          </button>
          <button className={styles.setupBtn} onClick={onReplay}>
            Watch Replay
          </button>
          <button className={styles.setupBtn} onClick={onNewSetup}>
            Menu
          </button>
        </div>
      </div>
    </div>
  )
}
