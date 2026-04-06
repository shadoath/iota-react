import { describe, it, expect } from "vitest"
import {
  createDeck,
  shuffleDeck,
  getAdjacentPositions,
  getValidPlacements,
  isValidPlacement,
  getCardsInLine,
  getAdjacentCards,
  calculateScore,
} from "../gameLogic"
import { Card, PlacedCard, GridPosition } from "../../types/game"

// Helper to create a card quickly
function card(
  number: Card["number"],
  color: Card["color"],
  shape: Card["shape"],
  id = `test-${number}-${color}-${shape}`
): Card {
  return { id, number, color, shape }
}

// Helper to create a wild card
function wildCard(id = "wild-test"): Card {
  return {
    id,
    number: 0 as Card["number"],
    color: "wild" as Card["color"],
    shape: "wild" as Card["shape"],
    isWild: true,
  }
}

// Helper to place a card on the board
function placed(c: Card, row: number, col: number): PlacedCard {
  return { card: c, position: { row, col } }
}

describe("createDeck", () => {
  it("returns 66 cards total", () => {
    const deck = createDeck()
    expect(deck).toHaveLength(66)
  })

  it("contains all 64 unique combinations of number × color × shape", () => {
    const deck = createDeck()
    const numbers = [1, 2, 3, 4] as const
    const colors = ["red", "green", "blue", "yellow"] as const
    const shapes = ["triangle", "square", "circle", "cross"] as const

    for (const number of numbers) {
      for (const color of colors) {
        for (const shape of shapes) {
          const found = deck.some(
            (c) => c.number === number && c.color === color && c.shape === shape
          )
          expect(found, `Missing card: ${number} ${color} ${shape}`).toBe(true)
        }
      }
    }
  })

  it("has unique IDs for all cards", () => {
    const deck = createDeck()
    const ids = new Set(deck.map((c) => c.id))
    expect(ids.size).toBe(66)
  })
})

describe("shuffleDeck", () => {
  it("returns the same number of cards", () => {
    const deck = createDeck()
    const shuffled = shuffleDeck(deck)
    expect(shuffled).toHaveLength(deck.length)
  })

  it("contains the same cards (possibly in different order)", () => {
    const deck = createDeck()
    const shuffled = shuffleDeck(deck)
    const sortById = (a: Card, b: Card) => a.id.localeCompare(b.id)
    expect([...shuffled].sort(sortById)).toEqual([...deck].sort(sortById))
  })

  it("does not mutate the original deck", () => {
    const deck = createDeck()
    const original = [...deck]
    shuffleDeck(deck)
    expect(deck).toEqual(original)
  })
})

describe("getAdjacentPositions", () => {
  it("returns 4 orthogonal neighbors", () => {
    const positions = getAdjacentPositions({ row: 5, col: 3 })
    expect(positions).toHaveLength(4)
    expect(positions).toContainEqual({ row: 4, col: 3 }) // top
    expect(positions).toContainEqual({ row: 6, col: 3 }) // bottom
    expect(positions).toContainEqual({ row: 5, col: 2 }) // left
    expect(positions).toContainEqual({ row: 5, col: 4 }) // right
  })

  it("works with origin", () => {
    const positions = getAdjacentPositions({ row: 0, col: 0 })
    expect(positions).toContainEqual({ row: -1, col: 0 })
    expect(positions).toContainEqual({ row: 1, col: 0 })
    expect(positions).toContainEqual({ row: 0, col: -1 })
    expect(positions).toContainEqual({ row: 0, col: 1 })
  })

  it("works with negative coordinates", () => {
    const positions = getAdjacentPositions({ row: -2, col: -3 })
    expect(positions).toHaveLength(4)
    expect(positions).toContainEqual({ row: -3, col: -3 })
    expect(positions).toContainEqual({ row: -1, col: -3 })
  })
})

