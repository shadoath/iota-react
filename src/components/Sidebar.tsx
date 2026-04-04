import type React from 'react'
import { useState, useCallback } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useCardTheme, CARD_THEMES, BOARD_THEMES } from '../hooks/useCardTheme'
import styles from './Sidebar.module.css'

interface SidebarProps {
  cardsLeft: number
  lastTurnScore: number | null
  pendingPoints: number
  pendingCount: number
  turnInProgress: boolean
  onNewGame: () => void
  onCompleteTurn: () => void
  onUndoLast: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  cardsLeft,
  lastTurnScore,
  pendingPoints,
  pendingCount,
  onNewGame,
}) => {
  const [open, setOpen] = useState(false)

  const { theme, toggle: toggleTheme } = useTheme()
  const { cardTheme, boardTheme, setCardTheme, setBoardTheme } = useCardTheme()

  const handleNewGame = useCallback(() => {
    onNewGame()
    setOpen(false)
  }, [onNewGame])

  const themeLabel = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System'
  const themeIcon = theme === 'light' ? '\u2600' : theme === 'dark' ? '\u{1F319}' : '\u{1F4BB}'

  return (
    <>
      <button
        className={styles.menuBtn}
        onClick={() => setOpen(true)}
        aria-label='Open menu'
      >
        ☰
      </button>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>NodusNexus</span>
          <button
            className={styles.closeBtn}
            onClick={() => setOpen(false)}
            aria-label='Close menu'
          >
            ✕
          </button>
        </div>

        <div className={styles.divider} />

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Cards Remaining</div>
          <div className={styles.statValue}>{cardsLeft}</div>
        </div>

        {lastTurnScore !== null && (
          <div className={`${styles.statCard} ${styles.statCardSuccess}`}>
            <div className={styles.statLabel}>Last Turn</div>
            <div className={styles.statValue}>+{lastTurnScore}</div>
          </div>
        )}

        {pendingCount > 0 && (
          <div className={styles.pendingBadge}>
            Pending: +{pendingPoints} points
          </div>
        )}

        <div className={styles.divider} />

        <button className={styles.themeBtn} onClick={toggleTheme}>
          {themeIcon} Theme: {themeLabel}
        </button>

        <div className={styles.themeSection}>
          <div className={styles.statLabel}>Card Colors</div>
          <div className={styles.themeRow}>
            {CARD_THEMES.map(t => (
              <button
                key={t.id}
                className={`${styles.themeChip} ${cardTheme === t.id ? styles.themeChipActive : ''}`}
                onClick={() => setCardTheme(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.themeSection}>
          <div className={styles.statLabel}>Board</div>
          <div className={styles.themeRow}>
            {BOARD_THEMES.map(t => (
              <button
                key={t.id}
                className={`${styles.themeChip} ${boardTheme === t.id ? styles.themeChipActive : ''}`}
                onClick={() => setBoardTheme(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.divider} />

        <button className={styles.newGameBtn} onClick={handleNewGame}>
          New Game
        </button>
      </div>
    </>
  )
}
