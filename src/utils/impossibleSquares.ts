import { PlacedCard, GridPosition, Card } from '../types/game';
import { getCardsInLine } from './gameLogic';

export function isImpossibleSquare(position: GridPosition, board: PlacedCard[]): boolean {
  // Check if this position would complete a line of 4 (making it the 5th)
  if (isCompletedLinePosition(position, board)) {
    return true;
  }
  
  // Check if this position has conflicting line requirements
  if (hasConflictingLines(position, board)) {
    return true;
  }
  
  return false;
}

function isCompletedLinePosition(position: GridPosition, board: PlacedCard[]): boolean {
  // Check horizontal line
  const horizontalLine = getCardsInLine(position, board, 'horizontal');
  if (horizontalLine.length >= 4) {
    return true;
  }
  
  // Check vertical line
  const verticalLine = getCardsInLine(position, board, 'vertical');
  if (verticalLine.length >= 4) {
    return true;
  }
  
  return false;
}

function hasConflictingLines(position: GridPosition, board: PlacedCard[]): boolean {
  const horizontalLine = getCardsInLine(position, board, 'horizontal');
  const verticalLine = getCardsInLine(position, board, 'vertical');
  
  // Need at least 2 cards in each line to determine requirements
  if (horizontalLine.length < 2 || verticalLine.length < 2) {
    return false;
  }
  
  // Get requirements for each line
  const horizontalReqs = getLineRequirements(horizontalLine);
  const verticalReqs = getLineRequirements(verticalLine);
  
  // Check if any card could satisfy both requirements
  return !canSatisfyBothRequirements(horizontalReqs, verticalReqs);
}

interface LineRequirements {
  numbers: 'same' | 'different' | 'any';
  colors: 'same' | 'different' | 'any';
  shapes: 'same' | 'different' | 'any';
  specificNumber?: number;
  specificColor?: string;
  specificShape?: string;
  forbiddenNumbers?: Set<number>;
  forbiddenColors?: Set<string>;
  forbiddenShapes?: Set<string>;
}

function getLineRequirements(line: PlacedCard[]): LineRequirements {
  if (line.length < 2) {
    return {
      numbers: 'any',
      colors: 'any',
      shapes: 'any'
    };
  }
  
  const numbers = line.map(p => p.card.number);
  const colors = line.map(p => p.card.color);
  const shapes = line.map(p => p.card.shape);
  
  const uniqueNumbers = new Set(numbers);
  const uniqueColors = new Set(colors);
  const uniqueShapes = new Set(shapes);
  
  const requirements: LineRequirements = {
    numbers: uniqueNumbers.size === 1 ? 'same' : 'different',
    colors: uniqueColors.size === 1 ? 'same' : 'different',
    shapes: uniqueShapes.size === 1 ? 'same' : 'different'
  };
  
  // For 'same' attributes, we know the specific value required
  if (requirements.numbers === 'same') {
    requirements.specificNumber = numbers[0];
  } else {
    // For 'different', we know which values are forbidden
    requirements.forbiddenNumbers = new Set(numbers);
  }
  
  if (requirements.colors === 'same') {
    requirements.specificColor = colors[0];
  } else {
    requirements.forbiddenColors = new Set(colors);
  }
  
  if (requirements.shapes === 'same') {
    requirements.specificShape = shapes[0];
  } else {
    requirements.forbiddenShapes = new Set(shapes);
  }
  
  return requirements;
}

function canSatisfyBothRequirements(req1: LineRequirements, req2: LineRequirements): boolean {
  // Check numbers
  if (req1.numbers === 'same' && req2.numbers === 'same') {
    if (req1.specificNumber !== req2.specificNumber) return false;
  }
  if (req1.numbers === 'same' && req2.numbers === 'different') {
    if (req2.forbiddenNumbers?.has(req1.specificNumber!)) return false;
  }
  if (req1.numbers === 'different' && req2.numbers === 'same') {
    if (req1.forbiddenNumbers?.has(req2.specificNumber!)) return false;
  }
  if (req1.numbers === 'different' && req2.numbers === 'different') {
    // Need at least one number not in either forbidden set
    const allNumbers = [1, 2, 3, 4] as const;
    const availableNumbers = allNumbers.filter(n => 
      !req1.forbiddenNumbers?.has(n) && !req2.forbiddenNumbers?.has(n)
    );
    if (availableNumbers.length === 0) return false;
  }
  
  // Check colors
  if (req1.colors === 'same' && req2.colors === 'same') {
    if (req1.specificColor !== req2.specificColor) return false;
  }
  if (req1.colors === 'same' && req2.colors === 'different') {
    if (req2.forbiddenColors?.has(req1.specificColor!)) return false;
  }
  if (req1.colors === 'different' && req2.colors === 'same') {
    if (req1.forbiddenColors?.has(req2.specificColor!)) return false;
  }
  if (req1.colors === 'different' && req2.colors === 'different') {
    const allColors = ['red', 'green', 'blue', 'yellow'];
    const availableColors = allColors.filter(c => 
      !req1.forbiddenColors?.has(c) && !req2.forbiddenColors?.has(c)
    );
    if (availableColors.length === 0) return false;
  }
  
  // Check shapes
  if (req1.shapes === 'same' && req2.shapes === 'same') {
    if (req1.specificShape !== req2.specificShape) return false;
  }
  if (req1.shapes === 'same' && req2.shapes === 'different') {
    if (req2.forbiddenShapes?.has(req1.specificShape!)) return false;
  }
  if (req1.shapes === 'different' && req2.shapes === 'same') {
    if (req1.forbiddenShapes?.has(req2.specificShape!)) return false;
  }
  if (req1.shapes === 'different' && req2.shapes === 'different') {
    const allShapes = ['triangle', 'square', 'circle', 'cross'];
    const availableShapes = allShapes.filter(s => 
      !req1.forbiddenShapes?.has(s) && !req2.forbiddenShapes?.has(s)
    );
    if (availableShapes.length === 0) return false;
  }
  
  return true;
}