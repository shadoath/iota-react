// src/components/GameBoard.tsx
import React from 'react'
import { Grid, Paper } from '@mui/material'
import { useDrop } from 'react-dnd'
import { CardType } from '../types'

interface GameBoardProps {
  grid: (CardType | null)[][]
  onDropCard: (card: CardType, row: number, col: number) => void
}

const GameBoard: React.FC<GameBoardProps> = ({ grid, onDropCard }) => {
  return (
    <Grid container spacing={1}>
      {grid.map((row, rowIndex) => (
        <Grid item xs={12 / grid.length} key={rowIndex}>
          <Grid container spacing={1}>
            {row.map((cell, colIndex) => (
              <Grid item xs={12 / grid[rowIndex].length} key={colIndex}>
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
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item: CardType) => onDropCard(item, row, col),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  return (
    <Paper
      ref={drop}
      style={{
        height: '100px',
        width: '100px',
        backgroundColor: isOver ? 'lightgreen' : 'white',
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
