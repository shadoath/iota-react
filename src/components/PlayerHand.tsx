import React from 'react';
import { Box, Typography } from '@mui/material';
import { Card } from '../types/game';
import { GameCard } from './GameCard';

interface PlayerHandProps {
  cards: Card[];
  selectedCard: Card | null;
  onSelectCard: (card: Card) => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ cards, selectedCard, onSelectCard }) => {
  return (
    <Box className="bg-white p-4 rounded-lg shadow-lg">
      <Typography variant="h6" className="mb-4 text-gray-800">
        Your Hand
      </Typography>
      <div className="flex gap-3 flex-wrap justify-center">
        {cards.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            selected={selectedCard?.id === card.id}
            onClick={() => onSelectCard(card)}
          />
        ))}
      </div>
    </Box>
  );
};