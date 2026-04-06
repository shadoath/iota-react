"use client"

import React from "react"
import type { CustomGameConfig, SpecialCardType } from "../types/game"
import { ALL_NUMBERS, ALL_COLORS, ALL_SHAPES, COLOR_NAMES, SHAPE_NAMES, SPECIAL_CARD_INFO } from "../constants/game"
import styles from "./AdvancedSetup.module.css"

interface AdvancedSetupProps {
  config: CustomGameConfig
  onChange: (config: CustomGameConfig) => void
}

const SPECIAL_TYPES: SpecialCardType[] = ["remove", "steal", "swap"]

export const AdvancedSetup: React.FC<AdvancedSetupProps> = ({ config, onChange }) => {
  const updateSpecial = (type: SpecialCardType, delta: number) => {
    const current = config.specialCards[type]
    const next = Math.max(0, Math.min(4, current + delta))
    onChange({
      ...config,
      specialCards: { ...config.specialCards, [type]: next },
    })
  }

  const totalSpecials = Object.values(config.specialCards).reduce((a, b) => a + b, 0)
  const baseDeckSize = config.numberCount * config.colorCount * config.shapeCount

  return (
    <>
      {/* Numbers */}
      <div className={styles.section}>
        <span className={styles.label}>Numbers</span>
        <div className={styles.attrRow}>
          <input
            type="range"
            className={styles.attrSlider}
            min={1}
            max={5}
            value={config.numberCount}
            onChange={(e) => onChange({ ...config, numberCount: Number(e.target.value) })}
          />
          <span className={styles.attrValue}>{config.numberCount}</span>
        </div>
        <div className={styles.attrChips}>
          {ALL_NUMBERS.map((n, i) => (
            <span
              key={n}
              className={`${styles.attrChip} ${i < config.numberCount ? styles.attrChipActive : ""}`}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className={styles.section}>
        <span className={styles.label}>Colors</span>
        <div className={styles.attrRow}>
          <input
            type="range"
            className={styles.attrSlider}
            min={1}
            max={5}
            value={config.colorCount}
            onChange={(e) => onChange({ ...config, colorCount: Number(e.target.value) })}
          />
          <span className={styles.attrValue}>{config.colorCount}</span>
        </div>
        <div className={styles.attrChips}>
          {ALL_COLORS.map((c, i) => (
            <span
              key={c}
              className={`${styles.attrChip} ${i < config.colorCount ? styles.attrChipActive : ""}`}
            >
              {COLOR_NAMES[c]}
            </span>
          ))}
        </div>
      </div>

      {/* Shapes */}
      <div className={styles.section}>
        <span className={styles.label}>Shapes</span>
        <div className={styles.attrRow}>
          <input
            type="range"
            className={styles.attrSlider}
            min={1}
            max={5}
            value={config.shapeCount}
            onChange={(e) => onChange({ ...config, shapeCount: Number(e.target.value) })}
          />
          <span className={styles.attrValue}>{config.shapeCount}</span>
        </div>
        <div className={styles.attrChips}>
          {ALL_SHAPES.map((s, i) => (
            <span
              key={s}
              className={`${styles.attrChip} ${i < config.shapeCount ? styles.attrChipActive : ""}`}
            >
              {SHAPE_NAMES[s]}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Wild cards */}
      <div className={styles.section}>
        <span className={styles.label}>Wild Cards: {config.wildCount}</span>
        <div className={styles.attrRow}>
          <input
            type="range"
            className={styles.attrSlider}
            min={0}
            max={6}
            value={config.wildCount}
            onChange={(e) => onChange({ ...config, wildCount: Number(e.target.value) })}
          />
          <span className={styles.attrValue}>{config.wildCount}</span>
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

      <div className={styles.desc}>
        Deck: {baseDeckSize} base + {config.wildCount} wild + {totalSpecials} special = {baseDeckSize + config.wildCount + totalSpecials} total cards
      </div>
    </>
  )
}
