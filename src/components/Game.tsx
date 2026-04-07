"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import toast, { Toaster } from "react-hot-toast"
import { GameLog, LotCelebration, KeyboardHints, type LogEntry } from "./GameLog"
import type { Card, GridPosition, GameSettings, GameMode, PlacedCard } from "../types/game"
import { calculateScore, getValidPlacements, isValidPlacement, canReplaceWild } from "../utils/gameLogic"
import { MAX_LINE_LENGTH, PLAYER_COLORS } from "../constants/game"
import { isPlacementInSameLineAsPending } from "../utils/turnValidation"
import { getDetailedValidationError } from "../utils/validationMessages"
import { computeAIMove } from "../ai/engine"
import { BoardComponent } from "./BoardComponent"
import { PlayerHand } from "./PlayerHand"
import { Sidebar } from "./Sidebar"
import { GameSetup } from "./GameSetup"
import { GameOver } from "./GameOver"
import { ScoreBoard } from "./ScoreBoard"
import { ModeSelect } from "./ModeSelect"
import { Tutorial } from "./Tutorial/Tutorial"
import { TurnTimer } from "./TurnTimer"
import { Lobby } from "./Lobby"
import { MultiplayerGame } from "./MultiplayerGame"
import { useSocket } from "../multiplayer/useSocket"
import { GameProvider, useGame } from "../context/GameContext"
import { StatsPage } from "./StatsPage"
import { recordGame } from "../stats/statsService"
import {
  checkAchievements,
  getAchievements,
  unlockTutorialAchievement,
  ACHIEVEMENTS,
} from "../stats/achievements"
import { getPlayerStats } from "../stats/statsService"
import type { GameResult } from "../stats/types"
import { Replay } from "./Replay"
import { PatternTrainer } from "./PatternTrainer"
import { useOnlineStatus } from "../hooks/useOnlineStatus"
import { useInstallPrompt } from "../hooks/useInstallPrompt"
import { useHelpers } from "../hooks/useHelpers"
import { useSound } from "../hooks/useSound"
import { findLotCompletingCards, findBestMove, getAttributeHint } from "../utils/helpers"
import { DailyChallenge } from "./DailyChallenge"
import { recordDailyResult } from "../stats/dailyChallenge"
import {
  trackGameStart,
  trackGameEnd,
  trackTurnComplete,
  trackModeSelected,
  trackAchievementUnlocked,
  trackDailyChallenge,
  trackHelperToggled,
  trackError,
  trackReplayStarted,
} from "../analytics/posthog"
import styles from "./Game.module.css"

