import type React from 'react'
import { useState, useCallback } from 'react'
import { useTheme } from '../hooks/useTheme'
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

        <button className={styles.newGameBtn} onClick={handleNewGame}>
          New Game
        </button>
      </div>
    </>
  )
}
