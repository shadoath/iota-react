"use client"

import React, { useState, useEffect, useRef } from "react"
import styles from "./GameLog.module.css"

export interface LogEntry {
  id: string
  message: string
  type: "success" | "error" | "info"
  turn?: number
}

interface GameLogProps {
  entries: LogEntry[]
}

export const GameLog: React.FC<GameLogProps> = ({ entries }) => {
  // Show last 12 entries
  const visible = entries.slice(-12)

  return (
    <div className={styles.log}>
      {visible.map((entry) => (
        <div
          key={entry.id}
          className={`${styles.entry} ${
            entry.type === "success"
              ? styles.entrySuccess
              : entry.type === "error"
                ? styles.entryError
                : styles.entryInfo
          }`}
        >
          {entry.turn !== undefined && <span className={styles.turnBadge}>T{entry.turn}</span>}
          {entry.message}
        </div>
      ))}
    </div>
  )
}

/** Celebration overlay shown when a lot (line of 4) is completed */
function CelebrationInner() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className={styles.celebration}>
      <div className={styles.celebrationText}>LOT! x2</div>
    </div>
  )
}

/** Remounts via key to trigger animation each time show changes to true */
export const LotCelebration: React.FC<{ show: boolean; triggerKey: number }> = ({
  show,
  triggerKey,
}) => {
  if (!show) return null
  return <CelebrationInner key={triggerKey} />
}

/** Keyboard shortcut legend */
export const KeyboardHints: React.FC = () => (
  <div className={styles.shortcuts}>
    <span className={styles.shortcut}>1-4 select</span>
    <span className={styles.shortcut}>Enter play</span>
    <span className={styles.shortcut}>U undo</span>
    <span className={styles.shortcut}>S swap</span>
    <span className={styles.shortcut}>Esc cancel</span>
  </div>
)
