import type React from 'react'
import { Box, Typography, Button, Chip } from '@mui/material'
import type { Card } from '../types/game'
import { GameCard } from './GameCard'

interface PlayerHandProps {
  cards: Card[]
  selectedCard: Card | null
  onSelectCard: (card: Card) => void
  turnInProgress: boolean
  pendingCount: number
  pendingPoints: number
  onCompleteTurn: () => void
  onUndoLast: () => void
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  selectedCard,
  onSelectCard,
  turnInProgress,
  pendingCount,
  pendingPoints,
  onCompleteTurn,
  onUndoLast,
}) => {
  return (
    <>
      {turnInProgress && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 120,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <Button
            variant='contained'
            color='success'
            size='large'
            onClick={onCompleteTurn}
            disabled={pendingCount === 0}
            sx={{
              textTransform: 'none',
              fontSize: '1.1rem',
              padding: '10px 24px',
            }}
          >
            Complete Turn
          </Button>
          <Button
            variant='outlined'
            color='error'
            size='small'
            onClick={onUndoLast}
            disabled={pendingCount === 0}
          >
            Undo
          </Button>
        </Box>
      )}

      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '12px 12px 0 0',
          boxShadow:
            '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)',
          minWidth: 'fit-content',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {cards.map((card) => (
            <GameCard
              key={card.id}
              card={card}
              selected={selectedCard?.id === card.id}
              onClick={() => onSelectCard(card)}
            />
          ))}
        </div>
      </Box>
    </>
  )
}