describe("getValidPlacements", () => {
  it("returns origin for empty board", () => {
    const positions = getValidPlacements([])
    expect(positions).toEqual([{ row: 0, col: 0 }])
  })

  it("returns adjacent positions for a single card", () => {
    const board: PlacedCard[] = [placed(card(1, "red", "triangle"), 0, 0)]
    const positions = getValidPlacements(board)
    expect(positions).toHaveLength(4)
    expect(positions).toContainEqual({ row: -1, col: 0 })
    expect(positions).toContainEqual({ row: 1, col: 0 })
    expect(positions).toContainEqual({ row: 0, col: -1 })
    expect(positions).toContainEqual({ row: 0, col: 1 })
  })

  it("does not include occupied positions", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "red", "triangle"), 0, 1),
    ]
    const positions = getValidPlacements(board)
    const occupied = positions.some((p) => p.row === 0 && p.col === 0)
    expect(occupied).toBe(false)
  })

  it("constrains to same row when pending placements are in a row", () => {
    const board: PlacedCard[] = [placed(card(1, "red", "triangle"), 0, 0)]
    const pending: PlacedCard[] = [
      placed(card(2, "green", "square"), 0, 1),
      placed(card(3, "blue", "circle"), 0, 2),
    ]
    const positions = getValidPlacements(board, pending)
    // All positions should be in row 0
    positions.forEach((p) => {
      expect(p.row).toBe(0)
    })
  })

  it("constrains to same column when pending placements are in a column", () => {
    const board: PlacedCard[] = [placed(card(1, "red", "triangle"), 0, 0)]
    const pending: PlacedCard[] = [
      placed(card(2, "green", "square"), 1, 0),
      placed(card(3, "blue", "circle"), 2, 0),
    ]
    const positions = getValidPlacements(board, pending)
    positions.forEach((p) => {
      expect(p.col).toBe(0)
    })
  })

  it("allows same row or column with single pending placement", () => {
    const board: PlacedCard[] = [placed(card(1, "red", "triangle"), 0, 0)]
    const pending: PlacedCard[] = [placed(card(2, "green", "square"), 0, 1)]
    const positions = getValidPlacements(board, pending)
    // Should allow both row 0 and col 1
    const hasRow0 = positions.some((p) => p.row === 0)
    const hasCol1 = positions.some((p) => p.col === 1)
    expect(hasRow0).toBe(true)
    expect(hasCol1).toBe(true)
  })
})

describe("getCardsInLine", () => {
  it("returns empty array for isolated position", () => {
    const board: PlacedCard[] = [placed(card(1, "red", "triangle"), 0, 0)]
    const line = getCardsInLine({ row: 2, col: 2 }, board, "horizontal")
    expect(line).toHaveLength(0)
  })

  it("finds horizontal line of cards", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 0, 1),
      placed(card(3, "blue", "circle"), 0, 2),
    ]
    const line = getCardsInLine({ row: 0, col: 0 }, board, "horizontal")
    expect(line).toHaveLength(3)
  })

  it("finds vertical line of cards", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 1, 0),
      placed(card(3, "blue", "circle"), 2, 0),
    ]
    const line = getCardsInLine({ row: 0, col: 0 }, board, "vertical")
    expect(line).toHaveLength(3)
  })

  it("stops at gaps", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 0, 1),
      // gap at 0,2
      placed(card(3, "blue", "circle"), 0, 3),
    ]
    const line = getCardsInLine({ row: 0, col: 0 }, board, "horizontal")
    expect(line).toHaveLength(2)
  })

  it("does not include cards from perpendicular direction", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 0, 1),
      placed(card(3, "blue", "circle"), 1, 0), // below, not in horizontal line
    ]
    const line = getCardsInLine({ row: 0, col: 0 }, board, "horizontal")
    expect(line).toHaveLength(2)
  })

  it("includes the card at the queried position", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 0, 1),
    ]
    // Query from position (0,0) which has a card
    const line = getCardsInLine({ row: 0, col: 0 }, board, "horizontal")
    expect(line.some((p) => p.card.number === 1)).toBe(true)
  })

  it("works from empty position between cards", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 0, 2),
    ]
    // Query from gap at (0,1) — no card there, and gap means no contiguous line
    const line = getCardsInLine({ row: 0, col: 1 }, board, "horizontal")
    // Position (0,1) has no card, so it finds cards in both directions from that empty spot
    expect(line).toHaveLength(2)
  })
})

