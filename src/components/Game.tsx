'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import type { Card, GridPosition, GameSettings, GameMode } from '../types/game'
import { calculateScore, getValidPlacements, isValidPlacement } from '../utils/gameLogic'
import { MAX_LINE_LENGTH } from '../constants/game'
import { isPlacementInSameLineAsPending } from '../utils/turnValidation'
import { getDetailedValidationError } from '../utils/validationMessages'
import { computeAIMove } from '../ai/engine'
import { BoardComponent } from './BoardComponent'
import { PlayerHand } from './PlayerHand'
import { Sidebar } from './Sidebar'
import { GameSetup } from './GameSetup'
import { GameOver } from './GameOver'
import { ScoreBoard } from './ScoreBoard'
import { ModeSelect } from './ModeSelect'
import { Tutorial } from './Tutorial/Tutorial'
import { TurnTimer } from './TurnTimer'
import { Lobby } from './Lobby'
import { MultiplayerGame } from './MultiplayerGame'
import { useSocket } from '../multiplayer/useSocket'
import { GameProvider, useGame } from '../context/GameContext'
import { StatsPage } from './StatsPage'
import { recordGame } from '../stats/statsService'
import { checkAchievements, getAchievements, unlockTutorialAchievement, ACHIEVEMENTS } from '../stats/achievements'
import { getPlayerStats } from '../stats/statsService'
import type { GameResult } from '../stats/types'
import styles from './Game.module.css'

