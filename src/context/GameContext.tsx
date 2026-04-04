'use client'

import React, { createContext, useContext, useReducer, type ReactNode } from 'react'
import type {
  Card,
  GameState,
  GridPosition,
  PendingPlacement,
} from '../types/game'
import { createDeck, calculateScore } from '../utils/gameLogic'
import { HAND_SIZE } from '../constants/game'

// --- Action types ---

export type GameAction =
  | { type: 'NEW_GAME' }
  | { type: 'SELECT_CARD'; cardId: string }
  | { type: 'DESELECT_CARD' }
  | { type: 'PLACE_CARD'; card: Card; position: GridPosition }
  | { type: 'UNDO_PLACEMENT' }
  | { type: 'COMPLETE_TURN' }
  | { type: 'SET_ZOOM'; zoom: number }

// --- Extended state (includes UI state) ---

export interface AppState {
  game: GameState
  selectedCardId: string | null
  zoomLevel: number
  lastActionResult: ActionResult | null
}

export interface ActionResult {
  type: 'success' | 'error' | 'info'
  message: string
}

// --- Initial state ---

function createInitialGameState(): GameState {
  const deck = createDeck()
  const playerHand = deck.slice(0, HAND_SIZE)
  const remainingDeck = deck.slice(HAND_SIZE)
  const initialCard = remainingDeck[0]

  return {
    deck: remainingDeck.slice(1),
    playerHand,
    board: [{ card: initialCard, position: { row: 0, col: 0 } }],
    currentPlayer: 1,
    score: 0,
    pendingPlacements: [],
    turnInProgress: false,
    lastTurnScore: null,
  }
}

function createInitialAppState(): AppState {
  return {
    game: createInitialGameState(),
    selectedCardId: null,
    zoomLevel: 1.0,
    lastActionResult: null,
  }
}

// --- Reducer ---

export function gameReducer(state: AppState, action: GameAction): AppState {
  switch (action.type) {
    case 'NEW_GAME': {
      return {
        ...createInitialAppState(),
        zoomLevel: state.zoomLevel, // preserve zoom
        lastActionResult: { type: 'success', message: 'New game started!' },
      }
    }

    case 'SELECT_CARD': {
      const isDeselect = state.selectedCardId === action.cardId
      return {
        ...state,
        selectedCardId: isDeselect ? null : action.cardId,
        lastActionResult: null,
      }
    }

    case 'DESELECT_CARD': {
      return {
        ...state,
        selectedCardId: null,
        lastActionResult: null,
      }
    }

    case 'PLACE_CARD': {
      const { card, position } = action
      const newPending: PendingPlacement = {
        card: { ...card, id: `pending-${card.id}` },
        position,
      }

      const newPendingPlacements = [...state.game.pendingPlacements, newPending]

      return {
        ...state,
        selectedCardId: null,
        game: {
          ...state.game,
          pendingPlacements: newPendingPlacements,
          playerHand: state.game.playerHand.filter(c => c.id !== card.id),
          turnInProgress: true,
        },
        lastActionResult: null,
      }
    }

    case 'UNDO_PLACEMENT': {
      if (state.game.pendingPlacements.length === 0) return state

      const lastPlacement = state.game.pendingPlacements[state.game.pendingPlacements.length - 1]
      const originalCard = {
        ...lastPlacement.card,
        id: lastPlacement.card.id.replace('pending-', ''),
      }

      return {
        ...state,
        game: {
          ...state.game,
          pendingPlacements: state.game.pendingPlacements.slice(0, -1),
          playerHand: [...state.game.playerHand, originalCard],
          turnInProgress: state.game.pendingPlacements.length > 1,
        },
        lastActionResult: { type: 'info', message: 'Placement undone' },
      }
    }

    case 'COMPLETE_TURN': {
      if (state.game.pendingPlacements.length === 0) {
        return {
          ...state,
          lastActionResult: { type: 'error', message: 'You must place at least one card!' },
        }
      }

      const points = calculateScore(state.game.pendingPlacements, state.game.board)
      const newBoard = [...state.game.board, ...state.game.pendingPlacements]
      const cardsNeeded = HAND_SIZE - state.game.playerHand.length
      const newCards = state.game.deck.slice(0, cardsNeeded)
      const newDeck = state.game.deck.slice(cardsNeeded)
      const newHand = [...state.game.playerHand, ...newCards]
      const newScore = state.game.score + points

      const isGameOver = newHand.length === 0
      const message = isGameOver
        ? `Game Over! Final Score: ${newScore}`
        : `Turn complete! You scored ${points} points!`

      return {
        ...state,
        game: {
          ...state.game,
          board: newBoard,
          playerHand: newHand,
          deck: newDeck,
          score: newScore,
          pendingPlacements: [],
          turnInProgress: false,
          lastTurnScore: points,
        },
        lastActionResult: { type: 'success', message },
      }
    }

    case 'SET_ZOOM': {
      return {
        ...state,
        zoomLevel: action.zoom,
        lastActionResult: null,
      }
    }

    default:
      return state
  }
}

// --- Context ---

interface GameContextValue {
  state: AppState
  dispatch: React.Dispatch<GameAction>
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialAppState)

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
