import React, { useState } from "react"
import type { AIDifficulty, GameMode, GameSettings, CustomGameConfig } from "../types/game"
import { DEFAULT_CUSTOM_CONFIG } from "../types/game"
import { AdvancedSetup } from "./AdvancedSetup"
import styles from "./GameSetup.module.css"

const AI_NAMES = ["Dot", "Dash", "Pixel", "Byte", "Chip", "Nova"]

interface AIPlayerConfig {
  name: string
  difficulty: AIDifficulty
}

interface GameSetupProps {
  mode: GameMode
  onStartGame: (settings: GameSettings) => void
  onBack: () => void
}

const TIMED_OPTIONS = [
  { label: "15s", value: 15 },
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
]

export const GameSetup: React.FC<GameSetupProps> = ({ mode, onStartGame, onBack }) => {
  const [aiPlayers, setAiPlayers] = useState<AIPlayerConfig[]>([
    { name: AI_NAMES[0], difficulty: mode === "practice" ? "easy" : "medium" },
  ])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customConfig, setCustomConfig] = useState<CustomGameConfig>(DEFAULT_CUSTOM_CONFIG)
  const [turnTimeLimit, setTurnTimeLimit] = useState(30)

  const addAI = () => {
    if (aiPlayers.length >= 3) return
    const nextName = AI_NAMES[aiPlayers.length] || `AI ${aiPlayers.length + 1}`
    setAiPlayers([...aiPlayers, { name: nextName, difficulty: "medium" }])
  }

  const removeAI = (index: number) => {
    setAiPlayers(aiPlayers.filter((_, i) => i !== index))
  }

  const updateName = (index: number, name: string) => {
    setAiPlayers(aiPlayers.map((p, i) => (i === index ? { ...p, name } : p)))
  }

  const updateDifficulty = (index: number, difficulty: AIDifficulty) => {
    setAiPlayers(aiPlayers.map((p, i) => (i === index ? { ...p, difficulty } : p)))
  }

  const handleStart = () => {
    onStartGame({
      playerCount: 1 + aiPlayers.length,
      aiPlayers,
      mode,
      turnTimeLimit: mode === "timed" ? turnTimeLimit : undefined,
      hintsEnabled: mode === "practice",
      customConfig: showAdvanced ? customConfig : undefined,
    })
  }

  const getDiffClass = (diff: AIDifficulty) => {
    switch (diff) {
      case "easy":
        return styles.diffEasy
      case "medium":
        return styles.diffMedium
      case "hard":
        return styles.diffHard
    }
  }

  const modeLabel =
    mode === "classic" ? "Classic Game" : mode === "practice" ? "Practice Mode" : "Timed Mode"

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            className={styles.removeBtn}
            onClick={onBack}
            style={{ border: "1px solid #ddd", color: "#666" }}
          >
            &larr;
          </button>
          <h1 className={styles.title} style={{ flex: 1, textAlign: "center", marginRight: 28 }}>
            {modeLabel}
          </h1>
        </div>

        {mode === "practice" && (
          <p className={styles.subtitle}>
            Hints enabled — valid positions always shown with score previews
          </p>
        )}

        <div className={styles.divider} />

        <div className={styles.section}>
          <span className={styles.label}>Opponents</span>

          {aiPlayers.map((ai, index) => (
            <div key={index} className={styles.aiRow}>
              <input
                className={styles.aiNameInput}
                value={ai.name}
                onChange={(e) => updateName(index, e.target.value)}
                maxLength={12}
                aria-label={`Name for opponent ${index + 1}`}
              />
              <span className={`${styles.diffBadge} ${getDiffClass(ai.difficulty)}`}>
                {ai.difficulty}
              </span>
              <select
                className={styles.difficultySelect}
                value={ai.difficulty}
                onChange={(e) => updateDifficulty(index, e.target.value as AIDifficulty)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              {aiPlayers.length > 1 && (
                <button
                  className={styles.removeBtn}
                  onClick={() => removeAI(index)}
                  aria-label={`Remove ${ai.name}`}
                >
                  x
                </button>
              )}
            </div>
          ))}

          <button className={styles.addBtn} onClick={addAI} disabled={aiPlayers.length >= 3}>
            + Add Opponent {aiPlayers.length < 3 && `(${3 - aiPlayers.length} remaining)`}
          </button>
        </div>

        {mode === "timed" && (
          <>
            <div className={styles.divider} />
            <div className={styles.section}>
              <span className={styles.label}>Turn Time Limit</span>
              <div style={{ display: "flex", gap: "8px" }}>
                {TIMED_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={styles.addBtn}
                    style={{
                      flex: 1,
                      borderStyle: turnTimeLimit === opt.value ? "solid" : "dashed",
                      borderColor: turnTimeLimit === opt.value ? "var(--color-info)" : "#ccc",
                      color: turnTimeLimit === opt.value ? "var(--color-info)" : undefined,
                      fontWeight: turnTimeLimit === opt.value ? 700 : undefined,
                    }}
                    onClick={() => setTurnTimeLimit(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className={styles.divider} />

        <button
          className={styles.addBtn}
          onClick={() => setShowAdvanced((prev) => !prev)}
          style={{ borderStyle: showAdvanced ? "solid" : "dashed", color: showAdvanced ? "var(--color-info)" : undefined }}
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Options
        </button>

        {showAdvanced && (
          <AdvancedSetup config={customConfig} onChange={setCustomConfig} />
        )}

        <button className={styles.startBtn} onClick={handleStart}>
          Start Game
        </button>
      </div>
    </div>
  )
}
