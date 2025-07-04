'use client';

import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Alert, Paper } from '@mui/material';
import { Card, GameState, GridPosition } from '../types/game';
import { createDeck, isValidPlacement, calculateScore } from '../utils/gameLogic';
import { BoardComponent } from './BoardComponent';
import { PlayerHand } from './PlayerHand';

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    playerHand: [],
    board: [],
    currentPlayer: 1,
    score: 0,
  });
  
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [message, setMessage] = useState<string>('');

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const deck = createDeck();
    const playerHand = deck.slice(0, 4);
    const remainingDeck = deck.slice(4);
    
    // Place initial card in center
    const initialCard = remainingDeck[0];
    const board = [{
      card: initialCard,
      position: { row: 0, col: 0 }
    }];
    
    setGameState({
      deck: remainingDeck.slice(1),
      playerHand,
      board,
      currentPlayer: 1,
      score: 0,
    });
    
    setSelectedCard(null);
    setMessage('Game started! Select a card from your hand to play.');
  };

  const handleSelectCard = (card: Card) => {
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
      setMessage('');
    } else {
      setSelectedCard(card);
      setMessage('Click on a valid position (green squares) to place your card.');
    }
  };

  const handlePlaceCard = (position: GridPosition) => {
    if (!selectedCard) return;
    
    if (!isValidPlacement(selectedCard, position, gameState.board)) {
      setMessage('Invalid placement! Cards must share at least one attribute with adjacent cards.');
      return;
    }
    
    // Place the card
    const placedCard = {
      card: selectedCard,
      position
    };
    
    // Calculate score
    const points = calculateScore(placedCard, gameState.board);
    
    // Update game state
    const newHand = gameState.playerHand.filter(c => c.id !== selectedCard.id);
    const newCard = gameState.deck[0];
    
    setGameState(prev => ({
      ...prev,
      board: [...prev.board, placedCard],
      playerHand: newCard ? [...newHand, newCard] : newHand,
      deck: prev.deck.slice(1),
      score: prev.score + points,
    }));
    
    setSelectedCard(null);
    setMessage(`Card placed! You scored ${points} points.`);
    
    // Check game end
    if (newHand.length === 0 && !newCard) {
      setMessage(`Game Over! Final Score: ${gameState.score + points}`);
    }
  };

  return (
    <Container maxWidth="xl" className="py-8">
      <Box className="text-center mb-6">
        <Typography variant="h3" className="font-bold text-gray-800 mb-4">
          Iota Card Game
        </Typography>
        <Box className="flex justify-center gap-8 mb-4">
          <Paper className="px-4 py-2">
            <Typography variant="h6">Score: {gameState.score}</Typography>
          </Paper>
          <Paper className="px-4 py-2">
            <Typography variant="h6">Cards Left: {gameState.deck.length}</Typography>
          </Paper>
          <Button 
            variant="contained" 
            onClick={startNewGame}
            className="bg-blue-600 hover:bg-blue-700"
          >
            New Game
          </Button>
        </Box>
        {message && (
          <Alert severity="info" className="max-w-md mx-auto">
            {message}
          </Alert>
        )}
      </Box>
      
      <Box className="mb-8">
        <BoardComponent
          board={gameState.board}
          onPlaceCard={handlePlaceCard}
          selectedCard={selectedCard}
        />
      </Box>
      
      <PlayerHand
        cards={gameState.playerHand}
        selectedCard={selectedCard}
        onSelectCard={handleSelectCard}
      />
    </Container>
  );
};