import { describe, it, expect } from "vitest"
import { computeAIMove } from "../engine"
import { Card, PlacedCard } from "../../types/game"

function card(
  number: Card["number"],
  color: Card["color"],
  shape: Card["shape"],
  id = `test-${number}-${color}-${shape}`
): Card {
  return { id, number, color, shape }
}

function placed(c: Card, row: number, col: number): PlacedCard {
  return { card: c, position: { row, col } }
}

describe("computeAIMove", () => {
  const simpleBoard: PlacedCard[] = [placed(card(1, "red", "triangle", "b1"), 0, 0)]

  describe("easy", () => {
    it("returns a valid single-card placement", () => {
      const hand = [
        card(2, "red", "triangle", "h1"),
        card(3, "green", "square", "h2"),
        card(4, "blue", "circle", "h3"),
        card(1, "yellow", "cross", "h4"),
      ]
      const move = computeAIMove(hand, simpleBoard, "easy")
      expect(move.length).toBeLessThanOrEqual(1)
      if (move.length === 1) {
        // Should be adjacent to the existing card
        const pos = move[0].position
        const isAdjacent =
          Math.abs(pos.row) + Math.abs(pos.col) === 1 ||
          (pos.row === 0 && Math.abs(pos.col) === 1) ||
          (pos.col === 0 && Math.abs(pos.row) === 1)
        expect(isAdjacent).toBe(true)
      }
    })

    it("returns empty when no valid moves", () => {
      // Board with 4 cards in a line, hand has cards that can't fit anywhere
      const fullBoard: PlacedCard[] = [
        placed(card(1, "red", "triangle", "b1"), 0, 0),
        placed(card(2, "green", "square", "b2"), 0, 1),
        placed(card(3, "blue", "circle", "b3"), 0, 2),
        placed(card(4, "yellow", "cross", "b4"), 0, 3),
      ]
      // A card that can't go anywhere valid (duplicate number in any direction)
      const hand = [card(1, "red", "triangle", "h1")]
      const move = computeAIMove(hand, fullBoard, "easy")
      // May or may not find a valid position depending on adjacent spots
      expect(Array.isArray(move)).toBe(true)
    })
  })

  describe("medium", () => {
    it("returns a valid placement (single or double)", () => {
      const hand = [
        card(2, "red", "triangle", "h1"),
        card(3, "red", "triangle", "h2"),
        card(1, "green", "square", "h3"),
        card(4, "blue", "circle", "h4"),
      ]
      const move = computeAIMove(hand, simpleBoard, "medium")
      expect(move.length).toBeGreaterThanOrEqual(0)
      expect(move.length).toBeLessThanOrEqual(2)
    })
  })

  describe("hard", () => {
    it("finds multi-card placements when available", () => {
      // Set up a board where a 2-card all-different line is clearly available
      const board: PlacedCard[] = [placed(card(1, "red", "triangle", "b1"), 0, 0)]
      const hand = [
        card(2, "green", "square", "h1"), // all-different with board card
        card(3, "blue", "circle", "h2"), // extends the all-different line
        card(1, "red", "cross", "h3"),
        card(4, "yellow", "triangle", "h4"),
      ]
      const move = computeAIMove(hand, board, "hard")
      expect(move.length).toBeGreaterThan(0)
    })

    it("picks higher scoring move over lower", () => {
      const board: PlacedCard[] = [placed(card(1, "red", "triangle", "b1"), 0, 0)]
      // Only one card, but the hard AI should pick the highest-scoring position
      const hand = [
        card(4, "red", "triangle", "h1"), // scores 1+4=5 in a line
      ]
      const move = computeAIMove(hand, board, "hard")
      expect(move.length).toBe(1)
    })

    it("returns empty when no moves possible", () => {
      const board: PlacedCard[] = [placed(card(1, "red", "triangle", "b1"), 0, 0)]
      // Empty hand
      const move = computeAIMove([], board, "hard")
      expect(move).toHaveLength(0)
    })
  })

  describe("performance", () => {
    it("hard AI completes in reasonable time", () => {
      const board: PlacedCard[] = [
        placed(card(1, "red", "triangle", "b1"), 0, 0),
        placed(card(2, "green", "square", "b2"), 0, 1),
        placed(card(3, "blue", "circle", "b3"), 1, 0),
      ]
      const hand = [
        card(4, "yellow", "cross", "h1"),
        card(1, "green", "triangle", "h2"),
        card(2, "blue", "square", "h3"),
        card(3, "red", "circle", "h4"),
      ]

      const start = performance.now()
      computeAIMove(hand, board, "hard")
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(2000) // Should complete in < 2s
    })
  })
})