function GameInner() {
  const { state, dispatch } = useGame()
  const { game, selectedCardId, zoomLevel, lastActionResult } = state
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [lastSettings, setLastSettings] = useState<GameSettings | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic')
  const [showMultiplayer, setShowMultiplayer] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [gameStartTime] = useState(() => Date.now())
  const gameRecordedRef = useRef(false)
  const socket = useSocket()

  const currentPlayer = game.players[game.currentPlayerIndex]
  const isHumanTurn = currentPlayer?.type === 'human'

  const selectedCard = isHumanTurn
    ? (game.players[game.currentPlayerIndex]?.hand.find(c => c.id === selectedCardId) ?? null)
    : null

  // Show toast for action results
  const lastResultRef = useRef(lastActionResult)
  useEffect(() => {
    if (lastActionResult && lastActionResult !== lastResultRef.current) {
      if (lastActionResult.type === 'success') {
        toast.success(lastActionResult.message)
      } else if (lastActionResult.type === 'error') {
        toast.error(lastActionResult.message)
      } else {
        toast(lastActionResult.message)
      }
    }
    lastResultRef.current = lastActionResult
  }, [lastActionResult])

  // --- Record game result when game ends ---
  useEffect(() => {
    if (game.gamePhase !== 'ended' || gameRecordedRef.current) return
    if (game.players.length === 0) return
    gameRecordedRef.current = true

    const human = game.players.find(p => p.type === 'human')
    const winner = [...game.players].sort((a, b) => b.score - a.score)[0]

    const result: GameResult = {
      id: `game-${Date.now()}`,
      date: new Date().toISOString(),
      mode: game.gameMode,
      players: game.players.map(p => ({
        name: p.name,
        type: p.type,
        difficulty: p.difficulty,
        score: p.score,
        bestTurn: game.turnHistory
          .filter(t => t.playerId === p.id)
          .reduce((max, t) => Math.max(max, t.score), 0),
      })),
      winner: winner?.name ?? '',
      totalTurns: game.turnHistory.length,
      duration: Math.round((Date.now() - gameStartTime) / 1000),
    }

    recordGame(result)
    const stats = getPlayerStats()
    const newAchievements = checkAchievements(result, stats)

    for (const id of newAchievements) {
      const achievement = ACHIEVEMENTS.find(a => a.id === id)
      if (achievement) {
        toast.success(`Achievement unlocked: ${achievement.icon} ${achievement.name}`, {
          duration: 4000,
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.gamePhase])

  // Reset recorded flag on new game
  useEffect(() => {
    if (game.gamePhase === 'playing') {
      gameRecordedRef.current = false
    }
  }, [game.gamePhase])

  // --- AI turn execution ---
  const aiTurnRef = useRef(false)

  useEffect(() => {
    if (game.gamePhase !== 'playing') return
    if (!currentPlayer || currentPlayer.type !== 'ai') return
    if (aiTurnRef.current) return

    aiTurnRef.current = true
    setIsAIThinking(true)

    const thinkTime = currentPlayer.difficulty === 'hard' ? 1500
      : currentPlayer.difficulty === 'medium' ? 1000
      : 600

    const timer = setTimeout(() => {
      const move = computeAIMove(
        currentPlayer.hand,
        game.board,
        currentPlayer.difficulty!
      )

      if (move.length === 0) {
        if (currentPlayer.hand.length > 0 && game.deck.length > 0) {
          const randomCard = currentPlayer.hand[Math.floor(Math.random() * currentPlayer.hand.length)]
          dispatch({ type: 'SWAP_CARDS', cardIds: [randomCard.id] })
        } else {
          dispatch({ type: 'AI_TURN', placements: [] })
        }
      } else {
        dispatch({ type: 'AI_TURN', placements: move })
      }

      setIsAIThinking(false)
      aiTurnRef.current = false
    }, thinkTime)

    return () => {
      clearTimeout(timer)
      setIsAIThinking(false)
      aiTurnRef.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.currentPlayerIndex, game.gamePhase])

  // --- Handlers ---

  const handleSelectMode = useCallback((mode: GameMode) => {
    setSelectedMode(mode)
    dispatch({ type: 'SHOW_SETUP', mode })
  }, [dispatch])

  const handleStartGame = useCallback((settings: GameSettings) => {
    setLastSettings(settings)
    dispatch({ type: 'START_GAME', settings })
  }, [dispatch])

  const handlePlayAgain = useCallback(() => {
    if (lastSettings) {
      dispatch({ type: 'START_GAME', settings: lastSettings })
    }
  }, [dispatch, lastSettings])

  const handleSelectCard = (card: Card) => {
    if (!isHumanTurn || isAIThinking) return
    dispatch({ type: 'SELECT_CARD', cardId: card.id })
  }

  const handlePlaceCard = (position: GridPosition) => {
    if (!selectedCard || !isHumanTurn) return

    if (!isPlacementInSameLineAsPending(position, game.pendingPlacements)) {
      toast.error('All cards in a turn must be placed in the same row or column!')
      return
    }

    const allPlacements = [...game.board, ...game.pendingPlacements]
    const validationResult = getDetailedValidationError(selectedCard, position, allPlacements)

    if (!validationResult.isValid) {
      toast.error(validationResult.errorMessage || 'Invalid placement!')
      return
    }

    dispatch({ type: 'PLACE_CARD', card: selectedCard, position })

    if (game.pendingPlacements.length + 1 >= MAX_LINE_LENGTH) {
      toast('Maximum 4 cards per turn!', { icon: '⚠️' })
    }
  }

  const handleTimeout = useCallback(() => {
    toast.error('Time\'s up! Turn skipped.')
    // Auto-complete if cards placed, otherwise skip
    if (game.pendingPlacements.length > 0) {
      dispatch({ type: 'COMPLETE_TURN' })
    } else {
      // Swap a random card as penalty
      const humanPlayer = game.players.find(p => p.type === 'human')
      if (humanPlayer && humanPlayer.hand.length > 0 && game.deck.length > 0) {
        dispatch({ type: 'SWAP_CARDS', cardIds: [humanPlayer.hand[0].id] })
      } else {
        dispatch({ type: 'COMPLETE_TURN' })
      }
    }
  }, [dispatch, game.pendingPlacements.length, game.players, game.deck.length])

  const pendingPoints = game.pendingPlacements.length > 0
    ? calculateScore(game.pendingPlacements, game.board)
    : 0

  // --- Practice mode: compute score previews for valid positions ---
  const scoreHints = React.useMemo(() => {
    if (!game.hintsEnabled || !selectedCard || !isHumanTurn) return null

    const allPlacements = [...game.board, ...game.pendingPlacements]
    const validPositions = getValidPlacements(game.board, game.pendingPlacements)
    const hints: Record<string, number> = {}

    for (const pos of validPositions) {
      if (!isPlacementInSameLineAsPending(pos, game.pendingPlacements)) continue
      if (!isValidPlacement(selectedCard, pos, allPlacements)) continue

      const testPlacement = { card: selectedCard, position: pos }
      const score = calculateScore(
        [...game.pendingPlacements, testPlacement],
        game.board
      )
      hints[`${pos.row},${pos.col}`] = score
    }

    return hints
  }, [game.hintsEnabled, selectedCard, isHumanTurn, game.board, game.pendingPlacements])

  // --- Stats page ---
  if (showStats) {
    return <StatsPage onBack={() => setShowStats(false)} />
  }

  // --- Multiplayer ---
  if (showMultiplayer) {
    // If in a game, show the multiplayer game view
    if (socket.gameState) {
      return (
        <MultiplayerGame
          socket={socket}
          onLeave={() => {
            socket.leaveRoom()
            setShowMultiplayer(false)
          }}
        />
      )
    }
    // Otherwise show lobby
    return (
      <Lobby
        socket={socket}
        onBack={() => setShowMultiplayer(false)}
      />
    )
  }

  // --- Tutorial ---
  if (showTutorial) {
    return (
      <Tutorial
        onComplete={() => {
          setShowTutorial(false)
          if (unlockTutorialAchievement()) {
            toast.success('Achievement unlocked: \u{1F393} Student', { duration: 4000 })
          }
          dispatch({ type: 'SHOW_MENU' })
        }}
        onBack={() => {
          setShowTutorial(false)
          dispatch({ type: 'SHOW_MENU' })
        }}
      />
    )
  }

  // --- Menu screen ---
  if (game.gamePhase === 'menu') {
    return (
      <ModeSelect
        onSelectMode={handleSelectMode}
        onTutorial={() => setShowTutorial(true)}
        onMultiplayer={() => setShowMultiplayer(true)}
        onStats={() => setShowStats(true)}
      />
    )
  }

  // --- Setup screen ---
  if (game.gamePhase === 'setup') {
    return (
      <GameSetup
        mode={game.gameMode}
        onStartGame={handleStartGame}
        onBack={() => dispatch({ type: 'SHOW_MENU' })}
      />
    )
  }

  const humanPlayer = game.players.find(p => p.type === 'human')
  const humanHand = humanPlayer?.hand ?? []

  return (
    <div className={styles.layout} role='main'>
      <Toaster position='top-center' />

      {/* Screen reader announcements */}
      <div
        aria-live='polite'
        aria-atomic='true'
        className='sr-only'
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        {lastActionResult?.message}
      </div>

      <Sidebar
        cardsLeft={game.deck.length}
        lastTurnScore={game.lastTurnScore}
        pendingPoints={pendingPoints}
        pendingCount={game.pendingPlacements.length}
        turnInProgress={game.turnInProgress}
        onNewGame={() => dispatch({ type: 'SHOW_MENU' })}
        onCompleteTurn={() => dispatch({ type: 'COMPLETE_TURN' })}
        onUndoLast={() => dispatch({ type: 'UNDO_PLACEMENT' })}
      />

      {/* Multi-player scoreboard */}
      <ScoreBoard
        players={game.players}
        currentPlayerIndex={game.currentPlayerIndex}
        pendingPoints={pendingPoints}
        isAIThinking={isAIThinking}
      />

      {/* Turn timer for timed mode */}
      {game.turnTimeLimit && isHumanTurn && (
        <TurnTimer
          timeLimit={game.turnTimeLimit}
          onTimeout={handleTimeout}
          isActive={isHumanTurn && !isAIThinking && game.gamePhase === 'playing'}
          resetKey={game.turnHistory.length}
        />
      )}

      {/* Practice mode hint badge */}
      {game.hintsEnabled && (
        <div className={styles.hintBadge}>Practice Mode</div>
      )}

      {/* Board area */}
      <div className={styles.boardArea}>
        <BoardComponent
          board={game.board}
          pendingPlacements={game.pendingPlacements}
          onPlaceCard={handlePlaceCard}
          selectedCard={
            isHumanTurn && game.pendingPlacements.length < MAX_LINE_LENGTH
              ? selectedCard
              : null
          }
          zoomLevel={zoomLevel}
          onZoomChange={(zoom) => dispatch({ type: 'SET_ZOOM', zoom })}
          scoreHints={scoreHints}
        />
      </div>

      {/* Player hand */}
      <PlayerHand
        cards={humanHand}
        selectedCard={selectedCard}
        onSelectCard={handleSelectCard}
        turnInProgress={game.turnInProgress && isHumanTurn}
        pendingCount={game.pendingPlacements.length}
        pendingPoints={pendingPoints}
        onCompleteTurn={() => dispatch({ type: 'COMPLETE_TURN' })}
        onUndoLast={() => dispatch({ type: 'UNDO_PLACEMENT' })}
      />

      {/* Game Over overlay */}
      {game.gamePhase === 'ended' && (
        <GameOver
          players={game.players}
          turnHistory={game.turnHistory}
          onPlayAgain={handlePlayAgain}
          onNewSetup={() => dispatch({ type: 'SHOW_MENU' })}
        />
      )}
    </div>
  )
}

export const Game: React.FC = () => {
  return (
    <GameProvider>
      <GameInner />
    </GameProvider>
  )
}
