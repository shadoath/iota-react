import React from 'react'
import type { GameMode } from '../types/game'
import styles from './ModeSelect.module.css'

interface ModeSelectProps {
  onSelectMode: (mode: GameMode) => void
  onTutorial: () => void
}

const modes: Array<{ id: GameMode; name: string; icon: string; desc: string }> = [
  {
    id: 'classic',
    name: 'Classic Game',
    icon: '\u2660',
    desc: 'Play against AI opponents with standard rules',
  },
  {
    id: 'practice',
    name: 'Practice',
    icon: '\u2728',
    desc: 'Play with hints — see valid positions and score previews',
  },
  {
    id: 'timed',
    name: 'Timed Mode',
    icon: '\u23F1',
    desc: 'Race the clock with a turn timer',
  },
]

export const ModeSelect: React.FC<ModeSelectProps> = ({
  onSelectMode,
  onTutorial,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iota</h1>
        <p className={styles.subtitle}>The card game of matching patterns</p>

        <div className={styles.modes}>
          {modes.map((mode) => (
            <button
              key={mode.id}
              className={styles.modeBtn}
              onClick={() => onSelectMode(mode.id)}
            >
              <span className={styles.modeIcon}>{mode.icon}</span>
              <div className={styles.modeInfo}>
                <div className={styles.modeName}>{mode.name}</div>
                <div className={styles.modeDesc}>{mode.desc}</div>
              </div>
              <span className={styles.modeArrow}>&rarr;</span>
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        <button className={styles.tutorialBtn} onClick={onTutorial}>
          Learn How to Play
        </button>
      </div>
    </div>
  )
}
