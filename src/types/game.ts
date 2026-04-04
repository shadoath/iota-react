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

export interface GameState {
  deck: Card[];
  playerHand: Card[];
  board: PlacedCard[];
  currentPlayer: number;
  score: number;
  pendingPlacements: PendingPlacement[];
  turnInProgress: boolean;
  lastTurnScore: number | null;
}