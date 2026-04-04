import { describe, it, expect } from 'vitest'
import { gameReducer, AppState } from '../GameContext'
import { Card, GameState } from '../../types/game'

function card(
  number: Card['number'],
  color: Card['color'],
  shape: Card['shape'],
  id = `test-${number}-${color}-${shape}`
): Card {
  return { id, number, color, shape }
}

function createTestState(overrides: Partial<GameState> = {}): AppState {
  return {
    game: {
      deck: [
        card(4, 'yellow', 'cross', 'deck-1'),
        card(3, 'blue', 'circle', 'deck-2'),
        card(2, 'green', 'square', 'deck-3'),
        card(1, 'red', 'triangle', 'deck-4'),
      ],
      playerHand: [
        card(1, 'red', 'triangle', 'hand-1'),
        card(2, 'green', 'square', 'hand-2'),
        card(3, 'blue', 'circle', 'hand-3'),
        card(4, 'yellow', 'cross', 'hand-4'),
      ],
      board: [
        { card: card(1, 'red', 'circle', 'board-1'), position: { row: 0, col: 0 } },
      ],
      currentPlayer: 1,
      score: 0,
      pendingPlacements: [],
      turnInProgress: false,
      lastTurnScore: null,
      ...overrides,
    },
    selectedCardId: null,
    zoomLevel: 1.0,
    lastActionResult: null,
  }
}

describe('gameReducer', () => {
  describe('NEW_GAME', () => {
    it('resets game state', () => {
      const state = createTestState({ score: 50 })
      const next = gameReducer(state, { type: 'NEW_GAME' })
      expect(next.game.score).toBe(0)
      expect(next.game.playerHand).toHaveLength(4)
      expect(next.game.board).toHaveLength(1)
      expect(next.selectedCardId).toBeNull()
    })

    it('preserves zoom level', () => {
      const state = createTestState()
      state.zoomLevel = 2.5
      const next = gameReducer(state, { type: 'NEW_GAME' })
      expect(next.zoomLevel).toBe(2.5)
    })
  })

  describe('SELECT_CARD', () => {
    it('selects a card', () => {
      const state = createTestState()
      const next = gameReducer(state, { type: 'SELECT_CARD', cardId: 'hand-1' })
      expect(next.selectedCardId).toBe('hand-1')
    })

    it('deselects when selecting the same card', () => {
      const state = createTestState()
      state.selectedCardId = 'hand-1'
      const next = gameReducer(state, { type: 'SELECT_CARD', cardId: 'hand-1' })
      expect(next.selectedCardId).toBeNull()
    })

    it('switches to a different card', () => {
      const state = createTestState()
      state.selectedCardId = 'hand-1'
      const next = gameReducer(state, { type: 'SELECT_CARD', cardId: 'hand-2' })
      expect(next.selectedCardId).toBe('hand-2')
    })
  })

  describe('PLACE_CARD', () => {
    it('adds card to pending placements', () => {
      const state = createTestState()
      const cardToPlace = state.game.playerHand[0]
      const next = gameReducer(state, {
        type: 'PLACE_CARD',
        card: cardToPlace,
        position: { row: 0, col: 1 },
      })
      expect(next.game.pendingPlacements).toHaveLength(1)
      expect(next.game.pendingPlacements[0].position).toEqual({ row: 0, col: 1 })
    })

    it('removes card from player hand', () => {
      const state = createTestState()
      const cardToPlace = state.game.playerHand[0]
      const next = gameReducer(state, {
        type: 'PLACE_CARD',
        card: cardToPlace,
        position: { row: 0, col: 1 },
      })
      expect(next.game.playerHand).toHaveLength(3)
      expect(next.game.playerHand.find(c => c.id === cardToPlace.id)).toBeUndefined()
    })

    it('sets turnInProgress to true', () => {
      const state = createTestState()
      const next = gameReducer(state, {
        type: 'PLACE_CARD',
        card: state.game.playerHand[0],
        position: { row: 0, col: 1 },
      })
      expect(next.game.turnInProgress).toBe(true)
    })

    it('clears selected card', () => {
      const state = createTestState()
      state.selectedCardId = 'hand-1'
      const next = gameReducer(state, {
        type: 'PLACE_CARD',
        card: state.game.playerHand[0],
        position: { row: 0, col: 1 },
      })
      expect(next.selectedCardId).toBeNull()
    })
  })

  describe('UNDO_PLACEMENT', () => {
    it('returns last placed card to hand', () => {
      let state = createTestState()
      const cardToPlace = state.game.playerHand[0]
      state = gameReducer(state, {
        type: 'PLACE_CARD',
        card: cardToPlace,
        position: { row: 0, col: 1 },
      })
      expect(state.game.playerHand).toHaveLength(3)

      state = gameReducer(state, { type: 'UNDO_PLACEMENT' })
      expect(state.game.playerHand).toHaveLength(4)
      expect(state.game.pendingPlacements).toHaveLength(0)
    })

    it('does nothing when no pending placements', () => {
      const state = createTestState()
      const next = gameReducer(state, { type: 'UNDO_PLACEMENT' })
      expect(next).toBe(state)
    })

    it('sets turnInProgress false when last placement undone', () => {
      let state = createTestState()
      state = gameReducer(state, {
        type: 'PLACE_CARD',
        card: state.game.playerHand[0],
        position: { row: 0, col: 1 },
      })
      expect(state.game.turnInProgress).toBe(true)

      state = gameReducer(state, { type: 'UNDO_PLACEMENT' })
      expect(state.game.turnInProgress).toBe(false)
    })
  })

  describe('COMPLETE_TURN', () => {
    it('returns error when no pending placements', () => {
      const state = createTestState()
      const next = gameReducer(state, { type: 'COMPLETE_TURN' })
      expect(next.lastActionResult?.type).toBe('error')
    })

    it('moves pending placements to board', () => {
      let state = createTestState()
      state = gameReducer(state, {
        type: 'PLACE_CARD',
        card: state.game.playerHand[0],
        position: { row: 0, col: 1 },
      })
      state = gameReducer(state, { type: 'COMPLETE_TURN' })
      expect(state.game.board).toHaveLength(2)
      expect(state.game.pendingPlacements).toHaveLength(0)
    })

    it('draws new cards from deck', () => {
      let state = createTestState()
      state = gameReducer(state, {
        type: 'PLACE_CARD',
        card: state.game.playerHand[0],
        position: { row: 0, col: 1 },
      })
      const deckBefore = state.game.deck.length
      state = gameReducer(state, { type: 'COMPLETE_TURN' })
      expect(state.game.playerHand).toHaveLength(4)
      expect(state.game.deck.length).toBe(deckBefore - 1)
    })

    it('updates score', () => {
      let state = createTestState()
      state = gameReducer(state, {
        type: 'PLACE_CARD',
        card: state.game.playerHand[0],
        position: { row: 0, col: 1 },
      })
      state = gameReducer(state, { type: 'COMPLETE_TURN' })
      expect(state.game.score).toBeGreaterThan(0)
    })

    it('sets turnInProgress to false', () => {
      let state = createTestState()
      state = gameReducer(state, {
        type: 'PLACE_CARD',
        card: state.game.playerHand[0],
        position: { row: 0, col: 1 },
      })
      state = gameReducer(state, { type: 'COMPLETE_TURN' })
      expect(state.game.turnInProgress).toBe(false)
    })
  })

  describe('SET_ZOOM', () => {
    it('updates zoom level', () => {
      const state = createTestState()
      const next = gameReducer(state, { type: 'SET_ZOOM', zoom: 2.0 })
      expect(next.zoomLevel).toBe(2.0)
    })
  })
})
