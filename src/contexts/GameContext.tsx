import React, { createContext, useContext, useReducer, useEffect } from "react"
import { CardType, GameState, SHAPES, COLORS, NUMBERS } from "../types"
import { isValidMove } from "../lib/checks"
import { shuffle } from "fast-shuffle"
import { initializeSettings } from "../pages/game"

const initializeGameState = (
  gridSize: number,
  colors: number,
  shapes: number,
  numbers: number
): GameState => {
  const shapesArray = SHAPES.slice(0, shapes)
  const colorsArray = COLORS.slice(0, colors)
  const numbersArray = NUMBERS.slice(0, numbers)

  const initialCards: CardType[] = [
    ...shapesArray.flatMap((shape) =>
      colorsArray.flatMap((color) => numbersArray.map((number) => ({ shape, color, number })))
    ),
    { shape: "wild", color: "wild", number: 0 },
    { shape: "wild", color: "wild", number: 0 },
  ]

  const shuffledDeck = shuffle(initialCards)
  const playerHands = [shuffledDeck.splice(0, 4), shuffledDeck.splice(0, 4)]
  const grid = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null))
  grid[Math.floor(gridSize / 2)][Math.floor(gridSize / 2)] = shuffledDeck.shift()!

  return {
    grid,
    playerHands,
    drawPile: shuffledDeck,
    currentPlayer: 0,
    scores: [0, 0],
  }
}

type GameAction =
  | { type: "DROP_CARD"; card: CardType; row: number; col: number }
  | { type: "END_TURN" }

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "DROP_CARD":
      if (
        state.grid[action.row][action.col] === null &&
        isValidMove(state.grid, action.card, action.row, action.col)
      ) {
        const newGrid = state.grid.map((gridRow, rowIndex) =>
          gridRow.map((cell, colIndex) =>
            rowIndex === action.row && colIndex === action.col ? action.card : cell
          )
        )

        const newPlayerHands = state.playerHands.map((hand, index) =>
          index === state.currentPlayer ? hand.filter((c) => c !== action.card) : hand
        )

        return {
          ...state,
          grid: newGrid,
          playerHands: newPlayerHands,
        }
      }
      return state
    case "END_TURN":
      return {
        ...state,
        currentPlayer: (state.currentPlayer + 1) % state.playerHands.length,
      }
    default:
      return state
  }
}

const GameContext = createContext<
  | {
      state: GameState
      dispatch: React.Dispatch<GameAction>
    }
  | undefined
>(undefined)

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const settings = initializeSettings()
  const [state, dispatch] = useReducer(
    gameReducer,
    initializeGameState(settings.gridSize, settings.colors, settings.shapes, settings.numbers)
  )

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export const useGameContext = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider")
  }
  return context
}
