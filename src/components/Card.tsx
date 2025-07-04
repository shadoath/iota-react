// src/components/Card.tsx
import React from 'react'
import { useDrag } from 'react-dnd'
import { Paper } from '@mui/material'
import { CardType } from '../types'

const Card: React.FC<CardType> = ({ shape, color, number }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: { shape, color, number },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <Paper
      ref={drag}
      style={{
        padding: '10px',
        textAlign: 'center',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div>{shape}</div>
      <div>{color}</div>
      <div>{number}</div>
    </Paper>
  )
}

export default Card
