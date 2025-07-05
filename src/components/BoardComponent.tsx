import type React from 'react'
import { Box } from '@mui/material'
import type { PlacedCard, GridPosition, Card } from '../types/game'
import { GameCard } from './GameCard'
import { getValidPlacements } from '../utils/gameLogic'
import { isImpossibleSquare } from '../utils/impossibleSquares'
import { useState, useEffect } from 'react'

interface BoardComponentProps {
  board: PlacedCard[]
  pendingPlacements: PlacedCard[]
  onPlaceCard: (position: GridPosition) => void
  selectedCard: Card | null
  zoomLevel?: number
}

export const BoardComponent: React.FC<BoardComponentProps> = ({
  board,
  pendingPlacements,
  onPlaceCard,
  selectedCard,
  zoomLevel = 1,
}) => {
  // Detect if we're on mobile
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const validPlacements = selectedCard
    ? getValidPlacements(board, pendingPlacements)
    : []

  // Calculate scaled sizes - larger on desktop
  const baseCellSize = isMobile ? 60 : 80
  const baseCardSize = isMobile ? 56 : 76
  const baseGap = isMobile ? 3 : 4
  
  const cellSize = baseCellSize * zoomLevel
  const cardSize = baseCardSize * zoomLevel
  const gap = baseGap * zoomLevel

  // Combine board and pending for display
  const allPlacements = [...board, ...pendingPlacements]

  // Calculate board bounds
  let minRow = 0
  let maxRow = 0
  let minCol = 0
  let maxCol = 0
  if (allPlacements.length > 0) {
    for (const { position } of allPlacements) {
      minRow = Math.min(minRow, position.row)
      maxRow = Math.max(maxRow, position.row)
      minCol = Math.min(minCol, position.col)
      maxCol = Math.max(maxCol, position.col)
    }
  }

  // Add padding for valid placements
  minRow -= 1
  maxRow += 1
  minCol -= 1
  maxCol += 1

  const rows = maxRow - minRow + 1
  const cols = maxCol - minCol + 1

  const isValidPlacement = (row: number, col: number) => {
    return validPlacements.some((pos) => pos.row === row && pos.col === col)
  }

  const getPlacedCard = (row: number, col: number) => {
    return allPlacements.find(
      (placed) => placed.position.row === row && placed.position.col === col
    )
  }

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'auto',
        maxHeight: '80vh',
        maxWidth: '100%',
        padding: { xs: '16px', md: '32px' },
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: `${gap}px`,
          width: 'fit-content',
          margin: '0 auto',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: rows * cols }).map((_, index) => {
          const row = Math.floor(index / cols) + minRow
          const col = (index % cols) + minCol
          const placedCard = getPlacedCard(row, col)
          const isValid = isValidPlacement(row, col)
          const isImpossible =
            !placedCard && isImpossibleSquare({ row, col }, allPlacements)

          return (
            <div
              key={`${row}-${col}`}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: `${8 * zoomLevel}px`,
                backgroundColor:
                  isValid && selectedCard ? '#bbf7d0' : 'transparent',
                cursor:
                  isValid && selectedCard && !isImpossible
                    ? 'pointer'
                    : 'default',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (isValid && selectedCard && !isImpossible) {
                  e.currentTarget.style.backgroundColor = '#86efac'
                }
              }}
              onMouseLeave={(e) => {
                if (isValid && selectedCard && !isImpossible) {
                  e.currentTarget.style.backgroundColor = '#bbf7d0'
                }
              }}
              onClick={() => {
                if (isValid && selectedCard && !isImpossible) {
                  onPlaceCard({ row, col })
                }
              }}
            >
              {placedCard && (
                <div style={{ transform: `scale(${zoomLevel})` }}>
                  <GameCard card={placedCard.card} disabled />
                </div>
              )}
              {!placedCard && isValid && selectedCard && !isImpossible && (
                <div
                  style={{
                    width: `${cardSize}px`,
                    height: `${cardSize}px`,
                    border: `${2 * zoomLevel}px dashed #22c55e`,
                    borderRadius: `${8 * zoomLevel}px`,
                  }}
                />
              )}
              {!placedCard && isImpossible && (
                <div
                  style={{
                    width: `${cardSize}px`,
                    height: `${cardSize}px`,
                    backgroundColor: '#292929',
                    borderRadius: '50%',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </Box>
  )
}
