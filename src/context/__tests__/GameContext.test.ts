import { describe, it, expect } from "vitest"
import { gameReducer, AppState } from "../GameContext"
import { Card, GameState, GameSettings, Player } from "../../types/game"

function card(
  number: Card["number"],
  color: Card["color"],
  shape: Card["shape"],
  id = `test-${number}-${color}-${shape}`
): Card {
  return { id, number, color, shape }
}

function createTestPlayers(): Player[] {
  return [
    {
      id: "player-0",
      name: "You",
      type: "human",
      hand: [
        card(1, "red", "triangle", "hand-1"),
        card(2, "green", "square", "hand-2"),
        card(3, "blue", "circle", "hand-3"),
        card(4, "yellow", "cross", "hand-4"),
      ],
      score: 0,
    },
    {
      id: "player-1",
      name: "Dot",
      type: "ai",
      difficulty: "medium",
      hand: [
        card(1, "green", "square", "ai-1"),
        card(2, "blue", "circle", "ai-2"),
        card(3, "yellow", "cross", "ai-3"),
        card(4, "red", "triangle", "ai-4"),
      ],
      score: 0,
    },
  ]
}

function createTestState(overrides: Partial<GameState> = {}): AppState {
  const players = createTestPlayers()
  return {
    game: {
      deck: [
        card(4, "yellow", "cross", "deck-1"),
        card(3, "blue", "circle", "deck-2"),
        card(2, "green", "square", "deck-3"),
        card(1, "red", "triangle", "deck-4"),
      ],
      board: [{ card: card(1, "red", "circle", "board-1"), position: { row: 0, col: 0 } }],
      players,
      currentPlayerIndex: 0,
      pendingPlacements: [],
      turnInProgress: false,
      lastTurnScore: null,
      gamePhase: "playing",
      gameMode: "classic",
      turnHistory: [],
      turnTimeLimit: null,
      hintsEnabled: false,
      customConfig: { size: 4, wildCount: 2, specialCards: { remove: 0, steal: 0, swap: 0 }, handSize: 4 },
      // Legacy compat
      playerHand: players[0].hand,
      score: players[0].score,
      currentPlayer: 1,
      ...overrides,
    },
    selectedCardId: null,
    zoomLevel: 1.0,
    lastActionResult: null,
  }
}

