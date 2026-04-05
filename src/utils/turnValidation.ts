import type { PendingPlacement, PlacedCard } from "../types/game"

export function areAllPlacementsInSameLine(placements: PendingPlacement[]): boolean {
  if (placements.length <= 1) return true

  // Check if all are in the same row
  const firstRow = placements[0].position.row
  const allSameRow = placements.every((p) => p.position.row === firstRow)

  // Check if all are in the same column
  const firstCol = placements[0].position.col
  const allSameCol = placements.every((p) => p.position.col === firstCol)

  // Must be either all in same row OR all in same column
  return allSameRow || allSameCol
}

export function isPlacementInSameLineAsPending(
  newPosition: { row: number; col: number },
  pendingPlacements: PendingPlacement[]
): boolean {
  if (pendingPlacements.length === 0) return true

  // Check if all pending are in same row
  const firstRow = pendingPlacements[0].position.row
  const allSameRow = pendingPlacements.every((p) => p.position.row === firstRow)

  if (allSameRow && newPosition.row === firstRow) {
    return true
  }

  // Check if all pending are in same column
  const firstCol = pendingPlacements[0].position.col
  const allSameCol = pendingPlacements.every((p) => p.position.col === firstCol)

  if (allSameCol && newPosition.col === firstCol) {
    return true
  }

  // If pending placements are not in a line yet (only 1 placement),
  // new placement must form a line with it
  if (pendingPlacements.length === 1) {
    const pending = pendingPlacements[0]
    return newPosition.row === pending.position.row || newPosition.col === pending.position.col
  }

  return false
}

/**
 * Validate that all pending placements form a contiguous line
 * (no empty gaps between them, existing board cards can fill gaps).
 */
export function arePlacementsContiguous(
  pendingPlacements: PendingPlacement[],
  board: PlacedCard[]
): boolean {
  if (pendingPlacements.length <= 1) return true

  const allCards = [...board, ...pendingPlacements]

  // Determine if horizontal or vertical
  const firstRow = pendingPlacements[0].position.row
  const allSameRow = pendingPlacements.every((p) => p.position.row === firstRow)

  if (allSameRow) {
    // Horizontal: check all columns between min and max are occupied
    const cols = pendingPlacements.map((p) => p.position.col).sort((a, b) => a - b)
    const minCol = cols[0]
    const maxCol = cols[cols.length - 1]
    for (let c = minCol; c <= maxCol; c++) {
      const hasCard = allCards.some((p) => p.position.row === firstRow && p.position.col === c)
      if (!hasCard) return false
    }
    return true
  }

  const firstCol = pendingPlacements[0].position.col
  const allSameCol = pendingPlacements.every((p) => p.position.col === firstCol)

  if (allSameCol) {
    // Vertical: check all rows between min and max are occupied
    const rows = pendingPlacements.map((p) => p.position.row).sort((a, b) => a - b)
    const minRow = rows[0]
    const maxRow = rows[rows.length - 1]
    for (let r = minRow; r <= maxRow; r++) {
      const hasCard = allCards.some((p) => p.position.row === r && p.position.col === firstCol)
      if (!hasCard) return false
    }
    return true
  }

  return false
}
