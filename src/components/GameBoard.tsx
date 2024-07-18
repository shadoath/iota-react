import React from "react"
import { Grid, Paper } from "@mui/material"
import { useDrop } from "react-dnd"
import { CardType } from "../types"
import { useGameContext } from "../contexts/GameContext"
import Card from "./Card"
import { isValidMove } from "../lib/checks"

const GameBoard = () => {
  const { state, dispatch } = useGameContext()

  const onDropCard = (card: CardType, row: number, col: number) => {
    dispatch({ type: "DROP_CARD", card, row, col })
  }

  return (
    <Grid container spacing={0.5}>
      {state.grid.map((row, rowIndex) => (
        <Grid item key={rowIndex}>
          <Grid container spacing={0.5}>
            {row.map((cell, colIndex) => (
              <Grid item key={colIndex}>
                <DroppableCell cell={cell} row={rowIndex} col={colIndex} onDropCard={onDropCard} />
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

const DroppableCell: React.FC<DroppableCellProps> = ({ cell, row, col, onDropCard }) => {
  const { state } = useGameContext()
  const [{ isOver, canDrop, item }, drop] = useDrop(() => ({
    accept: "CARD",
    drop: (item: CardType) => onDropCard(item, row, col),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: monitor.canDrop(),
      item: monitor.getItem(),
    }),
    canDrop: (item: CardType) => cell === null && isValidMove(state.grid, item, row, col),
  }))

  return (
    <Paper
      ref={drop}
      style={{
        padding: "10px",
        height: "80px",
        width: "80px",
        backgroundColor: isOver ? (canDrop ? "lightgreen" : "lightcoral") : "white",
        border: "2px solid black",
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
      }}
    >
      {cell ? <Card shape={cell.shape} color={cell.color} number={cell.number} /> : null}
    </Paper>
  )
}

export default GameBoard
