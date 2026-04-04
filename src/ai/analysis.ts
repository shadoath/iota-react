/**
 * Post-game move analysis.
 * For each human turn, compute what the hard AI would have done
 * and compare the score.
 */

import type { Card, PlacedCard, TurnRecord, Player } from '../types/game'
import { computeAIMove } from './engine'
import { calculateScore } from '../utils/gameLogic'

export interface TurnAnalysis {
  turnIndex: number
  playerName: string
  actualScore: number
  bestPossibleScore: number
  scoreDiff: number // positive = missed points
  bestMove: PlacedCard[] | null
  rating: 'optimal' | 'good' | 'missed'
}

/**
 * Analyze all human turns in a completed game.
 * Reconstructs the board and hand state at each turn,
 * then runs the hard AI to find the best possible move.
 */
export function analyzeGame(
  initialBoard: PlacedCard[],
  turnHistory: TurnRecord[],
  players: Player[],
  playerHands: Card[][] // initial hands for each player
): TurnAnalysis[] {
  const analyses: TurnAnalysis[] = []
  let currentBoard = [...initialBoard]

  // Reconstruct deck state — we don't have it, so we can only
  // analyze based on the hand the player actually had.
  // We reconstruct hands by tracking what was played and drawn.
  const hands = playerHands.map(h => [...h])

  for (let i = 0; i < turnHistory.length; i++) {
    const turn = turnHistory[i]
    const playerIndex = players.findIndex(p => p.id === turn.playerId)
    const player = players[playerIndex]

    if (player?.type === 'human' && turn.placements.length > 0) {
      // Reconstruct the hand before this turn was played
      // The hand contains the cards that were placed + whatever remained
      const placedCardIds = new Set(
        turn.placements.map(p => p.card.id.replace('pending-', ''))
      )
      const handBeforeTurn = [
        ...hands[playerIndex].filter(c => !placedCardIds.has(c.id)),
        ...turn.placements.map(p => ({
          ...p.card,
          id: p.card.id.replace('pending-', ''),
        })),
      ]

      // Run hard AI on this hand + board state
      const bestMove = computeAIMove(handBeforeTurn, currentBoard, 'hard')
      const bestScore = bestMove.length > 0
        ? calculateScore(
            bestMove.map(p => ({ ...p, card: { ...p.card, id: `analysis-${p.card.id}` } })),
            currentBoard
          )
        : 0

      const diff = bestScore - turn.score
      const rating: TurnAnalysis['rating'] =
        diff <= 0 ? 'optimal' : diff <= 2 ? 'good' : 'missed'

      analyses.push({
        turnIndex: i,
        playerName: player.name,
        actualScore: turn.score,
        bestPossibleScore: bestScore,
        scoreDiff: Math.max(0, diff),
        bestMove: bestMove.length > 0 ? bestMove : null,
        rating,
      })
    }

    // Apply turn to board
    currentBoard = [...currentBoard, ...turn.placements]

    // Update hand tracking (remove played cards)
    if (playerIndex >= 0) {
      const playedIds = new Set(
        turn.placements.map(p => p.card.id.replace('pending-', ''))
      )
      hands[playerIndex] = hands[playerIndex].filter(c => !playedIds.has(c.id))
    }
  }

  return analyses
}

/**
 * Compute summary stats from analysis.
 */
export function analysisSummary(analyses: TurnAnalysis[]) {
  if (analyses.length === 0) return null

  const totalMissed = analyses.reduce((sum, a) => sum + a.scoreDiff, 0)
  const optimalCount = analyses.filter(a => a.rating === 'optimal').length
  const accuracy = Math.round((optimalCount / analyses.length) * 100)

  return {
    totalMissed,
    optimalCount,
    totalTurns: analyses.length,
    accuracy,
  }
}
