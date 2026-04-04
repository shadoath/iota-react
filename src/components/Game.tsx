'use client'

import React, { useEffect, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import type { Card, GridPosition } from '../types/game'
import { calculateScore } from '../utils/gameLogic'
import { MAX_LINE_LENGTH } from '../constants/game'
import { isPlacementInSameLineAsPending } from '../utils/turnValidation'
import { getDetailedValidationError } from '../utils/validationMessages'
import { BoardComponent } from './BoardComponent'
import { PlayerHand } from './PlayerHand'
import { Sidebar } from './Sidebar'
import { GameProvider, useGame } from '../context/GameContext'
import styles from './Game.module.css'

function GameInner() {
  const { state, dispatch } = useGame()
  const { game, selectedCardId, zoomLevel, lastActionResult } = state

  const selectedCard =
    game.playerHand.find((c) => c.id === selectedCardId) ?? null

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

  const handleSelectCard = (card: Card) => {
    dispatch({ type: 'SELECT_CARD', cardId: card.id })
  }

  const handlePlaceCard = (position: GridPosition) => {
    if (!selectedCard) return

    if (!isPlacementInSameLineAsPending(position, game.pendingPlacements)) {
      toast.error(
        'All cards in a turn must be placed in the same row or column!'
      )
      return
    }

    const allPlacements = [...game.board, ...game.pendingPlacements]
    const validationResult = getDetailedValidationError(
      selectedCard,
      position,
      allPlacements
    )

    if (!validationResult.isValid) {
      toast.error(validationResult.errorMessage || 'Invalid placement!')
      return
    }

    dispatch({ type: 'PLACE_CARD', card: selectedCard, position })

    if (game.pendingPlacements.length + 1 >= MAX_LINE_LENGTH) {
      toast('Maximum 4 cards per turn!', { icon: '⚠️' })
    }
  }

  const pendingPoints =
    game.pendingPlacements.length > 0
      ? calculateScore(game.pendingPlacements, game.board)
      : 0

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

      {/* Score display */}
      <div className={styles.scoreBar}>
        <span className={styles.scoreValue}>Score: {game.score}</span>
        {game.pendingPlacements.length > 0 && (
          <span className={styles.scorePending}>+{pendingPoints}</span>
        )}
      </div>

      {/* Board area */}
      <div className={styles.boardArea}>
        <BoardComponent
          board={game.board}
          pendingPlacements={game.pendingPlacements}
          onPlaceCard={handlePlaceCard}
          selectedCard={
            game.pendingPlacements.length < MAX_LINE_LENGTH
              ? selectedCard
              : null
          }
          zoomLevel={zoomLevel}
          onZoomChange={(zoom) => dispatch({ type: 'SET_ZOOM', zoom })}
        />
      </div>

      {/* Player hand */}
      <PlayerHand
        cards={game.playerHand}
        selectedCard={selectedCard}
        onSelectCard={handleSelectCard}
        turnInProgress={game.turnInProgress}
        pendingCount={game.pendingPlacements.length}
        pendingPoints={pendingPoints}
        onCompleteTurn={() => dispatch({ type: 'COMPLETE_TURN' })}
        onUndoLast={() => dispatch({ type: 'UNDO_PLACEMENT' })}
      />
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