describe("gameReducer", () => {
  describe("START_GAME", () => {
    it("initializes game with correct player count", () => {
      const settings: GameSettings = {
        playerCount: 2,
        aiPlayers: [{ name: "Dot", difficulty: "medium" }],
        mode: "classic",
      }
      const state = createTestState()
      state.game.gamePhase = "setup"

      const next = gameReducer(state, { type: "START_GAME", settings })
      expect(next.game.gamePhase).toBe("playing")
      expect(next.game.players).toHaveLength(2)
      expect(next.game.players[0].type).toBe("human")
      expect(next.game.players[1].type).toBe("ai")
      expect(next.game.players[1].difficulty).toBe("medium")
    })

    it("deals 4 cards to each player", () => {
      const settings: GameSettings = {
        playerCount: 3,
        aiPlayers: [
          { name: "Dot", difficulty: "easy" },
          { name: "Dash", difficulty: "hard" },
        ],
        mode: "classic",
      }
      const state = createTestState()
      const next = gameReducer(state, { type: "START_GAME", settings })
      next.game.players.forEach((p) => {
        expect(p.hand).toHaveLength(4)
      })
    })

    it("places initial card on board", () => {
      const settings: GameSettings = {
        playerCount: 2,
        aiPlayers: [{ name: "Dot", difficulty: "easy" }],
        mode: "classic",
      }
      const state = createTestState()
      const next = gameReducer(state, { type: "START_GAME", settings })
      expect(next.game.board).toHaveLength(1)
      expect(next.game.board[0].position).toEqual({ row: 0, col: 0 })
    })
  })

  describe("RETURN_TO_SETUP", () => {
    it("resets to setup phase", () => {
      const state = createTestState()
      const next = gameReducer(state, { type: "RETURN_TO_SETUP" })
      expect(next.game.gamePhase).toBe("setup")
      expect(next.game.players).toHaveLength(0)
    })
  })

  describe("SELECT_CARD", () => {
    it("selects a card", () => {
      const state = createTestState()
      const next = gameReducer(state, { type: "SELECT_CARD", cardId: "hand-1" })
      expect(next.selectedCardId).toBe("hand-1")
    })

    it("deselects when selecting the same card", () => {
      const state = createTestState()
      state.selectedCardId = "hand-1"
      const next = gameReducer(state, { type: "SELECT_CARD", cardId: "hand-1" })
      expect(next.selectedCardId).toBeNull()
    })
  })

  describe("PLACE_CARD", () => {
    it("adds card to pending placements", () => {
      const state = createTestState()
      const cardToPlace = state.game.players[0].hand[0]
      const next = gameReducer(state, {
        type: "PLACE_CARD",
        card: cardToPlace,
        position: { row: 0, col: 1 },
      })
      expect(next.game.pendingPlacements).toHaveLength(1)
    })

    it("removes card from current player hand", () => {
      const state = createTestState()
      const cardToPlace = state.game.players[0].hand[0]
      const next = gameReducer(state, {
        type: "PLACE_CARD",
        card: cardToPlace,
        position: { row: 0, col: 1 },
      })
      expect(next.game.players[0].hand).toHaveLength(3)
    })

    it("sets turnInProgress to true", () => {
      const state = createTestState()
      const next = gameReducer(state, {
        type: "PLACE_CARD",
        card: state.game.players[0].hand[0],
        position: { row: 0, col: 1 },
      })
      expect(next.game.turnInProgress).toBe(true)
    })
  })

  describe("UNDO_PLACEMENT", () => {
    it("returns card to current player hand", () => {
      let state = createTestState()
      const cardToPlace = state.game.players[0].hand[0]
      state = gameReducer(state, {
        type: "PLACE_CARD",
        card: cardToPlace,
        position: { row: 0, col: 1 },
      })
      state = gameReducer(state, { type: "UNDO_PLACEMENT" })
      expect(state.game.players[0].hand).toHaveLength(4)
      expect(state.game.pendingPlacements).toHaveLength(0)
    })

    it("does nothing when no pending", () => {
      const state = createTestState()
      const next = gameReducer(state, { type: "UNDO_PLACEMENT" })
      expect(next).toBe(state)
    })
  })

  describe("COMPLETE_TURN", () => {
    it("returns error when no pending", () => {
      const state = createTestState()
      const next = gameReducer(state, { type: "COMPLETE_TURN" })
      expect(next.lastActionResult?.type).toBe("error")
    })

    it("moves pending to board and advances turn", () => {
      let state = createTestState()
      state = gameReducer(state, {
        type: "PLACE_CARD",
        card: state.game.players[0].hand[0],
        position: { row: 0, col: 1 },
      })
      state = gameReducer(state, { type: "COMPLETE_TURN" })
      expect(state.game.board).toHaveLength(2)
      expect(state.game.pendingPlacements).toHaveLength(0)
      expect(state.game.currentPlayerIndex).toBe(1) // advanced to AI
    })

    it("updates player score", () => {
      let state = createTestState()
      state = gameReducer(state, {
        type: "PLACE_CARD",
        card: state.game.players[0].hand[0],
        position: { row: 0, col: 1 },
      })
      state = gameReducer(state, { type: "COMPLETE_TURN" })
      expect(state.game.players[0].score).toBeGreaterThan(0)
    })

    it("records turn in history", () => {
      let state = createTestState()
      state = gameReducer(state, {
        type: "PLACE_CARD",
        card: state.game.players[0].hand[0],
        position: { row: 0, col: 1 },
      })
      state = gameReducer(state, { type: "COMPLETE_TURN" })
      expect(state.game.turnHistory).toHaveLength(1)
      expect(state.game.turnHistory[0].playerId).toBe("player-0")
    })
  })

  describe("AI_TURN", () => {
    it("places cards, scores, and advances", () => {
      let state = createTestState()
      // Set current to AI player
      state.game.currentPlayerIndex = 1

      const aiCard = state.game.players[1].hand[0]
      state = gameReducer(state, {
        type: "AI_TURN",
        placements: [{ card: aiCard, position: { row: 0, col: 1 } }],
      })
      expect(state.game.board).toHaveLength(2)
      expect(state.game.players[1].score).toBeGreaterThan(0)
      expect(state.game.currentPlayerIndex).toBe(0) // back to human
      expect(state.game.turnHistory).toHaveLength(1)
    })

    it("handles empty placements (pass)", () => {
      let state = createTestState()
      state.game.currentPlayerIndex = 1
      state = gameReducer(state, { type: "AI_TURN", placements: [] })
      expect(state.game.currentPlayerIndex).toBe(0)
    })
  })

  describe("SWAP_CARDS", () => {
    it("swaps cards and advances turn", () => {
      let state = createTestState()
      const cardId = state.game.players[0].hand[0].id
      state = gameReducer(state, { type: "SWAP_CARDS", cardIds: [cardId] })
      expect(state.game.players[0].hand).toHaveLength(4)
      expect(state.game.currentPlayerIndex).toBe(1)
      expect(state.game.lastTurnScore).toBe(0)
      expect(state.game.turnHistory).toHaveLength(1)
    })
  })

  describe("SET_ZOOM", () => {
    it("updates zoom level", () => {
      const state = createTestState()
      const next = gameReducer(state, { type: "SET_ZOOM", zoom: 2.0 })
      expect(next.zoomLevel).toBe(2.0)
    })
  })
})
