"use client"

import React, { createContext, useContext, useReducer, type ReactNode } from "react"
import type {
  Card,
  GameState,
  GridPosition,
  PendingPlacement,
  Player,
  GameSettings,
  GamePhase,
  GameMode,
  TurnRecord,
  CustomGameConfig,
  CardNumber,
  CardColor,
  CardShape,
} from "../types/game"
import { DEFAULT_CUSTOM_CONFIG } from "../types/game"
import { createDeck, calculateScore, shuffleDeck } from "../utils/gameLogic"
import { arePlacementsContiguous } from "../utils/turnValidation"
import { HAND_SIZE } from "../constants/game"

// --- Action types ---

export type GameAction =
  | { type: "START_GAME"; settings: GameSettings }
  | { type: "SHOW_MENU" }
  | { type: "SHOW_SETUP"; mode: GameMode }
  | { type: "RETURN_TO_SETUP" }
  | { type: "SELECT_CARD"; cardId: string }
  | { type: "DESELECT_CARD" }
  | { type: "PLACE_CARD"; card: Card; position: GridPosition }
  | { type: "UNDO_PLACEMENT" }
  | { type: "COMPLETE_TURN" }
  | { type: "AI_TURN"; placements: PendingPlacement[] }
  | { type: "SWAP_CARDS"; cardIds: string[] }
  | { type: "USE_SPECIAL"; cardId: string; targetPosition?: GridPosition; swapCardId?: string }
  | { type: "SET_ZOOM"; zoom: number }

// --- Extended state (includes UI state) ---

export interface AppState {
  game: GameState
  selectedCardId: string | null
  zoomLevel: number
  lastActionResult: ActionResult | null
}

export interface ActionResult {
  type: "success" | "error" | "info"
  message: string
}

// --- AI player names ---
const AI_NAMES = ["Dot", "Dash", "Pixel", "Byte", "Chip", "Nova"]

// --- Helpers ---

function dealHands(deck: Card[], playerCount: number): { hands: Card[][]; remaining: Card[] } {
  const hands: Card[][] = []
  let remaining = [...deck]
  for (let i = 0; i < playerCount; i++) {
    hands.push(remaining.slice(0, HAND_SIZE))
    remaining = remaining.slice(HAND_SIZE)
  }
  return { hands, remaining }
}

function createPlayers(settings: GameSettings, hands: Card[][]): Player[] {
  const players: Player[] = []

  // Human player is always first
  players.push({
    id: "player-0",
    name: "You",
    type: "human",
    hand: hands[0],
    score: 0,
  })

  // AI players
  for (let i = 0; i < settings.aiPlayers.length; i++) {
    const ai = settings.aiPlayers[i]
    players.push({
      id: `player-${i + 1}`,
      name: ai.name || AI_NAMES[i] || `AI ${i + 1}`,
      type: "ai",
      difficulty: ai.difficulty,
      hand: hands[i + 1],
      score: 0,
    })
  }

  return players
}

function initializeGame(settings: GameSettings): GameState {
  const customConfig = settings.customConfig ?? DEFAULT_CUSTOM_CONFIG
  const deck = settings.prebuiltDeck ?? createDeck(customConfig)
  const totalPlayers = 1 + settings.aiPlayers.length
  const { hands, remaining } = dealHands(deck, totalPlayers)

  // Place initial card
  const initialCard = remaining[0]
  const board = [{ card: initialCard, position: { row: 0, col: 0 } }]

  const players = createPlayers(settings, hands)

  return {
    deck: remaining.slice(1),
    board,
    players,
    currentPlayerIndex: 0,
    pendingPlacements: [],
    turnInProgress: false,
    lastTurnScore: null,
    gamePhase: "playing",
    gameMode: settings.mode || "classic",
    turnHistory: [],
    turnTimeLimit: settings.turnTimeLimit ?? null,
    hintsEnabled: settings.hintsEnabled ?? false,
    customConfig,
    // Legacy compat
    playerHand: players[0].hand,
    score: players[0].score,
    currentPlayer: 1,
  }
}

