import React, { useState } from "react"
import type { GameMode } from "../types/game"
import styles from "./ModeSelect.module.css"

interface ModeSelectProps {
  onSelectMode: (mode: GameMode) => void
  onTutorial: () => void
  onMultiplayer: () => void
  onDailyChallenge: () => void
  onStats: () => void
  onTrainer: () => void
  isOnline?: boolean
  canInstall?: boolean
  onInstall?: () => void
}

const modes: Array<{ id: GameMode; name: string; icon: string; desc: string }> = [
  {
    id: "classic",
    name: "Classic Game",
    icon: "\u2660",
    desc: "Play against AI opponents with standard rules",
  },
  {
    id: "practice",
    name: "Practice",
    icon: "\u2728",
    desc: "Play with hints — see valid positions and score previews",
  },
  {
    id: "timed",
    name: "Timed Mode",
    icon: "\u23F1",
    desc: "Race the clock with a turn timer",
  },
]

export const ModeSelect: React.FC<ModeSelectProps> = ({
  onSelectMode,
  onTutorial,
  onMultiplayer,
  onDailyChallenge,
  onStats,
  onTrainer,
  isOnline = true,
  canInstall = false,
  onInstall,
}) => {
  const [showSignIn, setShowSignIn] = useState(false)

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 className={styles.title}>NodusNexus</h1>
          <button
            className={styles.tutorialBtn}
            style={{ padding: "4px 12px", fontSize: 11 }}
            onClick={() => setShowSignIn(true)}
          >
            Sign In
          </button>
        </div>
        <p className={styles.subtitle}>The card game of matching patterns</p>

        {/* Sign-in coming soon modal */}
        {showSignIn && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 500,
              padding: 16,
            }}
            onClick={() => setShowSignIn(false)}
          >
            <div
              style={{
                background: "var(--color-surface)",
                borderRadius: 12,
                padding: 24,
                maxWidth: 360,
                width: "100%",
                textAlign: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>&#x1F510;</div>
              <h3 style={{ marginBottom: 8, fontSize: 18 }}>Sign In Coming Soon</h3>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: 14,
                  lineHeight: 1.5,
                  marginBottom: 16,
                }}
              >
                Account sign-in with Google and GitHub is being built. Your stats and achievements
                are safely stored locally and will sync to your account once sign-in launches.
              </p>
              <button
                type="button"
                style={{
                  padding: "8px 24px",
                  background: "var(--color-info)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => setShowSignIn(false)}
              >
                Got it
              </button>
            </div>
          </div>
        )}

        <div className={styles.modes}>
          {modes.map((mode) => (
            <button key={mode.id} className={styles.modeBtn} onClick={() => onSelectMode(mode.id)}>
              <span className={styles.modeIcon}>{mode.icon}</span>
              <div className={styles.modeInfo}>
                <div className={styles.modeName}>{mode.name}</div>
                <div className={styles.modeDesc}>{mode.desc}</div>
              </div>
              <span className={styles.modeArrow}>&rarr;</span>
            </button>
          ))}
        </div>

        <button className={styles.modeBtn} onClick={onDailyChallenge}>
          <span className={styles.modeIcon}>{"\uD83D\uDCC5"}</span>
          <div className={styles.modeInfo}>
            <div className={styles.modeName}>Daily Challenge</div>
            <div className={styles.modeDesc}>
              Same puzzle for everyone today — track your streak
            </div>
          </div>
          <span className={styles.modeArrow}>&rarr;</span>
        </button>

        <button
          className={`${styles.modeBtn} ${!isOnline ? styles.disabled : ""}`}
          onClick={isOnline ? onMultiplayer : undefined}
          disabled={!isOnline}
          aria-disabled={!isOnline}
        >
          <span className={styles.modeIcon}>{"\uD83C\uDF10"}</span>
          <div className={styles.modeInfo}>
            <div className={styles.modeName}>Multiplayer</div>
            <div className={styles.modeDesc}>
              {isOnline ? "Play online with friends via room code" : "Requires internet connection"}
            </div>
          </div>
          <span className={styles.modeArrow}>&rarr;</span>
        </button>

        <div className={styles.divider} />

        <button className={styles.tutorialBtn} onClick={onTutorial}>
          Learn How to Play
        </button>

        <button className={styles.tutorialBtn} onClick={onTrainer}>
          Pattern Trainer
        </button>

        <button className={styles.tutorialBtn} onClick={onStats}>
          Stats & Achievements
        </button>

        {canInstall && (
          <>
            <div className={styles.divider} />
            <button className={styles.installBtn} onClick={onInstall}>
              Install App
            </button>
          </>
        )}

        <div className={styles.legal}>
          <a href="/privacy" className={styles.legalLink}>
            Privacy Policy
          </a>
          <span className={styles.legalDot}>&middot;</span>
          <a href="/terms" className={styles.legalLink}>
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  )
}
