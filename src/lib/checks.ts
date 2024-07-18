import { CardType, PROPERTIES } from "../types"

export const isValidMove = (
  grid: (CardType | null)[][],
  card: CardType,
  row: number,
  col: number
): boolean => {
  const directions = [
    { dr: -1, dc: 0 }, // up
    { dr: 1, dc: 0 }, // down
    { dr: 0, dc: -1 }, // left
    { dr: 0, dc: 1 }, // right
  ]

  // Check if the move is adjacent to at least one card
  let isAdjacent = false
  for (const { dr, dc } of directions) {
    const r = row + dr
    const c = col + dc
    if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length && grid[r][c]) {
      isAdjacent = true
      break
    }
  }

  if (!isAdjacent) {
    return false
  }

  for (const { dr, dc } of directions) {
    const line = getLine(grid, card, row, col, dr, dc)
    if (line.length > 1 && !isValidLine(line)) {
      return false
    }
  }

  return true
}

export const getLine = (
  grid: (CardType | null)[][],
  card: CardType,
  row: number,
  col: number,
  dr: number,
  dc: number
): CardType[] => {
  const line = [card]
  let r = row + dr
  let c = col + dc

  while (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length && grid[r][c]) {
    line.push(grid[r][c]!)
    r += dr
    c += dc
  }

  r = row - dr
  c = col - dc
  while (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length && grid[r][c]) {
    line.unshift(grid[r][c]!)
    r -= dr
    c -= dc
  }

  return line
}

const isValidLine = (line: CardType[]): boolean => {
  for (const property of PROPERTIES) {
    const values = line.map((card) => card[property])
    const allSame = values.every((value) => value === values[0])
    const allDifferent = new Set(values).size === values.length
    if (!allSame && !allDifferent) {
      return false
    }
  }
  return true
}
