export type CardNumber = 1 | 2 | 3 | 4 | 5
export type CardColor = "red" | "green" | "blue" | "yellow" | "purple"
export type CardShape = "triangle" | "square" | "circle" | "cross" | "star"

// Special card actions
export type SpecialCardType = "remove" | "steal" | "swap" | "mirror" | "double"

export interface RegularCard {
  id: string
  number: CardNumber
  color: CardColor
  shape: CardShape
  isWild?: false
  isSpecial?: false
}

export interface WildCard {
  id: string
  number: CardNumber
  color: CardColor
  shape: CardShape
  isWild: true
  isSpecial?: false
}

export interface SpecialCard {
  id: string
  number: CardNumber
  color: CardColor
  shape: CardShape
  isWild?: false
  isSpecial: true
  specialType: SpecialCardType
}

export type Card = RegularCard | WildCard | SpecialCard

export interface GridPosition {
  row: number
  col: number
}

export interface PlacedCard {
  card: Card
  position: GridPosition
}

export interface PendingPlacement {
  card: Card
  position: GridPosition
}

// --- Multi-player types ---

export type AIDifficulty = "easy" | "medium" | "hard"

export interface Player {
  id: string
  name: string
  type: "human" | "ai"
  difficulty?: AIDifficulty
  hand: Card[]
  score: number
}

export interface TurnRecord {
  playerId: string
  placements: PlacedCard[]
  score: number
}

export type GamePhase = "menu" | "setup" | "playing" | "ended"

export type GameMode = "classic" | "practice" | "timed" | "daily"

// --- Configurable game size ---

export type GameSize = 3 | 4 | 5

export interface SpecialCardConfig {
  remove: number // how many "remove" cards to add
  steal: number
  swap: number
  mirror: number
  double: number
}

export interface CustomGameConfig {
  size: GameSize // 3, 4, or 5 attributes per dimension
  wildCount: number
  specialCards: SpecialCardConfig
  handSize: number
}

export const DEFAULT_CUSTOM_CONFIG: CustomGameConfig = {
  size: 4,
  wildCount: 2,
  specialCards: { remove: 0, steal: 0, swap: 0, mirror: 0, double: 0 },
  handSize: 4,
}

export interface GameSettings {
  playerCount: number
  aiPlayers: Array<{ name: string; difficulty: AIDifficulty }>
  mode: GameMode
  turnTimeLimit?: number // seconds, for timed mode
  hintsEnabled?: boolean // for practice mode
  prebuiltDeck?: Card[] // for daily challenge (seeded deck)
  customConfig?: CustomGameConfig // for advanced game options
}

export interface GameState {
  deck: Card[]
  board: PlacedCard[]
  players: Player[]
  currentPlayerIndex: number
  pendingPlacements: PendingPlacement[]
  turnInProgress: boolean
  lastTurnScore: number | null
  gamePhase: GamePhase
  gameMode: GameMode
  turnHistory: TurnRecord[]
  turnTimeLimit: number | null // seconds, null = untimed
  hintsEnabled: boolean
  customConfig: CustomGameConfig

  // Legacy single-player compat (derived from players[0])
  playerHand: Card[]
  score: number
  currentPlayer: number
}
