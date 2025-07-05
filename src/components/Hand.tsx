// src/components/Hand.tsx
import type React from 'react'
import { Grid } from '@mui/material'
import Card from './Card'
import type { CardType } from '../types'

interface HandProps {
  cards: CardType[]
}

const Hand: React.FC<HandProps> = ({ cards }) => {
  return (
    <Grid container spacing={1}>
      {cards.map((card) => (
        <Grid size={3} key={`${card.shape}-${card.color}-${card.number}`}>
          <Card shape={card.shape} color={card.color} number={card.number} />
        </Grid>
      ))}
    </Grid>
  )
}

export default Hand
