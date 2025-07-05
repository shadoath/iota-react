'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { Container, Box, Typography, Paper, IconButton } from '@mui/material'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import toast, { Toaster } from 'react-hot-toast'
import type {
  Card,
  GameState,
  GridPosition,
  PendingPlacement,
} from '../types/game'
import {
  createDeck,
  isValidPlacement,
  calculateScore,
} from '../utils/gameLogic'
import { isPlacementInSameLineAsPending } from '../utils/turnValidation'
import { getDetailedValidationError } from '../utils/validationMessages'
import { BoardComponent } from './BoardComponent'
import { PlayerHand } from './PlayerHand'
import { Sidebar } from './Sidebar'

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    playerHand: [],
    board: [],
    currentPlayer: 1,
    score: 0,
    pendingPlacements: [],
    turnInProgress: false,
    lastTurnScore: null,
  })

  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1.0)

  // Initialize game
  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = () => {
    const deck = createDeck()
    const playerHand = deck.slice(0, 4)
    const remainingDeck = deck.slice(4)

    // Place initial card in center
    const initialCard = remainingDeck[0]
    const board = [
      {
        card: initialCard,
        position: { row: 0, col: 0 },
      },
    ]

    setGameState({
      deck: remainingDeck.slice(1),
      playerHand,
      board,
      currentPlayer: 1,
      score: 0,
      pendingPlacements: [],
      turnInProgress: false,
      lastTurnScore: null,
    })

    setSelectedCard(null)
    toast.success('New game started!')
  }

  const handleSelectCard = (card: Card) => {
    if (selectedCard?.id === card.id) {
      setSelectedCard(null)
    } else {
      setSelectedCard(card)
    }
  }

  const handlePlaceCard = (position: GridPosition) => {
    if (!selectedCard) return

    // Check if placement is in same line as other pending placements
    if (
      !isPlacementInSameLineAsPending(position, gameState.pendingPlacements)
    ) {
      toast.error(
        'All cards in a turn must be placed in the same row or column!'
      )
      return
    }

    // Check against both board and pending placements
    const allPlacements = [...gameState.board, ...gameState.pendingPlacements]

    // Get detailed validation error
    const validationResult = getDetailedValidationError(
      selectedCard,
      position,
      allPlacements
    )

    if (!validationResult.isValid) {
      toast.error(validationResult.errorMessage || 'Invalid placement!')
      return
    }

    // Add to pending placements with a special ID prefix
    const newPending: PendingPlacement = {
      card: { ...selectedCard, id: `pending-${selectedCard.id}` },
      position,
    }

    setGameState((prev) => ({
      ...prev,
      pendingPlacements: [...prev.pendingPlacements, newPending],
      playerHand: prev.playerHand.filter((c) => c.id !== selectedCard.id),
      turnInProgress: true,
    }))

    setSelectedCard(null)

    if (gameState.pendingPlacements.length + 1 >= 4) {
      toast('Maximum 4 cards per turn!', { icon: '⚠️' })
    }
  }

  const completeTurn = () => {
    if (gameState.pendingPlacements.length === 0) {
      toast.error('You must place at least one card!')
      return
    }

    // Calculate score for all placed cards
    const points = calculateScore(gameState.pendingPlacements, gameState.board)

    // Move pending to board
    const newBoard = [...gameState.board, ...gameState.pendingPlacements]

    // Draw new cards
    const cardsNeeded = 4 - gameState.playerHand.length
    const newCards = gameState.deck.slice(0, cardsNeeded)
    const newDeck = gameState.deck.slice(cardsNeeded)
    const newHand = [...gameState.playerHand, ...newCards]

    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      playerHand: newHand,
      deck: newDeck,
      score: prev.score + points,
      pendingPlacements: [],
      turnInProgress: false,
      lastTurnScore: points,
    }))

    toast.success(`Turn complete! You scored ${points} points!`, {
      duration: 3000,
      icon: '🎉',
    })

    // Check game end
    if (newHand.length === 0) {
      toast.success(`Game Over! Final Score: ${gameState.score + points}`, {
        duration: 5000,
        icon: '🏆',
      })
    }
  }

  const undoLastPlacement = () => {
    if (gameState.pendingPlacements.length === 0) return

    const lastPlacement =
      gameState.pendingPlacements[gameState.pendingPlacements.length - 1]
    // Remove the 'pending-' prefix to get original card
    const originalCard = {
      ...lastPlacement.card,
      id: lastPlacement.card.id.replace('pending-', ''),
    }

    setGameState((prev) => ({
      ...prev,
      pendingPlacements: prev.pendingPlacements.slice(0, -1),
      playerHand: [...prev.playerHand, originalCard],
      turnInProgress: prev.pendingPlacements.length > 1,
    }))

    toast('Placement undone', { icon: '↩️' })
  }

  return (
    <>
      <Toaster position='top-center' />

      <Sidebar
        cardsLeft={gameState.deck.length}
        lastTurnScore={gameState.lastTurnScore}
        pendingPoints={
          gameState.pendingPlacements.length > 0
            ? calculateScore(gameState.pendingPlacements, gameState.board)
            : 0
        }
        pendingCount={gameState.pendingPlacements.length}
        turnInProgress={gameState.turnInProgress}
        onNewGame={startNewGame}
        onCompleteTurn={completeTurn}
        onUndoLast={undoLastPlacement}
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
          Score: {gameState.score}
        </Typography>
        {gameState.pendingPlacements.length > 0 && (
          <Typography
            variant='body2'
            sx={{ color: '#f59e0b', fontWeight: 'medium' }}
          >
            +{calculateScore(gameState.pendingPlacements, gameState.board)}{' '}
            pending
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
          onClick={() => setZoomLevel(Math.min(zoomLevel + 0.1, 3.0))}
          sx={{
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          <ZoomInIcon />
        </IconButton>
        <IconButton
          onClick={() => setZoomLevel(Math.max(zoomLevel - 0.1, 0.25))}
          sx={{
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
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
          board={gameState.board}
          pendingPlacements={gameState.pendingPlacements}
          onPlaceCard={handlePlaceCard}
          selectedCard={
            gameState.pendingPlacements.length < 4 ? selectedCard : null
          }
          zoomLevel={zoomLevel}
        />
      </Box>

      <PlayerHand
        cards={gameState.playerHand}
        selectedCard={selectedCard}
        onSelectCard={handleSelectCard}
        turnInProgress={gameState.turnInProgress}
        pendingCount={gameState.pendingPlacements.length}
        pendingPoints={
          gameState.pendingPlacements.length > 0
            ? calculateScore(gameState.pendingPlacements, gameState.board)
            : 0
        }
        onCompleteTurn={completeTurn}
        onUndoLast={undoLastPlacement}
      />
    </>
  )
}
