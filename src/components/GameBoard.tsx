// src/components/GameBoard.tsx
import type React from 'react'
import { Paper, Grid } from '@mui/material'
import type { CardType } from '../types'

interface GameBoardProps {
  grid: (CardType | null)[][]
  onDropCard: (card: CardType, row: number, col: number) => void
}

const GameBoard: React.FC<GameBoardProps> = ({ grid, onDropCard }) => {
  return (
    <Grid container spacing={1}>
      {grid.map((row, rowIndex) => (
        <Grid size={12 / grid.length} key={rowIndex}>
          <Grid container spacing={1}>
            {row.map((cell, colIndex) => (
              <Grid size={12 / grid[rowIndex].length} key={colIndex}>
                <DroppableCell
                  cell={cell}
                  row={rowIndex}
                  col={colIndex}
                  onDropCard={onDropCard}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      ))}
    </Grid>
  )
}

interface DroppableCellProps {
  cell: CardType | null
  row: number
  col: number
  onDropCard: (card: CardType, row: number, col: number) => void
}

const DroppableCell: React.FC<DroppableCellProps> = ({
  cell,
  row,
  col,
  onDropCard,
}) => {
  return (
    <Paper
      onClick={() => onDropCard({} as CardType, row, col)}
      style={{
        height: '100px',
        width: '100px',
        backgroundColor: 'white',
        cursor: 'pointer',
      }}
    >
      {cell ? (
        <span>
          {cell.shape}-{cell.color}-{cell.number}
        </span>
      ) : null}
    </Paper>
  )
}

export default GameBoard
