import React from 'react';
import { Card } from '../types/game';
import { Box } from '@mui/material';

interface GameCardProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

const shapeComponents: Record<string, React.FC<{ color: string }>> = {
  triangle: ({ color }) => (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <polygon points="20,5 35,35 5,35" fill={color} />
    </svg>
  ),
  square: ({ color }) => (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <rect x="5" y="5" width="30" height="30" fill={color} />
    </svg>
  ),
  circle: ({ color }) => (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="15" fill={color} />
    </svg>
  ),
  cross: ({ color }) => (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <path d="M10,10 L30,30 M30,10 L10,30" stroke={color} strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),
};

const colorMap: Record<string, string> = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  yellow: '#eab308',
};

export const GameCard: React.FC<GameCardProps> = ({ card, onClick, selected, disabled }) => {
  const ShapeComponent = shapeComponents[card.shape];
  const color = colorMap[card.color];

  return (
    <Box
      onClick={disabled ? undefined : onClick}
      className={`
        relative w-20 h-24 bg-white rounded-lg shadow-md cursor-pointer
        transition-all duration-200 flex flex-col items-center justify-center
        ${selected ? 'ring-4 ring-blue-500 scale-105' : 'hover:scale-105'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
      `}
      sx={{
        border: '2px solid #e0e0e0',
      }}
    >
      <ShapeComponent color={color} />
      <span className="text-2xl font-bold mt-1" style={{ color }}>
        {card.number}
      </span>
    </Box>
  );
};