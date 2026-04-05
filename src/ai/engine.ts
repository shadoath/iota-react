import type { Card, PlacedCard, PendingPlacement, AIDifficulty, GridPosition } from "../types/game"
import {
  getValidPlacements,
  isValidPlacement,
  calculateScore,
  getCardsInLine,
} from "../utils/gameLogic"
import { isPlacementInSameLineAsPending } from "../utils/turnValidation"

interface ScoredMove {
  placements: PendingPlacement[]
  score: number
}

/**
 * Compute the AI's move given its hand and the current board.
 * Returns an array of placements (empty = pass/swap).
 */
export function computeAIMove(
  hand: Card[],
  board: PlacedCard[],
  difficulty: AIDifficulty
): PendingPlacement[] {
  switch (difficulty) {
    case "easy":
      return computeEasyMove(hand, board)
    case "medium":
      return computeMediumMove(hand, board)
    case "hard":
      return computeHardMove(hand, board)
    default:
      return computeEasyMove(hand, board)
  }
}

/**
 * Easy AI: finds all valid single-card placements, picks one randomly.
 */
function computeEasyMove(hand: Card[], board: PlacedCard[]): PendingPlacement[] {
  const singleMoves = findAllSingleMoves(hand, board)
  if (singleMoves.length === 0) return []

  const randomIndex = Math.floor(Math.random() * singleMoves.length)
  return singleMoves[randomIndex].placements
}

/**
 * Medium AI: finds single and double-card moves, picks the highest scoring.
 * 20% chance of picking a random move instead (feels more human).
 */
function computeMediumMove(hand: Card[], board: PlacedCard[]): PendingPlacement[] {
  const allMoves = [...findAllSingleMoves(hand, board), ...findAllDoubleMoves(hand, board)]

  if (allMoves.length === 0) return []

  // 20% chance of random move
  if (Math.random() < 0.2) {
    return allMoves[Math.floor(Math.random() * allMoves.length)].placements
  }

  // Pick highest scoring
  allMoves.sort((a, b) => b.score - a.score)
  return allMoves[0].placements
}

/**
 * Hard AI: exhaustive search of all possible 1-4 card placements.
 * Picks the highest scoring move.
 */
function computeHardMove(hand: Card[], board: PlacedCard[]): PendingPlacement[] {
  const allMoves = findAllMovesUpToN(hand, board, Math.min(hand.length, 4))

  if (allMoves.length === 0) return []

  // Sort by score descending, then by number of cards used (prefer using more cards)
  allMoves.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return b.placements.length - a.placements.length
  })

  return allMoves[0].placements
}

// --- Move generation helpers ---

function findAllSingleMoves(hand: Card[], board: PlacedCard[]): ScoredMove[] {
  const moves: ScoredMove[] = []
  const validPositions = getValidPlacements(board)

  for (const card of hand) {
    for (const pos of validPositions) {
      if (isValidPlacement(card, pos, board)) {
        const placement: PendingPlacement = { card, position: pos }
        const score = calculateScore([placement], board)
        moves.push({ placements: [placement], score })
      }
    }
  }

  return moves
}

function findAllDoubleMoves(hand: Card[], board: PlacedCard[]): ScoredMove[] {
  const moves: ScoredMove[] = []

  // For each single valid placement
  const validPositions = getValidPlacements(board)

  for (let i = 0; i < hand.length; i++) {
    const card1 = hand[i]
    for (const pos1 of validPositions) {
      if (!isValidPlacement(card1, pos1, board)) continue

      const placement1: PendingPlacement = { card: card1, position: pos1 }
      const boardAfter1 = [...board, placement1]
      const remainingHand = hand.filter((_, idx) => idx !== i)

      // Get valid positions for second card (must be in same line)
      const validPos2 = getValidPlacements(boardAfter1, [placement1])

      for (const card2 of remainingHand) {
        for (const pos2 of validPos2) {
          if (!isPlacementInSameLineAsPending(pos2, [placement1])) continue
          if (!isValidPlacement(card2, pos2, boardAfter1)) continue

          const placement2: PendingPlacement = { card: card2, position: pos2 }
          const score = calculateScore([placement1, placement2], board)
          moves.push({ placements: [placement1, placement2], score })
        }
      }
    }
  }

  return moves
}

/**
 * Find all valid move combinations up to N cards.
 * Uses recursive depth-first search.
 */
function findAllMovesUpToN(hand: Card[], board: PlacedCard[], maxCards: number): ScoredMove[] {
  const allMoves: ScoredMove[] = []

  function search(
    remainingHand: Card[],
    currentBoard: PlacedCard[],
    currentPlacements: PendingPlacement[],
    depth: number
  ) {
    // Score current placement if we have at least one
    if (currentPlacements.length > 0) {
      const score = calculateScore(currentPlacements, board)
      allMoves.push({
        placements: [...currentPlacements],
        score,
      })
    }

    if (depth >= maxCards) return

    // Get valid positions for next card
    const validPositions =
      currentPlacements.length === 0
        ? getValidPlacements(currentBoard)
        : getValidPlacements(currentBoard, currentPlacements)

    for (let i = 0; i < remainingHand.length; i++) {
      const card = remainingHand[i]

      for (const pos of validPositions) {
        if (
          currentPlacements.length > 0 &&
          !isPlacementInSameLineAsPending(pos, currentPlacements)
        ) {
          continue
        }
        if (!isValidPlacement(card, pos, currentBoard)) continue

        const placement: PendingPlacement = { card, position: pos }
        const newBoard = [...currentBoard, placement]
        const newHand = remainingHand.filter((_, idx) => idx !== i)

        currentPlacements.push(placement)
        search(newHand, newBoard, currentPlacements, depth + 1)
        currentPlacements.pop()
      }
    }
  }

  search(hand, board, [], 0)
  return allMoves
}
