'use client'

import type React from 'react'
import { useEffect, useRef } from 'react'
import { Box, Typography, Paper, IconButton } from '@mui/material'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import toast, { Toaster } from 'react-hot-toast'
import type { Card, GridPosition } from '../types/game'
import { calculateScore } from '../utils/gameLogic'
import {
  HAND_SIZE,
  MAX_LINE_LENGTH,
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_STEP,
} from '../constants/game'
import { isPlacementInSameLineAsPending } from '../utils/turnValidation'
import { getDetailedValidationError } from '../utils/validationMessages'
import { BoardComponent } from './BoardComponent'
import { PlayerHand } from './PlayerHand'
import { Sidebar } from './Sidebar'
import { GameProvider, useGame } from '../context/GameContext'

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
    <>
      <Toaster position='top-center' />

      <Sidebar
        cardsLeft={game.deck.length}
        lastTurnScore={game.lastTurnScore}
        pendingPoints={pendingPoints}
        pendingCount={game.pendingPlacements.length}
        turnInProgress={game.turnInProgress}
        onNewGame={() => dispatch({ type: 'NEW_GAME' })}
        onCompleteTurn={() => dispatch({ type: 'COMPLETE_TURN' })}
        onUndoLast={() => dispatch({ type: 'UNDO_PLACEMENT' })}
      />

      <Paper
        sx={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          backgroundColor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1100,
          borderRadius: '24px',
          textAlign: 'center',
        }}
      >
        <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
          Score: {game.score}
        </Typography>
        {game.pendingPlacements.length > 0 && (
          <Typography
            variant='body2'
            sx={{ color: '#f59e0b', fontWeight: 'medium' }}
          >
            +{pendingPoints} pending
          </Typography>
        )}
      </Paper>

      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 1100,
        }}
      >
        <IconButton
          onClick={() =>
            dispatch({
              type: 'SET_ZOOM',
              zoom: Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM),
            })
          }
          sx={{
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
        >
          <ZoomInIcon />
        </IconButton>
        <IconButton
          onClick={() =>
            dispatch({
              type: 'SET_ZOOM',
              zoom: Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM),
            })
          }
          sx={{
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
        >
          <ZoomOutIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 200px)',
          paddingTop: '80px',
          paddingBottom: '10px',
        }}
      >
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
        />
      </Box>

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
    </>
  )
}

export const Game: React.FC = () => {
  return (
    <GameProvider>
      <GameInner />
    </GameProvider>
  )
}
