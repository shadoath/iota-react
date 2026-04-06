import type { GameSize, CardNumber, CardColor, CardShape } from "../types/game"

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

// Standard (size 4) attributes
export const CARD_NUMBERS = [1, 2, 3, 4] as const
export const CARD_COLORS = ["red", "green", "blue", "yellow"] as const
export const CARD_SHAPES = ["triangle", "square", "circle", "cross"] as const

// Extended attributes for size 5
export const ALL_NUMBERS: readonly CardNumber[] = [1, 2, 3, 4, 5]
export const ALL_COLORS: readonly CardColor[] = ["red", "green", "blue", "yellow", "purple"]
export const ALL_SHAPES: readonly CardShape[] = ["triangle", "square", "circle", "cross", "star"]

// Get attributes for a given game size
export function getNumbersForSize(size: GameSize): readonly CardNumber[] {
  return ALL_NUMBERS.slice(0, size) as readonly CardNumber[]
}

export function getColorsForSize(size: GameSize): readonly CardColor[] {
  return ALL_COLORS.slice(0, size) as readonly CardColor[]
}

export function getShapesForSize(size: GameSize): readonly CardShape[] {
  return ALL_SHAPES.slice(0, size) as readonly CardShape[]
}

// Display colors for card faces
export const COLOR_MAP: Record<string, string> = {
  red: "#ef4444",
  green: "#22c55e",
  blue: "#3b82f6",
  yellow: "#eab308",
  purple: "#a855f7",
}

// Special card display info
export const SPECIAL_CARD_INFO: Record<string, { icon: string; name: string; description: string }> = {
  remove: { icon: "\u{1F5D1}", name: "Remove", description: "Remove any card from the board" },
  steal: { icon: "\u{1F4E5}", name: "Steal", description: "Take a board card into your hand" },
  swap: { icon: "\u{1F500}", name: "Swap", description: "Exchange a board card with one in your hand" },
}

// Game size labels
export const GAME_SIZE_INFO: Record<number, { name: string; cards: string; description: string }> = {
  3: { name: "Mini", cards: "27 + specials", description: "Quick games, simpler patterns" },
  4: { name: "Standard", cards: "64 + specials", description: "Classic experience" },
  5: { name: "Mega", cards: "125 + specials", description: "Epic games, complex strategy" },
}
