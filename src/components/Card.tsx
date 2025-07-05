// src/components/Card.tsx
import type React from 'react'
import { Paper } from '@mui/material'
import type { CardType } from '../types'

const Card: React.FC<CardType> = ({ shape, color, number }) => {
  return (
    <Paper
      style={{
        padding: '10px',
        textAlign: 'center',
      }}
    >
      <div>{shape}</div>
      <div>{color}</div>
      <div>{number}</div>
    </Paper>
  )
}

export default Card
