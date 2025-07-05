import { PendingPlacement } from '../types/game';

export function areAllPlacementsInSameLine(placements: PendingPlacement[]): boolean {
  if (placements.length <= 1) return true;
  
  // Check if all are in the same row
  const firstRow = placements[0].position.row;
  const allSameRow = placements.every(p => p.position.row === firstRow);
  
  // Check if all are in the same column
  const firstCol = placements[0].position.col;
  const allSameCol = placements.every(p => p.position.col === firstCol);
  
  // Must be either all in same row OR all in same column
  return allSameRow || allSameCol;
}

export function isPlacementInSameLineAsPending(
  newPosition: { row: number; col: number },
  pendingPlacements: PendingPlacement[]
): boolean {
  if (pendingPlacements.length === 0) return true;
  
  // Check if all pending are in same row
  const firstRow = pendingPlacements[0].position.row;
  const allSameRow = pendingPlacements.every(p => p.position.row === firstRow);
  
  if (allSameRow && newPosition.row === firstRow) {
    return true;
  }
  
  // Check if all pending are in same column
  const firstCol = pendingPlacements[0].position.col;
  const allSameCol = pendingPlacements.every(p => p.position.col === firstCol);
  
  if (allSameCol && newPosition.col === firstCol) {
    return true;
  }
  
  // If pending placements are not in a line yet (only 1 placement), 
  // new placement must form a line with it
  if (pendingPlacements.length === 1) {
    const pending = pendingPlacements[0];
    return newPosition.row === pending.position.row || newPosition.col === pending.position.col;
  }
  
  return false;
}