import type React from "react"
import type { Card } from "../types/game"
import { COLOR_MAP } from "../constants/game"
import styles from "./GameCard.module.css"

interface GameCardProps {
  card: Card
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
  boardCard?: boolean
  placed?: boolean
}

// --- Shape SVGs ---

function Triangle({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Triangle" role="img">
      <polygon points="12,2 22,22 2,22" fill={color} />
    </svg>
  )
}

function Square({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Square" role="img">
      <rect x="2" y="2" width="20" height="20" rx="2" fill={color} />
    </svg>
  )
}

function Circle({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Circle" role="img">
      <circle cx="12" cy="12" r="10" fill={color} />
    </svg>
  )
}

function Cross({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Cross" role="img">
      <path d="M8,2 h8 v6 h6 v8 h-6 v6 h-8 v-6 h-6 v-8 h6z" fill={color} />
    </svg>
  )
}

function Star({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Star" role="img">
      <polygon
        points="12,1 15,9 23,9 17,14 19,23 12,18 5,23 7,14 1,9 9,9"
        fill={color}
      />
    </svg>
  )
}

function WildIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Wild" role="img">
      <defs>
        <linearGradient id="wild-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-red)" />
          <stop offset="33%" stopColor="var(--color-green)" />
          <stop offset="66%" stopColor="var(--color-blue)" />
          <stop offset="100%" stopColor="var(--color-yellow)" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="none" stroke="url(#wild-grad)" strokeWidth="2" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="url(#wild-grad)"
      >
        ?
      </text>
    </svg>
  )
}

const shapeMap: Record<string, React.FC<{ color: string; size: number }>> = {
  triangle: Triangle,
  square: Square,
  circle: Circle,
  cross: Cross,
  star: Star,
}

// Special card icon
function SpecialIcon({ type, size }: { type: string; size: number }) {
  const icons: Record<string, string> = {
    remove: "\u{1F5D1}",
    steal: "\u{1F4E5}",
    swap: "\u{1F500}",
    mirror: "\u{1FA9E}",
    double: "\u{2728}",
  }
  return (
    <span style={{ fontSize: size * 0.7, lineHeight: 1 }} role="img" aria-label={type}>
      {icons[type] ?? "?"}
    </span>
  )
}

// --- Shape count layout ---
// Renders the shape N times based on card number

function ShapeGroup({
  shape,
  color,
  count,
  boardCard,
}: {
  shape: string
  color: string
  count: number
  boardCard?: boolean
}) {
  const ShapeComp = shapeMap[shape]
  if (!ShapeComp) return null

  const size = boardCard ? 12 : 14
  const layoutClass =
    count <= 1
      ? styles.shapes1
      : count === 2
        ? styles.shapes2
        : count === 3
          ? styles.shapes3
          : styles.shapes4

  return (
    <div className={`${styles.shapes} ${layoutClass}`}>
      {Array.from({ length: count }, (_, i) => (
        <ShapeComp key={i} color={color} size={size} />
      ))}
    </div>
  )
}

// --- Main component ---

export const GameCard: React.FC<GameCardProps> = ({
  card,
  onClick,
  selected = false,
  disabled = false,
  boardCard = false,
  placed = false,
}) => {
  const isWild = card.isWild
  const isSpecial = "isSpecial" in card && card.isSpecial
  const color = isWild || isSpecial ? "var(--color-wild)" : COLOR_MAP[card.color]

  const classNames = [
    styles.card,
    selected && styles.selected,
    disabled && styles.disabled,
    (isWild || isSpecial) && styles.wild,
    boardCard && styles.boardCard,
    placed && styles.placed,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      className={classNames}
      onClick={disabled ? undefined : onClick}
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? undefined : 0}
      onKeyDown={
        disabled
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick?.()
              }
            }
      }
    >
      {isSpecial && "specialType" in card ? (
        <>
          <SpecialIcon type={card.specialType} size={boardCard ? 24 : 28} />
          <span className={styles.wildLabel}>{card.specialType}</span>
        </>
      ) : isWild ? (
        <>
          <WildIcon size={boardCard ? 24 : 28} />
          <span className={styles.wildLabel}>wild</span>
        </>
      ) : (
        <>
          <ShapeGroup shape={card.shape} color={color} count={card.number} boardCard={boardCard} />
          <span className={styles.number} style={{ color }}>
            {card.number}
          </span>
        </>
      )}
    </div>
  )
}
