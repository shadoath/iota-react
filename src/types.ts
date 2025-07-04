// src/types.ts
export const SHAPES = ['square', 'circle', 'triangle', 'cross'] as const
export const COLORS = ['red', 'green', 'blue', 'yellow'] as const
export const NUMBERS = [1, 2, 3, 4] as const
export type Shape = (typeof SHAPES)[number]
export type Color = (typeof COLORS)[number]
export type Number = (typeof NUMBERS)[number]
export interface CardType {
  shape: Shape | 'wild'
  color: Color | 'wild'
  number: Number | 0
}

export interface GameState {
  grid: (CardType | null)[][]
  playerHands: CardType[][]
  drawPile: CardType[]
  currentPlayer: number
  scores: number[]
}
