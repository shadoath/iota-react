'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import type { Card, GridPosition, GameSettings } from '../types/game'
import { calculateScore } from '../utils/gameLogic'
import { MAX_LINE_LENGTH } from '../constants/game'
import { isPlacementInSameLineAsPending } from '../utils/turnValidation'
import { getDetailedValidationError } from '../utils/validationMessages'
import { computeAIMove } from '../ai/engine'
import { BoardComponent } from './BoardComponent'
import { PlayerHand } from './PlayerHand'
import { Sidebar } from './Sidebar'
import { GameSetup } from './GameSetup'
import { GameOver } from './GameOver'
import { ScoreBoard } from './ScoreBoard'
import { GameProvider, useGame } from '../context/GameContext'
import styles from './Game.module.css'

function GameInner() {
  const { state, dispatch } = useGame()
  const { game, selectedCardId, zoomLevel, lastActionResult } = state
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [lastSettings, setLastSettings] = useState<GameSettings | null>(null)

  const currentPlayer = game.players[game.currentPlayerIndex]
  const isHumanTurn = currentPlayer?.type === 'human'

  const selectedCard = isHumanTurn
    ? (game.players[game.currentPlayerIndex]?.hand.find(c => c.id === selectedCardId) ?? null)
    : null

  // Show toast for action results
  const lastResultRef = useRef(lastActionResult)
  useEffect(() => {
    if (lastActionResult && lastActionResult !== lastResultRef.current) {
      if (lastActionResult.type === 'success') {
        toast.success(lastActionResult.message)
      } else if (lastActionResult.type === 'error') {
        toast.error(lastActionResult.message)
      } else {
        toast(lastActionResult.message)
      }
    }
    lastResultRef.current = lastActionResult
  }, [lastActionResult])

  // --- AI turn execution ---
  useEffect(() => {
    if (game.gamePhase !== 'playing') return
    if (!currentPlayer || currentPlayer.type !== 'ai') return
    if (isAIThinking) return

    setIsAIThinking(true)

    // Delay to make it feel natural
    const thinkTime = currentPlayer.difficulty === 'hard' ? 1500
      : currentPlayer.difficulty === 'medium' ? 1000
      : 600

    const timer = setTimeout(() => {
      const move = computeAIMove(
        currentPlayer.hand,
        game.board,
        currentPlayer.difficulty!
      )

      if (move.length === 0) {
        // AI can't play — swap a random card
        if (currentPlayer.hand.length > 0 && game.deck.length > 0) {
          const randomCard = currentPlayer.hand[Math.floor(Math.random() * currentPlayer.hand.length)]
          dispatch({ type: 'SWAP_CARDS', cardIds: [randomCard.id] })
        } else {
          // Pass (no cards to swap, no moves)
          dispatch({ type: 'AI_TURN', placements: [] })
        }
      } else {
        dispatch({ type: 'AI_TURN', placements: move })
      }

      setIsAIThinking(false)
    }, thinkTime)

    return () => {
      clearTimeout(timer)
      setIsAIThinking(false)
    }
  }, [game.currentPlayerIndex, game.gamePhase, currentPlayer, isAIThinking, dispatch, game.board, game.deck.length])

  // --- Handlers ---

  const handleStartGame = useCallback((settings: GameSettings) => {
    setLastSettings(settings)
    dispatch({ type: 'START_GAME', settings })
  }, [dispatch])

  const handlePlayAgain = useCallback(() => {
    if (lastSettings) {
      dispatch({ type: 'START_GAME', settings: lastSettings })
    }
  }, [dispatch, lastSettings])

  const handleSelectCard = (card: Card) => {
    if (!isHumanTurn || isAIThinking) return
    dispatch({ type: 'SELECT_CARD', cardId: card.id })
  }

  const handlePlaceCard = (position: GridPosition) => {
    if (!selectedCard || !isHumanTurn) return

    if (!isPlacementInSameLineAsPending(position, game.pendingPlacements)) {
      toast.error('All cards in a turn must be placed in the same row or column!')
      return
    }

    const allPlacements = [...game.board, ...game.pendingPlacements]
    const validationResult = getDetailedValidationError(selectedCard, position, allPlacements)

    if (!validationResult.isValid) {
      toast.error(validationResult.errorMessage || 'Invalid placement!')
      return
    }

    dispatch({ type: 'PLACE_CARD', card: selectedCard, position })

    if (game.pendingPlacements.length + 1 >= MAX_LINE_LENGTH) {
      toast('Maximum 4 cards per turn!', { icon: '⚠️' })
    }
  }

  const pendingPoints = game.pendingPlacements.length > 0
    ? calculateScore(game.pendingPlacements, game.board)
    : 0

  // --- Setup screen ---
  if (game.gamePhase === 'setup') {
    return <GameSetup onStartGame={handleStartGame} />
  }

  const humanPlayer = game.players.find(p => p.type === 'human')
  const humanHand = humanPlayer?.hand ?? []

  return (
    <div className={styles.layout}>
      <Toaster position='top-center' />

      <Sidebar
        cardsLeft={game.deck.length}
        lastTurnScore={game.lastTurnScore}
        pendingPoints={pendingPoints}
        pendingCount={game.pendingPlacements.length}
        turnInProgress={game.turnInProgress}
        onNewGame={() => dispatch({ type: 'RETURN_TO_SETUP' })}
        onCompleteTurn={() => dispatch({ type: 'COMPLETE_TURN' })}
        onUndoLast={() => dispatch({ type: 'UNDO_PLACEMENT' })}
      />

      {/* Multi-player scoreboard */}
      <ScoreBoard
        players={game.players}
        currentPlayerIndex={game.currentPlayerIndex}
        pendingPoints={pendingPoints}
        isAIThinking={isAIThinking}
      />

      {/* Board area */}
      <div className={styles.boardArea}>
        <BoardComponent
          board={game.board}
          pendingPlacements={game.pendingPlacements}
          onPlaceCard={handlePlaceCard}
          selectedCard={
            isHumanTurn && game.pendingPlacements.length < MAX_LINE_LENGTH
              ? selectedCard
              : null
          }
          zoomLevel={zoomLevel}
          onZoomChange={(zoom) => dispatch({ type: 'SET_ZOOM', zoom })}
        />
      </div>

      {/* Player hand (only shown for human) */}
      <PlayerHand
        cards={humanHand}
        selectedCard={selectedCard}
        onSelectCard={handleSelectCard}
        turnInProgress={game.turnInProgress && isHumanTurn}
        pendingCount={game.pendingPlacements.length}
        pendingPoints={pendingPoints}
        onCompleteTurn={() => dispatch({ type: 'COMPLETE_TURN' })}
        onUndoLast={() => dispatch({ type: 'UNDO_PLACEMENT' })}
      />

      {/* Game Over overlay */}
      {game.gamePhase === 'ended' && (
        <GameOver
          players={game.players}
          turnHistory={game.turnHistory}
          onPlayAgain={handlePlayAgain}
          onNewSetup={() => dispatch({ type: 'RETURN_TO_SETUP' })}
        />
      )}
    </div>
  )
}

export const Game: React.FC = () => {
  return (
    <GameProvider>
      <GameInner />
    </GameProvider>
  )
}
