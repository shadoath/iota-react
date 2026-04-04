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

// Card attributes
export const CARD_NUMBERS = [1, 2, 3, 4] as const
export const CARD_COLORS = ['red', 'green', 'blue', 'yellow'] as const
export const CARD_SHAPES = ['triangle', 'square', 'circle', 'cross'] as const

// Display colors for card faces
export const COLOR_MAP: Record<string, string> = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  yellow: '#eab308',
}
