"use client"

import React from "react"
import type { CustomGameConfig, GameSize, SpecialCardType } from "../types/game"
import { GAME_SIZE_INFO, SPECIAL_CARD_INFO } from "../constants/game"
import styles from "./AdvancedSetup.module.css"

interface AdvancedSetupProps {
  config: CustomGameConfig
  onChange: (config: CustomGameConfig) => void
}

const SIZES: GameSize[] = [3, 4, 5]
const SPECIAL_TYPES: SpecialCardType[] = ["remove", "steal", "swap"]

export const AdvancedSetup: React.FC<AdvancedSetupProps> = ({ config, onChange }) => {
  const updateSize = (size: GameSize) => {
    onChange({ ...config, size, handSize: size === 3 ? 3 : 4 })
  }

  const updateWilds = (wildCount: number) => {
    onChange({ ...config, wildCount: Math.max(0, Math.min(6, wildCount)) })
  }

  const updateSpecial = (type: SpecialCardType, delta: number) => {
    const current = config.specialCards[type]
    const next = Math.max(0, Math.min(4, current + delta))
    onChange({
      ...config,
      specialCards: { ...config.specialCards, [type]: next },
    })
  }

  const totalSpecials = Object.values(config.specialCards).reduce((a, b) => a + b, 0)
  const baseDeckSize = config.size ** 3

  return (
    <>
      {/* Game Size */}
      <div className={styles.section}>
        <span className={styles.label}>Game Size</span>
        <div className={styles.sizeRow}>
          {SIZES.map((size) => {
            const info = GAME_SIZE_INFO[size]
            return (
              <button
                key={size}
                className={`${styles.sizeBtn} ${config.size === size ? styles.sizeBtnActive : ""}`}
                onClick={() => updateSize(size)}
              >
                <span className={styles.sizeName}>{info.name}</span>
                <span className={styles.sizeDetail}>
                  {size}&times;{size}&times;{size} = {size ** 3}
                </span>
              </button>
            )
          })}
        </div>
        <span className={styles.desc}>
          Deck: {baseDeckSize} cards + {config.wildCount} wilds + {totalSpecials} specials ={" "}
          {baseDeckSize + config.wildCount + totalSpecials} total
        </span>
      </div>

      <div className={styles.divider} />

      {/* Wild cards */}
      <div className={styles.section}>
        <span className={styles.label}>Wild Cards: {config.wildCount}</span>
        <div className={styles.wildRow}>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>0</span>
          <input
            type="range"
            className={styles.wildSlider}
            min={0}
            max={6}
            value={config.wildCount}
            onChange={(e) => updateWilds(Number(e.target.value))}
          />
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>6</span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Special cards */}
      <div className={styles.section}>
        <span className={styles.label}>Special Cards</span>
        <div className={styles.specialGrid}>
          {SPECIAL_TYPES.map((type) => {
            const info = SPECIAL_CARD_INFO[type]
            return (
              <div key={type} className={styles.specialRow}>
                <span className={styles.specialIcon}>{info.icon}</span>
                <div className={styles.specialInfo}>
                  <div className={styles.specialName}>{info.name}</div>
                  <div className={styles.specialDesc}>{info.description}</div>
                </div>
                <div className={styles.specialCount}>
                  <button
                    className={styles.countBtn}
                    onClick={() => updateSpecial(type, -1)}
                    disabled={config.specialCards[type] === 0}
                  >
                    -
                  </button>
                  <span className={styles.countValue}>{config.specialCards[type]}</span>
                  <button
                    className={styles.countBtn}
                    onClick={() => updateSpecial(type, 1)}
                    disabled={config.specialCards[type] >= 4}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
