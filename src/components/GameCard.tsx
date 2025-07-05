import type React from 'react'
import type { Card } from '../types/game'
import { Box } from '@mui/material'

interface GameCardProps {
  card: Card
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
}

const shapeComponents: Record<string, React.FC<{ color: string }>> = {
  triangle: ({ color }) => (
    <svg
      width='28'
      height='28'
      viewBox='0 0 40 40'
      aria-label='Triangle'
      role='img'
    >
      <polygon points='20,5 35,35 5,35' fill={color} />
    </svg>
  ),
  square: ({ color }) => (
    <svg
      width='28'
      height='28'
      viewBox='0 0 40 40'
      aria-label='Square'
      role='img'
    >
      <rect x='5' y='5' width='30' height='30' fill={color} />
    </svg>
  ),
  circle: ({ color }) => (
    <svg
      width='28'
      height='28'
      viewBox='0 0 40 40'
      aria-label='Circle'
      role='img'
    >
      <circle cx='20' cy='20' r='15' fill={color} />
    </svg>
  ),
  cross: ({ color }) => (
    <svg
      width='28'
      height='28'
      viewBox='0 0 40 40'
      aria-label='Cross'
      role='img'
    >
      <path
        d='M10,10 L30,30 M30,10 L10,30'
        stroke={color}
        strokeWidth='6'
        strokeLinecap='round'
      />
    </svg>
  ),
}

const colorMap: Record<string, string> = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  yellow: '#eab308',
}

export const GameCard: React.FC<GameCardProps> = ({
  card,
  onClick,
  selected,
  disabled,
}) => {
  const ShapeComponent = shapeComponents[card.shape]
  const color = colorMap[card.color]

  return (
    <Box
      onClick={disabled ? undefined : onClick}
      className='game-card'
      sx={{
        position: 'relative',
        width: '56px',
        height: '56px',
        backgroundColor: 'black',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #e0e0e0',
        opacity: disabled ? 0.5 : 1,
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        boxShadow: selected
          ? '0 0 0 2px #3b82f6'
          : '0 2px 4px rgba(0, 0, 0, 0.1)',
        '&:hover': disabled
          ? {}
          : {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            },
      }}
    >
      <ShapeComponent color={color} />
      <span
        style={{
          fontSize: '1rem',
          fontWeight: 'bold',
          marginTop: '2px',
          color,
        }}
      >
        {card.number}
      </span>
    </Box>
  )
}
