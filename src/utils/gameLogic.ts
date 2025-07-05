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

export function getValidPlacements(board: PlacedCard[], pendingPlacements: PlacedCard[] = []): GridPosition[] {
  const allPlacements = [...board, ...pendingPlacements];
  
  if (allPlacements.length === 0) {
    return [{ row: 0, col: 0 }];
  }
  
  const validPositions = new Set<string>();
  const occupiedPositions = new Set<string>();
  
  allPlacements.forEach(placed => {
    occupiedPositions.add(`${placed.position.row},${placed.position.col}`);
  });
  
  allPlacements.forEach(placed => {
    const adjacent = getAdjacentPositions(placed.position);
    adjacent.forEach(pos => {
      const key = `${pos.row},${pos.col}`;
      if (!occupiedPositions.has(key)) {
        validPositions.add(key);
      }
    });
  });
  
  // If there are pending placements, filter to only positions in the same line
  if (pendingPlacements.length > 0) {
    const filteredPositions = new Set<string>();
    
    // Check if all pending are in same row
    const firstRow = pendingPlacements[0].position.row;
    const allSameRow = pendingPlacements.every(p => p.position.row === firstRow);
    
    // Check if all pending are in same column
    const firstCol = pendingPlacements[0].position.col;
    const allSameCol = pendingPlacements.every(p => p.position.col === firstCol);
    
    validPositions.forEach(key => {
      const [row, col] = key.split(',').map(Number);
      
      if (allSameRow && row === firstRow) {
        filteredPositions.add(key);
      } else if (allSameCol && col === firstCol) {
        filteredPositions.add(key);
      } else if (pendingPlacements.length === 1) {
        // If only one pending, allow same row or column
        if (row === firstRow || col === firstCol) {
          filteredPositions.add(key);
        }
      }
    });
    
    return Array.from(filteredPositions).map(key => {
      const [row, col] = key.split(',').map(Number);
      return { row, col };
    });
  }
  
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
  
  // Get all cards in the same line (horizontal and vertical)
  const horizontalLine = getCardsInLine(position, board, 'horizontal');
  const verticalLine = getCardsInLine(position, board, 'vertical');
  
  // Check horizontal line if it would have 2+ cards
  if (horizontalLine.length > 0) {
    if (!isValidLine([...horizontalLine, { card, position }])) {
      return false;
    }
  }
  
  // Check vertical line if it would have 2+ cards
  if (verticalLine.length > 0) {
    if (!isValidLine([...verticalLine, { card, position }])) {
      return false;
    }
  }
  
  // Must be adjacent to at least one card
  const adjacentCards = getAdjacentCards(position, board);
  return adjacentCards.length > 0;
}

export function getCardsInLine(position: GridPosition, board: PlacedCard[], direction: 'horizontal' | 'vertical'): PlacedCard[] {
  const line: PlacedCard[] = [];
  
  // Add the card at the current position if it exists
  const currentCard = board.find(p => p.position.row === position.row && p.position.col === position.col);
  if (currentCard) {
    line.push(currentCard);
  }
  
  // Get cards in positive direction
  let currentPos = { ...position };
  while (true) {
    if (direction === 'horizontal') {
      currentPos.col++;
    } else {
      currentPos.row++;
    }
    
    const card = board.find(p => p.position.row === currentPos.row && p.position.col === currentPos.col);
    if (!card) break;
    line.push(card);
  }
  
  // Get cards in negative direction
  currentPos = { ...position };
  while (true) {
    if (direction === 'horizontal') {
      currentPos.col--;
    } else {
      currentPos.row--;
    }
    
    const card = board.find(p => p.position.row === currentPos.row && p.position.col === currentPos.col);
    if (!card) break;
    line.unshift(card);
  }
  
  return line;
}

function isValidLine(line: PlacedCard[]): boolean {
  if (line.length < 2) return true;
  
  // Check each attribute - must be all same or all different
  const numbers = line.map(p => p.card.number);
  const colors = line.map(p => p.card.color);
  const shapes = line.map(p => p.card.shape);
  
  return isValidAttribute(numbers) && isValidAttribute(colors) && isValidAttribute(shapes);
}

function isValidAttribute<T>(values: T[]): boolean {
  if (values.length < 2) return true;
  
  const uniqueValues = new Set(values);
  
  // Either all same (set size = 1) or all different (set size = length)
  return uniqueValues.size === 1 || uniqueValues.size === values.length;
}

export function getAdjacentCards(position: GridPosition, board: PlacedCard[]): PlacedCard[] {
  const adjacentPositions = getAdjacentPositions(position);
  return board.filter(placed =>
    adjacentPositions.some(
      pos => pos.row === placed.position.row && pos.col === placed.position.col
    )
  );
}

export function calculateScore(placements: PlacedCard[], board: PlacedCard[]): number {
  let totalScore = 0;
  const allCards = [...board, ...placements];
  const scoredLines = new Set<string>();
  
  // For each placed card, find all lines it's part of
  placements.forEach(placement => {
    // Check horizontal line
    const horizontalLine = getCardsInLine(placement.position, allCards, 'horizontal');
    if (horizontalLine.length >= 2) {
      const lineKey = getLineKey(horizontalLine, 'horizontal');
      if (!scoredLines.has(lineKey)) {
        scoredLines.add(lineKey);
        totalScore += horizontalLine.reduce((sum, p) => sum + p.card.number, 0);
      }
    }
    
    // Check vertical line
    const verticalLine = getCardsInLine(placement.position, allCards, 'vertical');
    if (verticalLine.length >= 2) {
      const lineKey = getLineKey(verticalLine, 'vertical');
      if (!scoredLines.has(lineKey)) {
        scoredLines.add(lineKey);
        totalScore += verticalLine.reduce((sum, p) => sum + p.card.number, 0);
      }
    }
    
    // If no line formed, just count the card itself
    if (horizontalLine.length < 2 && verticalLine.length < 2) {
      totalScore += placement.card.number;
    }
  });
  
  return totalScore;
}

function getLineKey(line: PlacedCard[], direction: string): string {
  const sorted = line.sort((a, b) => {
    if (direction === 'horizontal') {
      return a.position.col - b.position.col;
    }
    return a.position.row - b.position.row;
  });
  return `${direction}-${sorted[0].position.row},${sorted[0].position.col}-${sorted[sorted.length-1].position.row},${sorted[sorted.length-1].position.col}`;
}