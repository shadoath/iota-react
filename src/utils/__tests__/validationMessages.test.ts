import { describe, it, expect } from "vitest"
import { getDetailedValidationError } from "../validationMessages"
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

describe("getDetailedValidationError", () => {
  it("returns valid for a correct placement", () => {
    const board: PlacedCard[] = [placed(card(1, "red", "triangle"), 0, 0)]
    const testCard = card(2, "red", "triangle")
    const result = getDetailedValidationError(testCard, { row: 0, col: 1 }, board)
    expect(result.isValid).toBe(true)
    expect(result.errorMessage).toBeUndefined()
  })

  it("returns error when not adjacent to any card", () => {
    const board: PlacedCard[] = [placed(card(1, "red", "triangle"), 0, 0)]
    const testCard = card(2, "green", "square")
    const result = getDetailedValidationError(testCard, { row: 5, col: 5 }, board)
    expect(result.isValid).toBe(false)
    expect(result.errorMessage).toContain("adjacent")
  })

  it("returns error with attribute details when line rule violated", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(2, "green", "square"), 0, 1),
    ]
    // Colors are red, green (all diff) → placing red again breaks it
    const testCard = card(3, "red", "circle")
    const result = getDetailedValidationError(testCard, { row: 0, col: 2 }, board)
    expect(result.isValid).toBe(false)
    expect(result.errorMessage).toBeDefined()
    expect(result.errorMessage!.toLowerCase()).toContain("color")
  })

  it("explains all-same requirement violation", () => {
    const board: PlacedCard[] = [
      placed(card(1, "red", "triangle"), 0, 0),
      placed(card(1, "red", "square"), 0, 1),
    ]
    // Numbers are same (1), colors are same (red) → placing number 2 breaks same-number
    const testCard = card(2, "red", "circle")
    const result = getDetailedValidationError(testCard, { row: 0, col: 2 }, board)
    expect(result.isValid).toBe(false)
    expect(result.errorMessage).toBeDefined()
  })
})