function syncLegacyFields(game: GameState): GameState {
  const humanPlayer = game.players.find((p) => p.type === "human")
  return {
    ...game,
    playerHand: humanPlayer?.hand ?? [],
    score: humanPlayer?.score ?? 0,
    currentPlayer: game.currentPlayerIndex + 1,
  }
}

function drawCards(game: GameState, playerIndex: number): GameState {
  const player = game.players[playerIndex]
  const cardsNeeded = HAND_SIZE - player.hand.length
  if (cardsNeeded <= 0 || game.deck.length === 0) return game

  const drawn = game.deck.slice(0, cardsNeeded)
  const newDeck = game.deck.slice(cardsNeeded)
  const newPlayers = game.players.map((p, i) =>
    i === playerIndex ? { ...p, hand: [...p.hand, ...drawn] } : p
  )

  return { ...game, deck: newDeck, players: newPlayers }
}

function advanceTurn(game: GameState): GameState {
  const nextIndex = (game.currentPlayerIndex + 1) % game.players.length

  // Check if game should end (current player has no cards and deck is empty)
  const allEmpty = game.players.every((p) => p.hand.length === 0) && game.deck.length === 0
  if (allEmpty) {
    return { ...game, gamePhase: "ended", currentPlayerIndex: nextIndex }
  }

  return { ...game, currentPlayerIndex: nextIndex }
}

function checkGameEnd(game: GameState): GameState {
  if (game.deck.length === 0) {
    const allEmpty = game.players.every((p) => p.hand.length === 0)
    if (allEmpty) {
      return { ...game, gamePhase: "ended" }
    }
  }
  return game
}

// --- Initial state ---

function createInitialAppState(): AppState {
  return {
    game: {
      deck: [],
      board: [],
      players: [],
      currentPlayerIndex: 0,
      pendingPlacements: [],
      turnInProgress: false,
      lastTurnScore: null,
      gamePhase: "menu",
      gameMode: "classic",
      turnHistory: [],
      turnTimeLimit: null,
      hintsEnabled: false,
      customConfig: DEFAULT_CUSTOM_CONFIG,
      playerHand: [],
      score: 0,
      currentPlayer: 1,
    },
    selectedCardId: null,
    zoomLevel: 1.0,
    lastActionResult: null,
  }
}

// --- Reducer ---

