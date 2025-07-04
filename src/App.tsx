// src/App.tsx
import React, { useState } from 'react'
import { CardType, GameState, SHAPES, COLORS, NUMBERS } from './types'
import ControlPanel from './components/ControlPanel'
import GameBoard from './components/GameBoard'
import Hand from './components/Hand'

const initialCards: CardType[] = [
  // Define the 64 unique cards from SHAPES, COLORS, NUMBERS
  ...SHAPES.flatMap((shape) =>
    COLORS.flatMap((color) =>
      NUMBERS.map((number) => ({ shape, color, number }))
    )
  ),
  // and two wilds
  { shape: 'wild', color: 'wild', number: 0 },
  { shape: 'wild', color: 'wild', number: 0 },
]

const initializeGameState = (): GameState => {
  const shuffledDeck = [...initialCards].sort(() => 0.5 - Math.random())
  const playerHands = [shuffledDeck.splice(0, 4), shuffledDeck.splice(0, 4)]
  const grid = Array(9)
    .fill(null)
    .map(() => Array(9).fill(null))
  grid[4][4] = shuffledDeck.shift()! // Place the starter card

  return {
    grid,
    playerHands,
    drawPile: shuffledDeck,
    currentPlayer: 0,
    scores: [0, 0],
  }
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initializeGameState())

  const endTurn = () => {
    // Handle end turn logic
  }

  return (
    <div>
      <GameBoard grid={gameState.grid} />
      <Hand cards={gameState.playerHands[gameState.currentPlayer]} />
      <ControlPanel onEndTurn={endTurn} />
    </div>
  )
}

export default App
