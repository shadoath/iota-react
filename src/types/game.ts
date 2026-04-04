export type CardNumber = 1 | 2 | 3 | 4;
export type CardColor = 'red' | 'green' | 'blue' | 'yellow';
export type CardShape = 'triangle' | 'square' | 'circle' | 'cross';

export interface RegularCard {
  id: string;
  number: CardNumber;
  color: CardColor;
  shape: CardShape;
  isWild?: false;
}

export interface WildCard {
  id: string;
  number: CardNumber;
  color: CardColor;
  shape: CardShape;
  isWild: true;
}

export type Card = RegularCard | WildCard;

export interface GridPosition {
  row: number;
  col: number;
}

export interface PlacedCard {
  card: Card;
  position: GridPosition;
}

export interface PendingPlacement {
  card: Card;
  position: GridPosition;
}

// --- Multi-player types ---

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface Player {
  id: string;
  name: string;
  type: 'human' | 'ai';
  difficulty?: AIDifficulty;
  hand: Card[];
  score: number;
}

export interface TurnRecord {
  playerId: string;
  placements: PlacedCard[];
  score: number;
}

export type GamePhase = 'setup' | 'playing' | 'ended';

export interface GameSettings {
  playerCount: number;
  aiPlayers: Array<{ name: string; difficulty: AIDifficulty }>;
}

export interface GameState {
  deck: Card[];
  board: PlacedCard[];
  players: Player[];
  currentPlayerIndex: number;
  pendingPlacements: PendingPlacement[];
  turnInProgress: boolean;
  lastTurnScore: number | null;
  gamePhase: GamePhase;
  turnHistory: TurnRecord[];

  // Legacy single-player compat (derived from players[0])
  playerHand: Card[];
  score: number;
  currentPlayer: number;
}
