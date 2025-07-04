import { Card, CardColor, CardNumber, CardShape, PlacedCard, GridPosition } from '../types/game';

export function createDeck(): Card[] {
  const numbers: CardNumber[] = [1, 2, 3, 4];
  const colors: CardColor[] = ['red', 'green', 'blue', 'yellow'];
  const shapes: CardShape[] = ['triangle', 'square', 'circle', 'cross'];
  
  const deck: Card[] = [];
  let id = 0;
  
  for (const number of numbers) {
    for (const color of colors) {
      for (const shape of shapes) {
        deck.push({
          id: `card-${id++}`,
          number,
          color,
          shape
        });
      }
    }
  }
  
  // Add 2 wild cards (can match any attribute)
  deck.push({ id: `card-${id++}`, number: 1, color: 'red', shape: 'triangle' });
  deck.push({ id: `card-${id}`, number: 1, color: 'red', shape: 'triangle' });
  
  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getAdjacentPositions(position: GridPosition): GridPosition[] {
  return [
    { row: position.row - 1, col: position.col }, // top
    { row: position.row + 1, col: position.col }, // bottom
    { row: position.row, col: position.col - 1 }, // left
    { row: position.row, col: position.col + 1 }, // right
  ];
}

export function getValidPlacements(board: PlacedCard[]): GridPosition[] {
  if (board.length === 0) {
    return [{ row: 0, col: 0 }];
  }
  
  const validPositions = new Set<string>();
  const occupiedPositions = new Set<string>();
  
  board.forEach(placed => {
    occupiedPositions.add(`${placed.position.row},${placed.position.col}`);
  });
  
  board.forEach(placed => {
    const adjacent = getAdjacentPositions(placed.position);
    adjacent.forEach(pos => {
      const key = `${pos.row},${pos.col}`;
      if (!occupiedPositions.has(key)) {
        validPositions.add(key);
      }
    });
  });
  
  return Array.from(validPositions).map(key => {
    const [row, col] = key.split(',').map(Number);
    return { row, col };
  });
}

export function isValidPlacement(
  card: Card,
  position: GridPosition,
  board: PlacedCard[]
): boolean {
  // Check if position is valid
  const validPositions = getValidPlacements(board);
  const isPositionValid = validPositions.some(
    pos => pos.row === position.row && pos.col === position.col
  );
  
  if (!isPositionValid) return false;
  
  // Check adjacent cards for matching rules
  const adjacentCards = getAdjacentCards(position, board);
  
  // For each adjacent card, at least one attribute must match
  for (const adjacent of adjacentCards) {
    const hasMatchingAttribute = 
      card.number === adjacent.card.number ||
      card.color === adjacent.card.color ||
      card.shape === adjacent.card.shape;
    
    if (!hasMatchingAttribute) {
      return false;
    }
  }
  
  return true;
}

export function getAdjacentCards(position: GridPosition, board: PlacedCard[]): PlacedCard[] {
  const adjacentPositions = getAdjacentPositions(position);
  return board.filter(placed =>
    adjacentPositions.some(
      pos => pos.row === placed.position.row && pos.col === placed.position.col
    )
  );
}

export function calculateScore(placedCard: PlacedCard, board: PlacedCard[]): number {
  const adjacentCards = getAdjacentCards(placedCard.position, board);
  let score = 0;
  
  adjacentCards.forEach(adjacent => {
    let matches = 0;
    if (placedCard.card.number === adjacent.card.number) matches++;
    if (placedCard.card.color === adjacent.card.color) matches++;
    if (placedCard.card.shape === adjacent.card.shape) matches++;
    
    // Score based on number of matching attributes
    score += matches;
  });
  
  return score;
}