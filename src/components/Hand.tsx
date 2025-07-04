// src/components/Hand.tsx
import React from 'react'
import { Grid } from '@mui/material'
import Card from './Card'
import { CardType } from '../types'

interface HandProps {
  cards: CardType[]
}

const Hand: React.FC<HandProps> = ({ cards }) => {
  return (
    <Grid container spacing={1}>
      {cards.map((card, index) => (
        <Grid item xs={3} key={index}>
          <Card shape={card.shape} color={card.color} number={card.number} />
        </Grid>
      ))}
    </Grid>
  )
}

export default Hand
