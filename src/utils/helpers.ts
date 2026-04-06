/**
 * Helper computations for handicap/learning features.
 */

import type { Card, PlacedCard, GridPosition } from "../types/game"
import { getValidPlacements, isValidPlacement, calculateScore, getCardsInLine } from "./gameLogic"
import { isPlacementInSameLineAsPending } from "./turnValidation"
import type { PendingPlacement } from "../types/game"
import { MAX_LINE_LENGTH } from "../constants/game"

/**
 * Find cards in hand that could complete a line of 4 (a "lot") somewhere on the board.
 * Returns set of card IDs that can complete at least one lot.
 */
export function findLotCompletingCards(
  hand: Card[],
  board: PlacedCard[],
  pendingPlacements: PendingPlacement[] = []
): Set<string> {
  const lotCards = new Set<string>()
  const allPlacements = [...board, ...pendingPlacements]
  const validPositions = getValidPlacements(board, pendingPlacements)

  for (const card of hand) {
    for (const pos of validPositions) {
      if (pendingPlacements.length > 0 && !isPlacementInSameLineAsPending(pos, pendingPlacements))
        continue
      if (!isValidPlacement(card, pos, allPlacements)) continue

      // Check if placing here creates a line of 4
      const testBoard = [...allPlacements, { card, position: pos }]
      const hLine = getCardsInLine(pos, testBoard, "horizontal")
      const vLine = getCardsInLine(pos, testBoard, "vertical")

      if (hLine.length >= MAX_LINE_LENGTH || vLine.length >= MAX_LINE_LENGTH) {
        lotCards.add(card.id)
        break // found at least one lot for this card
      }
    }
  }

  return lotCards
}

/**
 * Find the single best move (highest scoring) for any card in hand.
 * Returns the position and expected score, or null.
 */
export function findBestMove(
  hand: Card[],
  board: PlacedCard[],
  pendingPlacements: PendingPlacement[] = []
): { cardId: string; position: GridPosition; score: number } | null {
  const allPlacements = [...board, ...pendingPlacements]
  const validPositions = getValidPlacements(board, pendingPlacements)

  let best: { cardId: string; position: GridPosition; score: number } | null = null

  for (const card of hand) {
    for (const pos of validPositions) {
      if (pendingPlacements.length > 0 && !isPlacementInSameLineAsPending(pos, pendingPlacements))
        continue
      if (!isValidPlacement(card, pos, allPlacements)) continue

      const placement: PendingPlacement = { card, position: pos }
      const score = calculateScore([...pendingPlacements, placement], board)

      if (!best || score > best.score) {
        best = { cardId: card.id, position: pos, score }
      }
    }
  }

  return best
}

/**
 * For a given valid position, describe what attributes are needed.
 * Returns a human-readable hint string.
 */
export function getAttributeHint(position: GridPosition, board: PlacedCard[]): string {
  const hints: string[] = []

  // Check horizontal neighbors
  const hLine = getCardsInLine(position, board, "horizontal")
  if (hLine.length >= 1) {
    hints.push(describeLineNeeds(hLine, "row"))
  }

  // Check vertical neighbors
  const vLine = getCardsInLine(position, board, "vertical")
  if (vLine.length >= 1) {
    hints.push(describeLineNeeds(vLine, "col"))
  }

  return hints.filter(Boolean).join(" | ") || ""
}

function describeLineNeeds(line: PlacedCard[], direction: string): string {
  if (line.length < 1) return ""

  const nonWild = line.filter((p) => !p.card.isWild)
  if (nonWild.length < 1) return "any"

  const parts: string[] = []

  // Numbers
  const nums = new Set(nonWild.map((p) => p.card.number))
  if (nums.size === 1) {
    parts.push(`${[...nums][0]}`)
  } else {
    const remaining = [1, 2, 3, 4].filter((n) => !nums.has(n as 1 | 2 | 3 | 4))
    if (remaining.length <= 2) parts.push(remaining.join("/"))
  }

  // Colors
  const cols = new Set(nonWild.map((p) => p.card.color))
  if (cols.size === 1) {
    parts.push([...cols][0])
  } else {
    const allColors = ["red", "green", "blue", "yellow"]
    const remaining = allColors.filter((c) => !cols.has(c as any))
    if (remaining.length <= 2) parts.push(remaining.join("/"))
  }

  // Shapes
  const shps = new Set(nonWild.map((p) => p.card.shape))
  if (shps.size === 1) {
    parts.push([...shps][0])
  } else {
    const allShapes = ["triangle", "square", "circle", "cross"]
    const remaining = allShapes.filter((s) => !shps.has(s as any))
    if (remaining.length <= 2) parts.push(remaining.join("/"))
  }

  return parts.join(" ")
}
