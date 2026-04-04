import React, { useState } from 'react'
import type { AIDifficulty, GameSettings } from '../types/game'
import styles from './GameSetup.module.css'

const AI_NAMES = ['Dot', 'Dash', 'Pixel', 'Byte', 'Chip', 'Nova']

interface AIPlayerConfig {
  name: string
  difficulty: AIDifficulty
}

interface GameSetupProps {
  onStartGame: (settings: GameSettings) => void
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const [aiPlayers, setAiPlayers] = useState<AIPlayerConfig[]>([
    { name: AI_NAMES[0], difficulty: 'medium' },
  ])

  const addAI = () => {
    if (aiPlayers.length >= 3) return
    const nextName = AI_NAMES[aiPlayers.length] || `AI ${aiPlayers.length + 1}`
    setAiPlayers([...aiPlayers, { name: nextName, difficulty: 'medium' }])
  }

  const removeAI = (index: number) => {
    setAiPlayers(aiPlayers.filter((_, i) => i !== index))
  }

  const updateDifficulty = (index: number, difficulty: AIDifficulty) => {
    setAiPlayers(aiPlayers.map((p, i) => i === index ? { ...p, difficulty } : p))
  }

  const handleStart = () => {
    onStartGame({
      playerCount: 1 + aiPlayers.length,
      aiPlayers,
    })
  }

  const getDiffClass = (diff: AIDifficulty) => {
    switch (diff) {
      case 'easy': return styles.diffEasy
      case 'medium': return styles.diffMedium
      case 'hard': return styles.diffHard
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iota</h1>
        <p className={styles.subtitle}>The card game of matching patterns</p>

        <div className={styles.divider} />

        <div className={styles.section}>
          <span className={styles.label}>Opponents</span>

          {aiPlayers.map((ai, index) => (
            <div key={index} className={styles.aiRow}>
              <span className={styles.aiName}>{ai.name}</span>
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

          <button
            className={styles.addBtn}
            onClick={addAI}
            disabled={aiPlayers.length >= 3}
          >
            + Add Opponent {aiPlayers.length < 3 && `(${3 - aiPlayers.length} remaining)`}
          </button>
        </div>

        <button className={styles.startBtn} onClick={handleStart}>
          Start Game
        </button>
      </div>
    </div>
  )
}