describe("getAdjacentCards", () => {
  it("returns empty for isolated position", () => {
    const board: PlacedCard[] = [placed(card(1, "red", "triangle"), 0, 0)]
    expect(getAdjacentCards({ row: 5, col: 5 }, board)).toHaveLength(0)
  })

  it("finds all adjacent cards", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 0, 2),
      placed(card(3, "blue", "circle"), -1, 1),
      placed(card(4, "yellow", "cross"), 1, 1),
    ]
    // Position (0,1) is adjacent to all four
    const adjacent = getAdjacentCards({ row: 0, col: 1 }, board)
    expect(adjacent).toHaveLength(4)
  })

  it("does not include diagonal cards", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 1, 1), // diagonal
    ]
    const adjacent = getAdjacentCards({ row: 0, col: 0 }, board)
    expect(adjacent).toHaveLength(0)
  })
})

describe("isValidPlacement", () => {
  it("allows placing adjacent to existing card with compatible attributes", () => {
    const board: PlacedCard[] = [placed(card(1, "red", "triangle"), 0, 0)]
    // Same color and shape, different number → valid
    const testCard = card(2, "red", "triangle")
    expect(isValidPlacement(testCard, { row: 0, col: 1 }, board)).toBe(true)
  })

  it("rejects placement not adjacent to any card", () => {
    const board: PlacedCard[] = [placed(card(1, "red", "triangle"), 0, 0)]
    const testCard = card(2, "green", "square")
    expect(isValidPlacement(testCard, { row: 5, col: 5 }, board)).toBe(false)
  })

  it("rejects placement that breaks all-same-or-all-different rule", () => {
    // Line: red-1-triangle, green-2-square → all different
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 0, 1),
    ]
    // Placing red-3-circle at (0,2): colors would be red,green,red → NOT all same, NOT all different
    const testCard = card(3, "red", "circle")
    expect(isValidPlacement(testCard, { row: 0, col: 2 }, board)).toBe(false)
  })

  it("allows placement that continues all-different pattern", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 0, 1),
    ]
    // All different: 3, blue, circle
    const testCard = card(3, "blue", "circle")
    expect(isValidPlacement(testCard, { row: 0, col: 2 }, board)).toBe(true)
  })

  it("allows placement that continues all-same pattern", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(1, "red", "triangle", "dup"), 0, 1),
    ]
    // All same: 1, red, triangle
    const testCard = card(1, "red", "triangle", "dup2")
    expect(isValidPlacement(testCard, { row: 0, col: 2 }, board)).toBe(true)
  })

  it("validates both horizontal and vertical lines", () => {
    // Build an L shape
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "red", "triangle"), 0, 1),
      placed(card(2, "green", "square"), 1, 0),
    ]
    // Placing at (1,1) creates:
    //   horizontal line: (1,0)=2-green-square, (1,1)=?
    //   vertical line: (0,1)=2-red-triangle, (1,1)=?
    // For both lines to be valid with a single card requires careful selection
    // Let's try 2-blue-circle:
    //   horiz: [2-green-square, 2-blue-circle] → numbers same(2), colors diff, shapes diff ✓
    //   vert: [2-red-triangle, 2-blue-circle] → numbers same(2), colors diff, shapes diff ✓
    const testCard = card(2, "blue", "circle")
    expect(isValidPlacement(testCard, { row: 1, col: 1 }, board)).toBe(true)
  })

  it("rejects when horizontal valid but vertical invalid", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "red", "triangle"), 0, 1),
      placed(card(3, "green", "square"), 1, 0),
    ]
    // At (1,1): vert line with (0,1)=2-red-triangle → need compatible
    // 3-red-triangle: horiz [3-green-square, 3-red-triangle] colors diff, shapes diff, numbers same ✓
    //                  vert [2-red-triangle, 3-red-triangle] numbers diff, colors same, shapes same ✓
    // Actually that works. Let me find one that fails vertically.
    // At (1,1): vert with (0,1)=2-red-triangle
    // Try 3-green-square: vert [2-red-triangle, 3-green-square] all diff ✓
    //                      horiz [3-green-square, 3-green-square] wait that's same card name but different position
    // Let me use a simpler test case
    const board2: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(1, "red", "square"), 0, 1), // horiz: numbers same(1), colors same(red), shapes diff
      placed(card(2, "green", "square"), 1, 0),
    ]
    // At (1,1): horiz with (1,0)=2-green-square → needs number/color/shape compat
    //            vert with (0,1)=1-red-square → needs compat
    // Try 1-green-square: horiz [2-green-square, 1-green-square] nums diff, colors same, shapes same ✓
    //                      vert [1-red-square, 1-green-square] nums same, colors diff, shapes same ✓
    // That works too. Let me construct a real failing case.
    const board3: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "red", "triangle"), 0, 1), // horiz: numbers diff, colors same, shapes same
      placed(card(1, "red", "square"), 1, 0), // starting a vert at col 0
    ]
    // At (1,1): vert with (0,1)=2-red-triangle
    //           horiz with (1,0)=1-red-square
    // Try 2-red-square: horiz [1-red-square, 2-red-square] nums diff, colors same, shapes same ✓
    //                    vert [2-red-triangle, 2-red-square] nums same, colors same, shapes diff ✓
    // Also works. It's hard to make it fail both. Let me be more direct.
    const board4: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(1, "green", "triangle"), 0, 1), // horiz: nums same(1), colors diff, shapes same(triangle)
      placed(card(2, "red", "triangle"), 1, 0),
    ]
    // At (1,1): vert with (0,1)=1-green-triangle
    //           horiz with (1,0)=2-red-triangle
    // Try 2-green-triangle: horiz [2-red-tri, 2-green-tri] nums same, colors diff, shapes same ✓
    //                         vert [1-green-tri, 2-green-tri] nums diff, colors same, shapes same ✓
    // Need a case where vert line has 2+ cards with conflicting requirements.
    const board5: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 1),
      placed(card(2, "green", "square"), 1, 1), // vert: all diff
      placed(card(3, "blue", "circle"), 2, 0), // horiz at row 2
    ]
    // At (2,1): vert with (0,1),(1,1) → all different pattern (1-red-tri, 2-green-sq) → need 3-blue-circle
    //           horiz with (2,0)=3-blue-circle
    // Try 3-blue-triangle: vert [1-red-tri, 2-green-sq, 3-blue-triangle] nums all-diff ✓, colors all-diff ✓, shapes: tri,sq,tri NOT valid
    const testCard = card(3, "blue", "triangle")
    expect(isValidPlacement(testCard, { row: 2, col: 1 }, board5)).toBe(false)
  })
})

