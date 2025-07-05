// src/App.tsx
import type React from 'react'
import { useState } from 'react'
import { type CardType, type GameState, SHAPES, COLORS, NUMBERS } from './types'
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

  const handleDropCard = (card: CardType, row: number, col: number) => {
    // Check if the cell is empty
    if (gameState.grid[row][col] !== null) {
      return
    }

    // Update the grid with the new card
    const newGrid = gameState.grid.map((gridRow, rowIndex) =>
      gridRow.map((cell, colIndex) => {
        if (rowIndex === row && colIndex === col) {
          return card
        }
        return cell
      })
    )

    // Remove the card from the player's hand
    const newPlayerHands = [...gameState.playerHands]
    const currentPlayerHand = newPlayerHands[gameState.currentPlayer]
    const cardIndex = currentPlayerHand.findIndex(
      (c) =>
        c.shape === card.shape &&
        c.color === card.color &&
        c.number === card.number
    )

    if (cardIndex !== -1) {
      currentPlayerHand.splice(cardIndex, 1)
    }

    setGameState({
      ...gameState,
      grid: newGrid,
      playerHands: newPlayerHands,
    })
  }

  return (
    <div>
      <GameBoard grid={gameState.grid} onDropCard={handleDropCard} />
      <Hand cards={gameState.playerHands[gameState.currentPlayer]} />
      <ControlPanel onEndTurn={endTurn} />
    </div>
  )
}

export default App
