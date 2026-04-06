import type { CardNumber, CardColor, CardShape, SpecialCardType } from "../types/game"

// Card and deck constants
export const HAND_SIZE = 4
export const MAX_LINE_LENGTH = 4
export const DECK_WILD_COUNT = 2

// Board display
export const GRID_PADDING = 2

// Zoom
export const INITIAL_ZOOM = 1.0
export const MIN_ZOOM = 0.25
export const MAX_ZOOM = 3.0
export const ZOOM_STEP = 0.1

// Responsive breakpoints
export const MOBILE_BREAKPOINT = 768

// All possible attribute values (ordered, slice to desired count)
export const ALL_NUMBERS: readonly CardNumber[] = [1, 2, 3, 4, 5]
export const ALL_COLORS: readonly CardColor[] = ["red", "green", "blue", "yellow", "purple"]
export const ALL_SHAPES: readonly CardShape[] = ["triangle", "square", "circle", "cross", "star"]

// Standard (4) attributes — backwards compatible
export const CARD_NUMBERS = [1, 2, 3, 4] as const
export const CARD_COLORS = ["red", "green", "blue", "yellow"] as const
export const CARD_SHAPES = ["triangle", "square", "circle", "cross"] as const

// Get attributes for a given count (1-5)
export function getNumbers(count: number): CardNumber[] {
  return ALL_NUMBERS.slice(0, Math.min(5, Math.max(1, count))) as CardNumber[]
}

export function getColors(count: number): CardColor[] {
  return ALL_COLORS.slice(0, Math.min(5, Math.max(1, count))) as CardColor[]
}

export function getShapes(count: number): CardShape[] {
  return ALL_SHAPES.slice(0, Math.min(5, Math.max(1, count))) as CardShape[]
}

// Display colors for card faces
export const COLOR_MAP: Record<string, string> = {
  red: "#ef4444",
  green: "#22c55e",
  blue: "#3b82f6",
  yellow: "#eab308",
  purple: "#a855f7",
}

// Color display names (for UI)
export const COLOR_NAMES: Record<string, string> = {
  red: "Red",
  green: "Green",
  blue: "Blue",
  yellow: "Yellow",
  purple: "Purple",
}

// Shape display names
export const SHAPE_NAMES: Record<string, string> = {
  triangle: "Triangle",
  square: "Square",
  circle: "Circle",
  cross: "Cross",
  star: "Star",
}

// Special card info (only 3 types)
export const SPECIAL_CARD_INFO: Record<
  SpecialCardType,
  { icon: string; name: string; description: string }
> = {
  remove: {
    icon: "\u{1F5D1}",
    name: "Remove",
    description: "Remove any card from the board",
  },
  steal: {
    icon: "\u{1F4E5}",
    name: "Steal",
    description: "Take a board card into your hand",
  },
  swap: {
    icon: "\u{1F500}",
    name: "Swap",
    description: "Exchange a board card with one in your hand",
  },
}