export function gameReducer(state: AppState, action: GameAction): AppState {
  switch (action.type) {
    case "START_GAME": {
      const game = initializeGame(action.settings)
      return {
        ...state,
        game: syncLegacyFields(game),
        selectedCardId: null,
        lastActionResult: { type: "success", message: "Game started!" },
      }
    }

    case "SHOW_MENU": {
      return createInitialAppState()
    }

    case "SHOW_SETUP": {
      const initial = createInitialAppState()
      return {
        ...initial,
        game: { ...initial.game, gamePhase: "setup", gameMode: action.mode },
      }
    }

    case "RETURN_TO_SETUP": {
      const initial = createInitialAppState()
      return {
        ...initial,
        game: { ...initial.game, gamePhase: "setup" },
      }
    }

    case "SELECT_CARD": {
      const isDeselect = state.selectedCardId === action.cardId
      return {
        ...state,
        selectedCardId: isDeselect ? null : action.cardId,
        lastActionResult: null,
      }
    }

    case "DESELECT_CARD": {
      return {
        ...state,
        selectedCardId: null,
        lastActionResult: null,
      }
    }

    case "PLACE_CARD": {
      const { card, position } = action
      const newPending: PendingPlacement = {
        card: { ...card, id: `pending-${card.id}` },
        position,
      }

      const currentPlayer = state.game.players[state.game.currentPlayerIndex]
      const newHand = currentPlayer.hand.filter((c) => c.id !== card.id)
      const newPlayers = state.game.players.map((p, i) =>
        i === state.game.currentPlayerIndex ? { ...p, hand: newHand } : p
      )

      const newGame = {
        ...state.game,
        pendingPlacements: [...state.game.pendingPlacements, newPending],
        players: newPlayers,
        turnInProgress: true,
      }

      return {
        ...state,
        selectedCardId: null,
        game: syncLegacyFields(newGame),
        lastActionResult: null,
      }
    }

    case "UNDO_PLACEMENT": {
      if (state.game.pendingPlacements.length === 0) return state

      const lastPlacement = state.game.pendingPlacements[state.game.pendingPlacements.length - 1]
      const originalCard = {
        ...lastPlacement.card,
        id: lastPlacement.card.id.replace("pending-", ""),
      }

      const currentPlayer = state.game.players[state.game.currentPlayerIndex]
      const newHand = [...currentPlayer.hand, originalCard]
      const newPlayers = state.game.players.map((p, i) =>
        i === state.game.currentPlayerIndex ? { ...p, hand: newHand } : p
      )

      const newGame = {
        ...state.game,
        pendingPlacements: state.game.pendingPlacements.slice(0, -1),
        players: newPlayers,
        turnInProgress: state.game.pendingPlacements.length > 1,
      }

      return {
        ...state,
        game: syncLegacyFields(newGame),
        lastActionResult: { type: "info", message: "Placement undone" },
      }
    }

    case "COMPLETE_TURN": {
      if (state.game.pendingPlacements.length === 0) {
        return {
          ...state,
          lastActionResult: { type: "error", message: "You must place at least one card!" },
        }
      }

      // Validate contiguity — all placed cards must form a continuous line
      if (!arePlacementsContiguous(state.game.pendingPlacements, state.game.board)) {
        return {
          ...state,
          lastActionResult: {
            type: "error",
            message: "Cards must form a continuous line with no gaps!",
          },
        }
      }

      const points = calculateScore(state.game.pendingPlacements, state.game.board)
      const newBoard = [...state.game.board, ...state.game.pendingPlacements]
      const currentIdx = state.game.currentPlayerIndex
      const currentPlayer = state.game.players[currentIdx]

      const turnRecord: TurnRecord = {
        playerId: currentPlayer.id,
        placements: state.game.pendingPlacements,
        score: points,
      }

      // Update current player score
      let newPlayers = state.game.players.map((p, i) =>
        i === currentIdx ? { ...p, score: p.score + points } : p
      )

      let newGame: GameState = {
        ...state.game,
        board: newBoard,
        players: newPlayers,
        pendingPlacements: [],
        turnInProgress: false,
        lastTurnScore: points,
        turnHistory: [...state.game.turnHistory, turnRecord],
      }

      // Draw cards for current player
      newGame = drawCards(newGame, currentIdx)

      // Advance to next player
      newGame = advanceTurn(newGame)

      // Check game end
      newGame = checkGameEnd(newGame)

      const playerName = currentPlayer.type === "human" ? "You" : currentPlayer.name
      const message =
        newGame.gamePhase === "ended" ? `Game Over!` : `${playerName} scored ${points} points!`

      return {
        ...state,
        game: syncLegacyFields(newGame),
        lastActionResult: { type: "success", message },
      }
    }

    case "AI_TURN": {
      const { placements } = action
      if (placements.length === 0) {
        // AI passes (swap handled separately)
        const newGame = advanceTurn(state.game)
        return {
          ...state,
          game: syncLegacyFields(checkGameEnd(newGame)),
          lastActionResult: null,
        }
      }

      const pendingPlacements = placements.map((p) => ({
        ...p,
        card: { ...p.card, id: `pending-${p.card.id}` },
      }))

      const points = calculateScore(pendingPlacements, state.game.board)
      const newBoard = [...state.game.board, ...pendingPlacements]
      const currentIdx = state.game.currentPlayerIndex
      const currentPlayer = state.game.players[currentIdx]

      // Remove placed cards from AI hand
      const placedCardIds = new Set(placements.map((p) => p.card.id))
      const newHand = currentPlayer.hand.filter((c) => !placedCardIds.has(c.id))

      const turnRecord: TurnRecord = {
        playerId: currentPlayer.id,
        placements: pendingPlacements,
        score: points,
      }

      let newPlayers = state.game.players.map((p, i) =>
        i === currentIdx ? { ...p, hand: newHand, score: p.score + points } : p
      )

      let newGame: GameState = {
        ...state.game,
        board: newBoard,
        players: newPlayers,
        pendingPlacements: [],
        turnInProgress: false,
        lastTurnScore: points,
        turnHistory: [...state.game.turnHistory, turnRecord],
      }

      newGame = drawCards(newGame, currentIdx)
      newGame = advanceTurn(newGame)
      newGame = checkGameEnd(newGame)

      return {
        ...state,
        game: syncLegacyFields(newGame),
        lastActionResult: {
          type: "info",
          message: `${currentPlayer.name} scored ${points} points!`,
        },
      }
    }

    case "SWAP_CARDS": {
      const { cardIds } = action
      const currentIdx = state.game.currentPlayerIndex
      const currentPlayer = state.game.players[currentIdx]

      // Return selected cards to deck and shuffle
      const cardsToReturn = currentPlayer.hand.filter((c) => cardIds.includes(c.id))
      const remainingHand = currentPlayer.hand.filter((c) => !cardIds.includes(c.id))

      // Add returned cards to deck, draw same number
      let newDeck = shuffleDeck([...state.game.deck, ...cardsToReturn])

      const drawn = newDeck.slice(0, cardsToReturn.length)
      newDeck = newDeck.slice(cardsToReturn.length)
      const newHand = [...remainingHand, ...drawn]

      const turnRecord: TurnRecord = {
        playerId: currentPlayer.id,
        placements: [],
        score: 0,
      }

      const newPlayers = state.game.players.map((p, i) =>
        i === currentIdx ? { ...p, hand: newHand } : p
      )

      let newGame: GameState = {
        ...state.game,
        deck: newDeck,
        players: newPlayers,
        pendingPlacements: [],
        turnInProgress: false,
        lastTurnScore: 0,
        turnHistory: [...state.game.turnHistory, turnRecord],
      }

      newGame = advanceTurn(newGame)
      newGame = checkGameEnd(newGame)

      const playerName = currentPlayer.type === "human" ? "You" : currentPlayer.name
      return {
        ...state,
        selectedCardId: null,
        game: syncLegacyFields(newGame),
        lastActionResult: {
          type: "info",
          message: `${playerName} swapped ${cardsToReturn.length} card${cardsToReturn.length > 1 ? "s" : ""}`,
        },
      }
    }

    case "USE_SPECIAL": {
      const currentIdx = state.game.currentPlayerIndex
      const currentPlayer = state.game.players[currentIdx]
      const specialCard = currentPlayer.hand.find((c) => c.id === action.cardId)
      if (!specialCard || !("isSpecial" in specialCard) || !specialCard.isSpecial) {
        return { ...state, lastActionResult: { type: "error", message: "Not a special card" } }
      }

      const newHand = currentPlayer.hand.filter((c) => c.id !== action.cardId)
      let newBoard = [...state.game.board]
      let newPlayers = state.game.players.map((p, i) =>
        i === currentIdx ? { ...p, hand: newHand } : p
      )
      let message = ""

      switch (specialCard.specialType) {
        case "remove": {
          // Remove a card from the board at target position
          if (!action.targetPosition) {
            return { ...state, lastActionResult: { type: "error", message: "Select a board card to remove" } }
          }
          const { row, col } = action.targetPosition
          const targetIdx = newBoard.findIndex((p) => p.position.row === row && p.position.col === col)
          if (targetIdx === -1) {
            return { ...state, lastActionResult: { type: "error", message: "No card at that position" } }
          }
          newBoard = newBoard.filter((_, i) => i !== targetIdx)
          message = "Card removed from the board!"
          break
        }
        case "steal": {
          // Take a board card into your hand
          if (!action.targetPosition) {
            return { ...state, lastActionResult: { type: "error", message: "Select a board card to steal" } }
          }
          const { row, col } = action.targetPosition
          const targetCard = newBoard.find((p) => p.position.row === row && p.position.col === col)
          if (!targetCard) {
            return { ...state, lastActionResult: { type: "error", message: "No card at that position" } }
          }
          newBoard = newBoard.filter((p) => !(p.position.row === row && p.position.col === col))
          const stolenCard = { ...targetCard.card, id: targetCard.card.id.replace("pending-", "") }
          newPlayers = newPlayers.map((p, i) =>
            i === currentIdx ? { ...p, hand: [...p.hand, stolenCard] } : p
          )
          message = `Stole a card from the board!`
          break
        }
        case "swap": {
          // Swap a board card with one in your hand
          if (!action.targetPosition || !action.swapCardId) {
            return { ...state, lastActionResult: { type: "error", message: "Select a board card and hand card to swap" } }
          }
          const { row, col } = action.targetPosition
          const boardIdx = newBoard.findIndex((p) => p.position.row === row && p.position.col === col)
          if (boardIdx === -1) {
            return { ...state, lastActionResult: { type: "error", message: "No card at that position" } }
          }
          const player = newPlayers[currentIdx]
          const handCard = player.hand.find((c) => c.id === action.swapCardId)
          if (!handCard) {
            return { ...state, lastActionResult: { type: "error", message: "Card not in hand" } }
          }
          const removedBoardCard = newBoard[boardIdx].card
          newBoard[boardIdx] = { card: handCard, position: { row, col } }
          newPlayers = newPlayers.map((p, i) =>
            i === currentIdx
              ? { ...p, hand: p.hand.filter((c) => c.id !== action.swapCardId).concat(removedBoardCard) }
              : p
          )
          message = "Swapped a card!"
          break
        }
        case "mirror": {
          // Placed as a wild — it copies whatever is needed
          if (!action.targetPosition) {
            return { ...state, lastActionResult: { type: "error", message: "Select where to place the mirror" } }
          }
          // Place it as a wild card at the target position
          const mirrorCard: Card = {
            id: specialCard.id,
            number: 0 as CardNumber,
            color: "wild" as CardColor,
            shape: "wild" as CardShape,
            isWild: true,
          } as Card
          newBoard = [...newBoard, { card: mirrorCard, position: action.targetPosition }]
          message = "Mirror card placed — adapts to any pattern!"
          break
        }
        case "double": {
          // Placed on the board — the line it joins gets double score on next turn
          if (!action.targetPosition) {
            return { ...state, lastActionResult: { type: "error", message: "Select where to place the double card" } }
          }
          // Place as a wild with double marker
          const doubleCard: Card = {
            id: specialCard.id,
            number: 0 as CardNumber,
            color: "wild" as CardColor,
            shape: "wild" as CardShape,
            isWild: true,
          } as Card
          newBoard = [...newBoard, { card: doubleCard, position: action.targetPosition }]
          message = "Double card placed — line score doubled!"
          break
        }
        default:
          return { ...state, lastActionResult: { type: "error", message: "Unknown special card type" } }
      }

      const newGame = {
        ...state.game,
        board: newBoard,
        players: newPlayers,
        turnInProgress: true,
      }

      return {
        ...state,
        selectedCardId: null,
        game: syncLegacyFields(newGame),
        lastActionResult: { type: "success" as const, message },
      }
    }

    case "SET_ZOOM": {
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

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
