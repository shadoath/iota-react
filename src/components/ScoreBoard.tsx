import React from "react"
import type { Player } from "../types/game"
import { PLAYER_COLORS } from "../constants/game"
import styles from "./ScoreBoard.module.css"

interface ScoreBoardProps {
  players: Player[]
  currentPlayerIndex: number
  pendingPoints: number
  isAIThinking: boolean
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  currentPlayerIndex,
  pendingPoints,
  isAIThinking,
}) => {
  return (
    <div className={styles.scoreboard}>
      {players.map((player, index) => {
        const isActive = index === currentPlayerIndex
        return (
          <div
            key={player.id}
            className={`${styles.playerTab} ${isActive ? styles.active : ""}`}
            style={{ borderTop: `3px solid ${PLAYER_COLORS[index % PLAYER_COLORS.length]}` }}
          >
            <span className={styles.playerTabName}>{player.name}</span>
            <span className={styles.playerTabScore}>{player.score}</span>
            {isActive && pendingPoints > 0 && player.type === "human" && (
              <span className={styles.pendingScore}>+{pendingPoints}</span>
            )}
            {isActive && isAIThinking && player.type === "ai" && (
              <span className={styles.thinking}>thinking...</span>
            )}
            {player.type === "ai" && (
              <span className={styles.aiIndicator}>{player.difficulty}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
