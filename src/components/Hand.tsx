// components/Hand.tsx
import React from "react"
import { Grid } from "@mui/material"
import Card from "./Card"
import { useGameContext } from "../contexts/GameContext"

const Hand: React.FC = () => {
  const { state } = useGameContext()
  const currentPlayerHand = state.playerHands[state.currentPlayer]

  return (
    <Grid container spacing={1} justifyContent="space-around">
      {currentPlayerHand.map((card, index) => (
        <Grid item xs={3} key={index}>
          <Card shape={card.shape} color={card.color} number={card.number} />
        </Grid>
      ))}
    </Grid>
  )
}

export default Hand
