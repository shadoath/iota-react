/**
 * Compute a score heatmap for the board.
 * For each empty adjacent position, try every card in the deck
 * and compute the average potential score.
 */

import type { Card, PlacedCard, GridPosition } from "../types/game"
import { getValidPlacements, isValidPlacement, calculateScore } from "./gameLogic"
import { CARD_NUMBERS, CARD_COLORS, CARD_SHAPES } from "../constants/game"

export interface HeatmapCell {
  position: GridPosition
  maxScore: number
  avgScore: number
  validCardCount: number
}

/**
 * For each valid placement position on the board, compute:
 * - How many of the 64 possible cards could be validly placed there
 * - The max score achievable at that position
 * - The average score across all valid cards
 */
export function computeHeatmap(board: PlacedCard[]): HeatmapCell[] {
  const validPositions = getValidPlacements(board)
  const cells: HeatmapCell[] = []

  // Generate all possible non-wild cards
  const allCards: Card[] = []
  let id = 0
  for (const number of CARD_NUMBERS) {
    for (const color of CARD_COLORS) {
      for (const shape of CARD_SHAPES) {
        allCards.push({ id: `hm-${id++}`, number, color, shape })
      }
    }
  }

  for (const pos of validPositions) {
    let maxScore = 0
    let totalScore = 0
    let validCount = 0

    for (const card of allCards) {
      if (!isValidPlacement(card, pos, board)) continue

      const placement = { card, position: pos }
      const score = calculateScore([placement], board)
      maxScore = Math.max(maxScore, score)
      totalScore += score
      validCount++
    }

    if (validCount > 0) {
      cells.push({
        position: pos,
        maxScore,
        avgScore: Math.round((totalScore / validCount) * 10) / 10,
        validCardCount: validCount,
      })
    }
  }

  return cells
}

/**
 * Convert heatmap to a lookup map for O(1) access in rendering.
 */
export function heatmapToMap(cells: HeatmapCell[]): Record<string, HeatmapCell> {
  const map: Record<string, HeatmapCell> = {}
  for (const cell of cells) {
    map[`${cell.position.row},${cell.position.col}`] = cell
  }
  return map
}
