import { Card, PlacedCard, GridPosition } from '../types/game';
import { getCardsInLine, getAdjacentCards } from './gameLogic';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function getDetailedValidationError(
  card: Card,
  position: GridPosition,
  board: PlacedCard[]
): ValidationResult {
  // Check if adjacent to at least one card
  const adjacentCards = getAdjacentCards(position, board);
  if (adjacentCards.length === 0) {
    return { isValid: false, errorMessage: 'Card must be placed adjacent to existing cards' };
  }

  // Get all cards in the same line (horizontal and vertical)
  const horizontalLine = getCardsInLine(position, board, 'horizontal');
  const verticalLine = getCardsInLine(position, board, 'vertical');
  
  // Check horizontal line if it would have 2+ cards
  if (horizontalLine.length > 0) {
    const horizontalError = getLineValidationError([...horizontalLine, { card, position }], 'horizontal');
    if (horizontalError) {
      return { isValid: false, errorMessage: horizontalError };
    }
  }
  
  // Check vertical line if it would have 2+ cards
  if (verticalLine.length > 0) {
    const verticalError = getLineValidationError([...verticalLine, { card, position }], 'vertical');
    if (verticalError) {
      return { isValid: false, errorMessage: verticalError };
    }
  }
  
  return { isValid: true };
}

function getLineValidationError(line: PlacedCard[], direction: string): string | null {
  if (line.length < 2) return null;
  
  const numbers = line.map(p => p.card.number);
  const colors = line.map(p => p.card.color);
  const shapes = line.map(p => p.card.shape);
  
  // Check numbers
  const numberError = checkAttributeError(numbers, 'number', direction);
  if (numberError) return numberError;
  
  // Check colors
  const colorError = checkAttributeError(colors, 'color', direction);
  if (colorError) return colorError;
  
  // Check shapes
  const shapeError = checkAttributeError(shapes, 'shape', direction);
  if (shapeError) return shapeError;
  
  return null;
}

function checkAttributeError<T>(values: T[], attributeName: string, direction: string): string | null {
  const uniqueValues = new Set(values);
  const lineCards = values.slice(0, -1); // All except the card being placed
  const placingValue = values[values.length - 1]; // The card being placed
  
  if (uniqueValues.size !== 1 && uniqueValues.size !== values.length) {
    // Neither all same nor all different
    const existingUnique = new Set(lineCards);
    
    if (existingUnique.size === 1) {
      // Line requires all same
      const requiredValue = lineCards[0];
      return `${capitalize(direction)} line requires all ${attributeName}s to be ${formatValue(requiredValue)}, but you're trying to place ${formatValue(placingValue)}`;
    } else if (existingUnique.size === lineCards.length) {
      // Line requires all different
      if (lineCards.includes(placingValue)) {
        return `${capitalize(direction)} line requires all different ${attributeName}s, but ${formatValue(placingValue)} is already in the line`;
      }
    }
    
    return `${capitalize(direction)} line has mixed ${attributeName}s - must be either all the same or all different`;
  }
  
  return null;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatValue(value: any): string {
  if (typeof value === 'number') {
    return value.toString();
  }
  return value as string;
}