describe("calculateScore", () => {
  it("scores a single isolated placement by card number", () => {
    const board: PlacedCard[] = []
    const placements: PlacedCard[] = [placed(card(3, "red", "triangle"), 0, 0)]
    expect(calculateScore(placements, board)).toBe(3)
  })

  it("scores a line by summing card numbers", () => {
    const board: PlacedCard[] = [placed(card(1, "red", "triangle"), 0, 0)]
    const placements: PlacedCard[] = [placed(card(2, "red", "triangle"), 0, 1)]
    // Line: 1 + 2 = 3
    expect(calculateScore(placements, board)).toBe(3)
  })

  it("scores both horizontal and vertical lines when forming a cross", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(1, "red", "square"), 0, 2),
      placed(card(1, "green", "triangle"), -1, 1),
    ]
    const placements: PlacedCard[] = [placed(card(1, "blue", "triangle"), 0, 1)]
    // Horizontal line: 1+1+1 = 3
    // Vertical line: 1+1 = 2
    // Total: 5
    expect(calculateScore(placements, board)).toBe(5)
  })

  it("does not double-count the same line", () => {
    const board: PlacedCard[] = [placed(card(1, "red", "triangle"), 0, 0)]
    // Placing two cards in the same line
    const placements: PlacedCard[] = [
      placed(card(2, "green", "square"), 0, 1),
      placed(card(3, "blue", "circle"), 0, 2),
    ]
    // One horizontal line: 1+2+3 = 6
    expect(calculateScore(placements, board)).toBe(6)
  })

  it("scores extending an existing line", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 0, 1),
    ]
    const placements: PlacedCard[] = [placed(card(3, "blue", "circle"), 0, 2)]
    // Extended line: 1+2+3 = 6
    expect(calculateScore(placements, board)).toBe(6)
  })

  it("wild cards score 0 in a line", () => {
    const board: PlacedCard[] = [placed(card(1, "red", "triangle"), 0, 0)]
    const placements: PlacedCard[] = [placed(wildCard(), 0, 1)]
    // Line: 1 + 0(wild) = 1
    expect(calculateScore(placements, board)).toBe(1)
  })

  it("wild cards score 0 when isolated", () => {
    const placements: PlacedCard[] = [placed(wildCard(), 0, 0)]
    expect(calculateScore(placements, [])).toBe(0)
  })

  it("doubles score for a lot (complete line of 4)", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 0, 1),
      placed(card(3, "blue", "circle"), 0, 2),
    ]
    const placements: PlacedCard[] = [placed(card(4, "yellow", "cross"), 0, 3)]
    // Line of 4: (1+2+3+4) * 2 = 20
    expect(calculateScore(placements, board)).toBe(20)
  })

  it("does not double lines shorter than 4", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 0, 1),
    ]
    const placements: PlacedCard[] = [placed(card(3, "blue", "circle"), 0, 2)]
    // Line of 3: 1+2+3 = 6 (no doubling)
    expect(calculateScore(placements, board)).toBe(6)
  })
})