function GameInner() {
  const { state, dispatch } = useGame()
  const { game, selectedCardId, zoomLevel, lastActionResult } = state
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [lastSettings, setLastSettings] = useState<GameSettings | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic")
  const [showMultiplayer, setShowMultiplayer] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showReplay, setShowReplay] = useState(false)
  const [showTrainer, setShowTrainer] = useState(false)
  const [showDaily, setShowDaily] = useState(false)
  const [gameStartTime] = useState(() => Date.now())
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [swapMode, setSwapMode] = useState(false)
  const [swapSelected, setSwapSelected] = useState<Set<string>>(new Set())
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationKey, setCelebrationKey] = useState(0)
  const logIdRef = useRef(0)
  const initialBoardRef = useRef<PlacedCard[]>([])
  const gameRecordedRef = useRef(false)
  const socket = useSocket()
  const { isOnline } = useOnlineStatus()
  const { canInstall, promptInstall } = useInstallPrompt()
  const { helpers, toggleHelper } = useHelpers()
  const sound = useSound()

  const addLogEntry = useCallback(
    (message: string, type: LogEntry["type"]) => {
      logIdRef.current++
      setLogEntries((prev) => [
        ...prev.slice(-20),
        {
          id: `log-${logIdRef.current}`,
          message,
          type,
          turn: game.turnHistory.length + 1,
        },
      ])
    },
    [game.turnHistory.length]
  )

  const currentPlayer = game.players[game.currentPlayerIndex]
  const isHumanTurn = currentPlayer?.type === "human"

  const selectedCard = isHumanTurn
    ? (game.players[game.currentPlayerIndex]?.hand.find((c) => c.id === selectedCardId) ?? null)
    : null

  // --- Keyboard shortcuts ---
  useEffect(() => {
    if (game.gamePhase !== "playing" || !isHumanTurn) return

    const humanPlayer = game.players.find((p) => p.type === "human")
    if (!humanPlayer) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in an input
      if ((e.target as HTMLElement).tagName === "INPUT") return

      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= 4 && num <= humanPlayer.hand.length) {
        // 1-4: select card
        if (swapMode) {
          const card = humanPlayer.hand[num - 1]
          setSwapSelected((prev) => {
            const next = new Set(prev)
            if (next.has(card.id)) next.delete(card.id)
            else next.add(card.id)
            return next
          })
        } else {
          const card = humanPlayer.hand[num - 1]
          dispatch({ type: "SELECT_CARD", cardId: card.id })
        }
      } else if (e.key === "Enter" || e.key === " ") {
        // Enter/Space: complete turn (or confirm swap)
        e.preventDefault()
        if (swapMode && swapSelected.size > 0) {
          dispatch({ type: "SWAP_CARDS", cardIds: Array.from(swapSelected) })
          setSwapMode(false)
          setSwapSelected(new Set())
        } else if (game.pendingPlacements.length > 0) {
          dispatch({ type: "COMPLETE_TURN" })
        }
      } else if (e.key === "u" || e.key === "U") {
        // U: undo
        dispatch({ type: "UNDO_PLACEMENT" })
      } else if (e.key === "s" || e.key === "S") {
        // S: toggle swap mode
        if (!game.turnInProgress) {
          setSwapMode((prev) => !prev)
          setSwapSelected(new Set())
          dispatch({ type: "DESELECT_CARD" })
        }
      } else if (e.key === "Escape") {
        // Escape: cancel
        if (swapMode) {
          setSwapMode(false)
          setSwapSelected(new Set())
        } else {
          dispatch({ type: "DESELECT_CARD" })
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [game.gamePhase, isHumanTurn, game.players, dispatch, swapMode, swapSelected, game.pendingPlacements.length, game.turnInProgress])

  // Route action results to game log (not toast)
  const lastResultRef = useRef(lastActionResult)
  useEffect(() => {
    if (lastActionResult && lastActionResult !== lastResultRef.current) {
      addLogEntry(lastActionResult.message, lastActionResult.type)

      // Sound effects
      if (lastActionResult.type === "success" && lastActionResult.message.includes("points")) {
        sound.playTurnComplete()
      } else if (lastActionResult.type === "error") {
        sound.playInvalidMove()
        // Errors still show as toast for immediate visibility
        toast.error(lastActionResult.message)
      } else if (lastActionResult.message === "Placement undone") {
        sound.playUndo()
      }
    }
    lastResultRef.current = lastActionResult
  }, [lastActionResult, sound, addLogEntry])

  // --- Record game result when game ends ---
  useEffect(() => {
    if (game.gamePhase !== "ended" || gameRecordedRef.current) return
    if (game.players.length === 0) return
    gameRecordedRef.current = true

    const human = game.players.find((p) => p.type === "human")
    const winner = [...game.players].sort((a, b) => b.score - a.score)[0]

    const result: GameResult = {
      id: `game-${Date.now()}`,
      date: new Date().toISOString(),
      mode: game.gameMode,
      players: game.players.map((p) => ({
        name: p.name,
        type: p.type,
        difficulty: p.difficulty,
        score: p.score,
        bestTurn: game.turnHistory
          .filter((t) => t.playerId === p.id)
          .reduce((max, t) => Math.max(max, t.score), 0),
      })),
      winner: winner?.name ?? "",
      totalTurns: game.turnHistory.length,
      duration: Math.round((Date.now() - gameStartTime) / 1000),
    }

    recordGame(result)
    sound.playGameOver()

    // Track game end
    trackGameEnd(
      result.mode,
      result.winner,
      human?.score ?? 0,
      result.totalTurns,
      result.duration,
      result.winner === human?.name
    )

    // Record daily challenge result
    if (game.gameMode === "daily") {
      const humanPlayer = game.players.find((p) => p.type === "human")
      if (humanPlayer) {
        recordDailyResult(humanPlayer.score)
        const { getDailyHistory } = require("../stats/dailyChallenge")
        const history = getDailyHistory()
        trackDailyChallenge(humanPlayer.score, history.currentStreak)
      }
    }

    const stats = getPlayerStats()
    const newAchievements = checkAchievements(result, stats)

    for (const id of newAchievements) {
      trackAchievementUnlocked(id)
      const achievement = ACHIEVEMENTS.find((a) => a.id === id)
      if (achievement) {
        sound.playAchievement()
        toast.success(`Achievement unlocked: ${achievement.icon} ${achievement.name}`, {
          duration: 4000,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.gamePhase])

  // Reset recorded flag and capture initial board on new game
  useEffect(() => {
    if (game.gamePhase === "playing") {
      gameRecordedRef.current = false
      if (game.board.length === 1 && game.turnHistory.length === 0) {
        initialBoardRef.current = [...game.board]
      }
      setShowReplay(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.gamePhase])

  // --- AI turn execution ---
  const aiTurnRef = useRef(false)

  useEffect(() => {
    if (game.gamePhase !== "playing") return
    if (!currentPlayer || currentPlayer.type !== "ai") return
    if (aiTurnRef.current) return

    aiTurnRef.current = true
    setIsAIThinking(true)

    const thinkTime =
      currentPlayer.difficulty === "hard"
        ? 1500
        : currentPlayer.difficulty === "medium"
          ? 1000
          : 600

    const timer = setTimeout(() => {
      const move = computeAIMove(currentPlayer.hand, game.board, currentPlayer.difficulty!)

      if (move.length === 0) {
        if (currentPlayer.hand.length > 0 && game.deck.length > 0) {
          const randomCard =
            currentPlayer.hand[Math.floor(Math.random() * currentPlayer.hand.length)]
          dispatch({ type: "SWAP_CARDS", cardIds: [randomCard.id] })
        } else {
          dispatch({ type: "AI_TURN", placements: [] })
        }
      } else {
        dispatch({ type: "AI_TURN", placements: move })
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

  const handleSelectMode = useCallback(
    (mode: GameMode) => {
      setSelectedMode(mode)
      trackModeSelected(mode)
      dispatch({ type: "SHOW_SETUP", mode })
    },
    [dispatch]
  )

  const handleStartGame = useCallback(
    (settings: GameSettings) => {
      setLastSettings(settings)
      trackGameStart(
        settings.mode,
        settings.playerCount,
        settings.aiPlayers.map((a) => a.difficulty)
      )
      dispatch({ type: "START_GAME", settings })
    },
    [dispatch]
  )

  const handlePlayAgain = useCallback(() => {
    if (lastSettings) {
      dispatch({ type: "START_GAME", settings: lastSettings })
    }
  }, [dispatch, lastSettings])

  const handleSelectCard = (card: Card) => {
    if (!isHumanTurn || isAIThinking) return
    dispatch({ type: "SELECT_CARD", cardId: card.id })
  }

  const handlePlaceCard = (position: GridPosition) => {
    if (!selectedCard || !isHumanTurn) return

    if (!isPlacementInSameLineAsPending(position, game.pendingPlacements)) {
      toast.error("All cards in a turn must be placed in the same row or column!")
      return
    }

    const allPlacements = [...game.board, ...game.pendingPlacements]
    const validationResult = getDetailedValidationError(selectedCard, position, allPlacements)

    if (!validationResult.isValid) {
      toast.error(validationResult.errorMessage || "Invalid placement!")
      return
    }

    dispatch({ type: "PLACE_CARD", card: selectedCard, position })
    sound.playCardPlace()

    if (game.pendingPlacements.length + 1 >= MAX_LINE_LENGTH) {
      sound.playLotBonus()
      setShowCelebration(true)
      setCelebrationKey((k) => k + 1)
      addLogEntry("LOT! Line of 4 — score doubled!", "success")
    }
  }

  const handleTimeout = useCallback(() => {
    toast.error("Time's up! Turn skipped.")
    // Auto-complete if cards placed, otherwise skip
    if (game.pendingPlacements.length > 0) {
      dispatch({ type: "COMPLETE_TURN" })
    } else {
      // Swap a random card as penalty
      const humanPlayer = game.players.find((p) => p.type === "human")
      if (humanPlayer && humanPlayer.hand.length > 0 && game.deck.length > 0) {
        dispatch({ type: "SWAP_CARDS", cardIds: [humanPlayer.hand[0].id] })
      } else {
        dispatch({ type: "COMPLETE_TURN" })
      }
    }
  }, [dispatch, game.pendingPlacements.length, game.players, game.deck.length])

  const pendingPoints =
    game.pendingPlacements.length > 0 ? calculateScore(game.pendingPlacements, game.board) : 0

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
      const score = calculateScore([...game.pendingPlacements, testPlacement], game.board)
      hints[`${pos.row},${pos.col}`] = score
    }

    return hints
  }, [game.hintsEnabled, selectedCard, isHumanTurn, game.board, game.pendingPlacements])

  // --- Helper computations ---
  const lotCompletingCards = React.useMemo(() => {
    if (!helpers.setCompletion || !isHumanTurn || game.gamePhase !== "playing")
      return new Set<string>()
    const humanPlayer = game.players.find((p) => p.type === "human")
    if (!humanPlayer) return new Set<string>()
    return findLotCompletingCards(humanPlayer.hand, game.board, game.pendingPlacements)
  }, [
    helpers.setCompletion,
    isHumanTurn,
    game.gamePhase,
    game.players,
    game.board,
    game.pendingPlacements,
  ])

  const bestMoveData = React.useMemo(() => {
    if (!helpers.bestMove || !isHumanTurn || game.gamePhase !== "playing") return null
    const humanPlayer = game.players.find((p) => p.type === "human")
    if (!humanPlayer) return null
    return findBestMove(humanPlayer.hand, game.board, game.pendingPlacements)
  }, [
    helpers.bestMove,
    isHumanTurn,
    game.gamePhase,
    game.players,
    game.board,
    game.pendingPlacements,
  ])

  const attributeHints = React.useMemo(() => {
    if (!helpers.attributeGuide || !selectedCard || !isHumanTurn) return null
    const allPlacements = [...game.board, ...game.pendingPlacements]
    const validPositions = getValidPlacements(game.board, game.pendingPlacements)
    const hints: Record<string, string> = {}
    for (const pos of validPositions) {
      const hint = getAttributeHint(pos, allPlacements)
      if (hint) hints[`${pos.row},${pos.col}`] = hint
    }
    return hints
  }, [helpers.attributeGuide, selectedCard, isHumanTurn, game.board, game.pendingPlacements])

  // --- Replaceable wild positions ---
  const replaceableWilds = React.useMemo(() => {
    if (!selectedCard || !isHumanTurn || selectedCard.isWild) return []
    return game.board
      .filter((p) => p.card.isWild && canReplaceWild(selectedCard, p.position, game.board))
      .map((p) => p.position)
  }, [selectedCard, isHumanTurn, game.board])

  // --- Opponent last-move highlights ---
  const lastOpponentPlacements = React.useMemo(() => {
    if (game.turnHistory.length === 0) return []
    // Find the most recent turn by an opponent (non-current-human player)
    const humanId = game.players.find((p) => p.type === "human")?.id
    for (let i = game.turnHistory.length - 1; i >= 0; i--) {
      const turn = game.turnHistory[i]
      if (turn.playerId !== humanId) {
        const playerIndex = game.players.findIndex((p) => p.id === turn.playerId)
        const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length]
        return turn.placements.map((pl) => ({ row: pl.position.row, col: pl.position.col, color }))
      }
    }
    return []
  }, [game.turnHistory, game.players])

  // --- Pattern Trainer ---
  // --- Daily Challenge ---
  if (showDaily) {
    return (
      <DailyChallenge
        onStart={(settings) => {
          setShowDaily(false)
          setLastSettings(settings)
          dispatch({ type: "START_GAME", settings })
        }}
        onBack={() => setShowDaily(false)}
      />
    )
  }

  if (showTrainer) {
    return <PatternTrainer onBack={() => setShowTrainer(false)} />
  }

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
            socket.disconnect()
            setShowMultiplayer(false)
          }}
        />
      )
    }
    // Otherwise show lobby
    return (
      <Lobby
        socket={socket}
        onBack={() => {
          socket.disconnect()
          setShowMultiplayer(false)
        }}
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
            toast.success("Achievement unlocked: \u{1F393} Student", { duration: 4000 })
          }
          dispatch({ type: "SHOW_MENU" })
        }}
        onBack={() => {
          setShowTutorial(false)
          dispatch({ type: "SHOW_MENU" })
        }}
      />
    )
  }

  // --- Menu screen ---
  if (game.gamePhase === "menu") {
    return (
      <ModeSelect
        onSelectMode={handleSelectMode}
        onTutorial={() => setShowTutorial(true)}
        onMultiplayer={() => {
          socket.connect()
          setShowMultiplayer(true)
        }}
        onDailyChallenge={() => setShowDaily(true)}
        onTrainer={() => setShowTrainer(true)}
        onStats={() => setShowStats(true)}
        isOnline={isOnline}
        canInstall={canInstall}
        onInstall={promptInstall}
      />
    )
  }

  // --- Setup screen ---
  if (game.gamePhase === "setup") {
    return (
      <GameSetup
        mode={game.gameMode}
        onStartGame={handleStartGame}
        onBack={() => dispatch({ type: "SHOW_MENU" })}
      />
    )
  }

  const humanPlayer = game.players.find((p) => p.type === "human")
  const humanHand = humanPlayer?.hand ?? []

  return (
    <div className={styles.layout} role="main">
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
      {/* Game log (replaces toasts) */}
      <GameLog entries={logEntries} />
      <KeyboardHints />
      <LotCelebration show={showCelebration} triggerKey={celebrationKey} />

      {/* Screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
        }}
      >
        {lastActionResult?.message}
      </div>

      <Sidebar
        cardsLeft={game.deck.length}
        lastTurnScore={game.lastTurnScore}
        pendingPoints={pendingPoints}
        pendingCount={game.pendingPlacements.length}
        turnInProgress={game.turnInProgress}
        onNewGame={() => dispatch({ type: "SHOW_MENU" })}
        onCompleteTurn={() => dispatch({ type: "COMPLETE_TURN" })}
        onUndoLast={() => dispatch({ type: "UNDO_PLACEMENT" })}
        helpers={helpers}
        onToggleHelper={toggleHelper}
        soundConfig={sound.config}
        onSoundToggle={sound.setEnabled}
        onSoundVolume={sound.setVolume}
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
          isActive={isHumanTurn && !isAIThinking && game.gamePhase === "playing"}
          resetKey={game.turnHistory.length}
        />
      )}

      {/* Practice mode hint badge */}
      {game.hintsEnabled && <div className={styles.hintBadge}>Practice Mode</div>}

      {/* Deck indicator */}
      <div className={styles.deckIndicator} aria-label={`${game.deck.length} cards remaining in deck`}>
        <span className={styles.deckCount}>{game.deck.length}</span>
        <span className={styles.deckLabel}>deck</span>
      </div>

      {/* Board area */}
      <div className={styles.boardArea}>
        <BoardComponent
          board={game.board}
          pendingPlacements={game.pendingPlacements}
          onPlaceCard={handlePlaceCard}
          selectedCard={
            isHumanTurn && game.pendingPlacements.length < MAX_LINE_LENGTH ? selectedCard : null
          }
          zoomLevel={zoomLevel}
          onZoomChange={(zoom) => dispatch({ type: "SET_ZOOM", zoom })}
          scoreHints={scoreHints}
          bestMove={bestMoveData}
          attributeHints={attributeHints}
          showCardValidMoves={helpers.showCardValidMoves}
          onInvalidClick={(reason) => toast.error(reason, { id: "invalid-click" })}
          lastOpponentPlacements={lastOpponentPlacements}
          replaceableWilds={replaceableWilds}
          onReplaceWild={(position) => {
            if (selectedCard) {
              dispatch({ type: "REPLACE_WILD", handCardId: selectedCard.id, position })
            }
          }}
        />
      </div>

      {/* Swap mode indicator */}
      {swapMode && isHumanTurn && (
        <div style={{
          position: 'fixed', bottom: 110, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, background: 'var(--color-warning)', color: 'white',
          padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700,
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          Select cards to swap ({swapSelected.size})
          <button
            style={{ background: 'white', color: 'var(--color-warning)', border: 'none', borderRadius: 4, padding: '2px 8px', fontWeight: 700, cursor: 'pointer', fontSize: 11 }}
            onClick={() => {
              if (swapSelected.size > 0) {
                dispatch({ type: 'SWAP_CARDS', cardIds: Array.from(swapSelected) })
                setSwapMode(false)
                setSwapSelected(new Set())
              }
            }}
            disabled={swapSelected.size === 0}
          >
            Swap
          </button>
          <button
            style={{ background: 'transparent', color: 'white', border: '1px solid white', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}
            onClick={() => { setSwapMode(false); setSwapSelected(new Set()) }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Player hand */}
      <PlayerHand
        cards={humanHand}
        selectedCard={swapMode ? null : selectedCard}
        onSelectCard={(card) => {
          if (swapMode) {
            setSwapSelected((prev) => {
              const next = new Set(prev)
              if (next.has(card.id)) next.delete(card.id)
              else next.add(card.id)
              return next
            })
          } else {
            handleSelectCard(card)
          }
        }}
        turnInProgress={game.turnInProgress && isHumanTurn}
        pendingCount={game.pendingPlacements.length}
        pendingPoints={pendingPoints}
        onCompleteTurn={() => dispatch({ type: "COMPLETE_TURN" })}
        onUndoLast={() => dispatch({ type: "UNDO_PLACEMENT" })}
        lotCompletingCards={lotCompletingCards}
        swapSelected={swapMode ? swapSelected : undefined}
        onSwapMode={!game.turnInProgress && isHumanTurn ? () => {
          setSwapMode(true)
          setSwapSelected(new Set())
          dispatch({ type: "DESELECT_CARD" })
        } : undefined}
      />

      {/* Game Over overlay */}
      {game.gamePhase === "ended" && !showReplay && (
        <GameOver
          players={game.players}
          turnHistory={game.turnHistory}
          initialBoard={initialBoardRef.current}
          onPlayAgain={handlePlayAgain}
          onNewSetup={() => dispatch({ type: "SHOW_MENU" })}
          onReplay={() => {
            trackReplayStarted()
            setShowReplay(true)
          }}
        />
      )}

      {/* Replay view */}
      {showReplay && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500 }}>
          <Replay
            initialBoard={initialBoardRef.current}
            turnHistory={game.turnHistory}
            players={game.players}
            onBack={() => setShowReplay(false)}
          />
        </div>
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
