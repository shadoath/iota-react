'use client'

import React, { useState, useCallback } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import type { Card, GridPosition } from '../types/game'
import type { UseSocketReturn } from '../multiplayer/useSocket'
import type { MultiplayerPlayerView } from '../multiplayer/protocol'
import { MAX_LINE_LENGTH } from '../constants/game'
import { BoardComponent } from './BoardComponent'
import { PlayerHand } from './PlayerHand'
import { GameCard } from './GameCard'
import { calculateScore } from '../utils/gameLogic'
import styles from './Game.module.css'
import scoreStyles from './ScoreBoard.module.css'

interface MultiplayerGameProps {
  socket: UseSocketReturn
  onLeave: () => void
}

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({ socket, onLeave }) => {
  const { gameState, hand, error } = socket
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1.0)

  const selectedCard = hand.find(c => c.id === selectedCardId) ?? null

  // Show errors as toasts
  React.useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const handleSelectCard = useCallback((card: Card) => {
    setSelectedCardId(prev => prev === card.id ? null : card.id)
  }, [])

  const handlePlaceCard = useCallback((position: GridPosition) => {
    if (!selectedCard) return
    socket.placeCard(selectedCard.id, position)
    setSelectedCardId(null)
  }, [selectedCard, socket])

  const handleCompleteTurn = useCallback(() => {
    socket.completeTurn()
  }, [socket])

  const handleUndo = useCallback(() => {
    socket.undoPlacement()
  }, [socket])

  if (!gameState) {
    return (
      <div className={styles.layout}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          Loading game...
        </div>
      </div>
    )
  }

  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === socket.playerId
  const pendingPoints = gameState.pendingPlacements.length > 0
    ? calculateScore(gameState.pendingPlacements, gameState.board)
    : 0

  return (
    <div className={styles.layout}>
      <Toaster position='top-center' />

      {/* Scoreboard */}
      <div className={scoreStyles.scoreboard}>
        {gameState.players.map((player: MultiplayerPlayerView, index: number) => {
          const isActive = index === gameState.currentPlayerIndex
          return (
            <div
              key={player.id}
              className={`${scoreStyles.playerTab} ${isActive ? scoreStyles.active : ''}`}
            >
              <span className={scoreStyles.playerTabName}>
                {player.name}
                {!player.connected && ' (disconnected)'}
              </span>
              <span className={scoreStyles.playerTabScore}>{player.score}</span>
              {isActive && pendingPoints > 0 && (
                <span className={scoreStyles.pendingScore}>+{pendingPoints}</span>
              )}
              <span className={scoreStyles.aiIndicator}>
                {player.cardCount} cards
              </span>
            </div>
          )
        })}
      </div>

      {/* Deck count */}
      <div className={styles.hintBadge}>
        Deck: {gameState.deckCount}
      </div>

      {/* Board */}
      <div className={styles.boardArea}>
        <BoardComponent
          board={gameState.board}
          pendingPlacements={gameState.pendingPlacements}
          onPlaceCard={handlePlaceCard}
          selectedCard={
            isMyTurn && gameState.pendingPlacements.length < MAX_LINE_LENGTH
              ? selectedCard
              : null
          }
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
        />
      </div>

      {/* Hand */}
      <PlayerHand
        cards={hand}
        selectedCard={selectedCard}
        onSelectCard={handleSelectCard}
        turnInProgress={gameState.turnInProgress && isMyTurn}
        pendingCount={gameState.pendingPlacements.length}
        pendingPoints={pendingPoints}
        onCompleteTurn={handleCompleteTurn}
        onUndoLast={handleUndo}
      />

      {/* Game over */}
      {gameState.gamePhase === 'ended' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 400,
        }}>
          <div style={{
            background: 'white', borderRadius: 12, padding: 32,
            maxWidth: 400, width: '100%', textAlign: 'center',
          }}>
            <h2 style={{ marginBottom: 16 }}>Game Over!</h2>
            {[...gameState.players]
              .sort((a, b) => b.score - a.score)
              .map((p, i) => (
                <div key={p.id} style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{i === 0 ? '🏆 ' : ''}{p.name}</span>
                  <strong>{p.score}</strong>
                </div>
              ))}
            <button
              onClick={onLeave}
              style={{
                marginTop: 16, padding: '12px 24px', background: 'var(--color-success)',
                color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: 16, fontWeight: 'bold',
              }}
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