describe("wild card validation", () => {
  it("createDeck has exactly 2 wild cards", () => {
    const deck = createDeck()
    const wilds = deck.filter((c) => c.isWild)
    expect(wilds).toHaveLength(2)
  })

  it("wild card is valid next to any card", () => {
    const board: PlacedCard[] = [placed(card(1, "red", "triangle"), 0, 0)]
    const wild = wildCard()
    expect(isValidPlacement(wild, { row: 0, col: 1 }, board)).toBe(true)
  })

  it("wild card is valid in an all-different line", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 0, 1),
    ]
    const wild = wildCard()
    expect(isValidPlacement(wild, { row: 0, col: 2 }, board)).toBe(true)
  })

  it("wild card is valid in an all-same line", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(1, "red", "triangle", "dup"), 0, 1),
    ]
    const wild = wildCard()
    expect(isValidPlacement(wild, { row: 0, col: 2 }, board)).toBe(true)
  })

  it("wild card does not break an otherwise invalid line", () => {
    // Line with two non-wild cards that already conflict
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "red", "triangle"), 0, 1),
      placed(card(1, "green", "square"), 0, 2), // number: 1,2,1 → invalid
    ]
    // Wild placed next to this invalid line doesn't fix it
    // Actually, this board state shouldn't exist. Let me test a different scenario.
    // Place wild between two cards that form a valid line
    const board2: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(wildCard("wild-1"), 0, 1),
    ]
    // Another card next to the wild
    const testCard = card(2, "green", "square")
    // Line: 1-red-tri, wild, 2-green-sq → non-wild: [1-red-tri, 2-green-sq] → all diff ✓
    expect(isValidPlacement(testCard, { row: 0, col: 2 }, board2)).toBe(true)
  })

  it("two wild cards in a line are valid", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(wildCard("wild-1"), 0, 1),
    ]
    const wild2 = wildCard("wild-2")
    expect(isValidPlacement(wild2, { row: 0, col: 2 }, board)).toBe(true)
  })
})
