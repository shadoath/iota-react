import React from 'react';
import { Box } from '@mui/material';
import { PlacedCard, GridPosition, Card } from '../types/game';
import { GameCard } from './GameCard';
import { getValidPlacements } from '../utils/gameLogic';

interface BoardComponentProps {
  board: PlacedCard[];
  onPlaceCard: (position: GridPosition) => void;
  selectedCard: Card | null;
}

export const BoardComponent: React.FC<BoardComponentProps> = ({ board, onPlaceCard, selectedCard }) => {
  const validPlacements = selectedCard ? getValidPlacements(board) : [];
  
  // Calculate board bounds
  let minRow = 0, maxRow = 0, minCol = 0, maxCol = 0;
  if (board.length > 0) {
    board.forEach(({ position }) => {
      minRow = Math.min(minRow, position.row);
      maxRow = Math.max(maxRow, position.row);
      minCol = Math.min(minCol, position.col);
      maxCol = Math.max(maxCol, position.col);
    });
  }
  
  // Add padding for valid placements
  minRow -= 1;
  maxRow += 1;
  minCol -= 1;
  maxCol += 1;
  
  const rows = maxRow - minRow + 1;
  const cols = maxCol - minCol + 1;
  
  const isValidPlacement = (row: number, col: number) => {
    return validPlacements.some(pos => pos.row === row && pos.col === col);
  };
  
  const getPlacedCard = (row: number, col: number) => {
    return board.find(placed => 
      placed.position.row === row && placed.position.col === col
    );
  };
  
  return (
    <Box className="relative overflow-auto max-h-[600px] max-w-full p-8 bg-gray-100 rounded-lg">
      <div 
        className="grid gap-2 w-fit mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(88px, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(104px, 1fr))`,
        }}
      >
        {Array.from({ length: rows * cols }).map((_, index) => {
          const row = Math.floor(index / cols) + minRow;
          const col = (index % cols) + minCol;
          const placedCard = getPlacedCard(row, col);
          const isValid = isValidPlacement(row, col);
          
          return (
            <div
              key={`${row}-${col}`}
              className={`
                w-22 h-26 flex items-center justify-center rounded-lg
                ${isValid && selectedCard ? 'bg-green-200 cursor-pointer hover:bg-green-300' : ''}
                ${!placedCard && !isValid ? 'bg-transparent' : ''}
              `}
              onClick={() => {
                if (isValid && selectedCard) {
                  onPlaceCard({ row, col });
                }
              }}
            >
              {placedCard && (
                <GameCard card={placedCard.card} disabled />
              )}
              {!placedCard && isValid && selectedCard && (
                <div className="w-20 h-24 border-2 border-dashed border-green-500 rounded-lg" />
              )}
            </div>
          );
        })}
      </div>
    </Box>
  );
};