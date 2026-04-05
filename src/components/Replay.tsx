"use client"

import React, { useState, useMemo, useCallback } from "react"
import type { PlacedCard, TurnRecord, Player } from "../types/game"
import { BoardComponent } from "./BoardComponent"
import { analyzeGame, analysisSummary, type TurnAnalysis } from "../ai/analysis"
import styles from "./Replay.module.css"

interface ReplayProps {
  initialBoard: PlacedCard[] // the starter card
  turnHistory: TurnRecord[]
  players: Player[]
  onBack: () => void
}

export const Replay: React.FC<ReplayProps> = ({ initialBoard, turnHistory, players, onBack }) => {
  const [currentTurn, setCurrentTurn] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [isPlaying, setIsPlaying] = useState(false)

  const totalTurns = turnHistory.length

  // Run AI analysis on human turns
  const analyses = useMemo(() => {
    const initialHands = players.map((p) => [...p.hand])
    return analyzeGame(initialBoard, turnHistory, players, initialHands)
  }, [initialBoard, turnHistory, players])

  const summary = useMemo(() => analysisSummary(analyses), [analyses])

  // Get analysis for current turn
  const currentAnalysis =
    currentTurn > 0 ? analyses.find((a) => a.turnIndex === currentTurn - 1) : null

  // Build board state at each turn
  const boardAtTurn = useMemo(() => {
    const boards: PlacedCard[][] = [initialBoard]
    let cumulative = [...initialBoard]

    for (const turn of turnHistory) {
      cumulative = [...cumulative, ...turn.placements]
      boards.push(cumulative)
    }

    return boards
  }, [initialBoard, turnHistory])

  // Current state
  const board = boardAtTurn[currentTurn] ?? initialBoard
  const currentTurnRecord = currentTurn > 0 ? turnHistory[currentTurn - 1] : null
  const currentPlayerName = currentTurnRecord
    ? (players.find((p) => p.id === currentTurnRecord.playerId)?.name ?? "Unknown")
    : "Start"

  // Cards placed in the current turn (for highlighting)
  const highlightedPositions = useMemo(() => {
    if (!currentTurnRecord) return new Set<string>()
    return new Set(currentTurnRecord.placements.map((p) => `${p.position.row},${p.position.col}`))
  }, [currentTurnRecord])

  // Cumulative scores at each turn
  const scoresAtTurn = useMemo(() => {
    const scores: Record<string, number>[] = [{}]
    const cumulative: Record<string, number> = {}
    for (const p of players) cumulative[p.id] = 0

    for (const turn of turnHistory) {
      cumulative[turn.playerId] = (cumulative[turn.playerId] || 0) + turn.score
      scores.push({ ...cumulative })
    }
    return scores
  }, [turnHistory, players])

  const currentScores = scoresAtTurn[currentTurn] ?? {}

  // Auto-play
  React.useEffect(() => {
    if (!isPlaying || currentTurn >= totalTurns) {
      setIsPlaying(false)
      return
    }

    const timer = setTimeout(() => {
      setCurrentTurn((prev) => prev + 1)
    }, 1500)

    return () => clearTimeout(timer)
  }, [isPlaying, currentTurn, totalTurns])

  const handlePrev = useCallback(() => {
    setIsPlaying(false)
    setCurrentTurn((prev) => Math.max(0, prev - 1))
  }, [])

  const handleNext = useCallback(() => {
    setIsPlaying(false)
    setCurrentTurn((prev) => Math.min(totalTurns, prev + 1))
  }, [totalTurns])

  const handlePlayPause = useCallback(() => {
    if (currentTurn >= totalTurns) {
      setCurrentTurn(0)
      setIsPlaying(true)
    } else {
      setIsPlaying((prev) => !prev)
    }
  }, [currentTurn, totalTurns])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          &larr; Back
        </button>
        <h1 className={styles.title}>Game Replay</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {players.map((p) => (
            <span key={p.id} style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              {p.name}: <strong>{currentScores[p.id] ?? 0}</strong>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.boardArea}>
        <BoardComponent
          board={board}
          pendingPlacements={[]}
          onPlaceCard={() => {}}
          selectedCard={null}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
        />

        {/* Turn list sidebar */}
        <div className={styles.turnList}>
          <button
            className={`${styles.turnItem} ${currentTurn === 0 ? styles.turnItemActive : ""}`}
            onClick={() => {
              setCurrentTurn(0)
              setIsPlaying(false)
            }}
          >
            <span className={styles.turnItemName}>Start</span>
          </button>
          {turnHistory.map((turn, index) => {
            const player = players.find((p) => p.id === turn.playerId)
            return (
              <button
                key={index}
                className={`${styles.turnItem} ${currentTurn === index + 1 ? styles.turnItemActive : ""}`}
                onClick={() => {
                  setCurrentTurn(index + 1)
                  setIsPlaying(false)
                }}
              >
                <span className={styles.turnItemCards}>{turn.placements.length}c</span>
                <span className={styles.turnItemName}>{player?.name ?? "?"}</span>
                <span className={styles.turnItemScore}>
                  {turn.score > 0 ? `+${turn.score}` : "0"}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Timeline controls */}
      <div className={styles.controls}>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={totalTurns}
          value={currentTurn}
          onChange={(e) => {
            setIsPlaying(false)
            setCurrentTurn(Number(e.target.value))
          }}
        />
        <div className={styles.controlRow}>
          <button
            className={styles.controlBtn}
            onClick={() => {
              setCurrentTurn(0)
              setIsPlaying(false)
            }}
            disabled={currentTurn === 0}
            aria-label="Go to start"
          >
            ⏮
          </button>
          <button
            className={styles.controlBtn}
            onClick={handlePrev}
            disabled={currentTurn === 0}
            aria-label="Previous turn"
          >
            ◀
          </button>
          <button
            className={styles.controlBtn}
            onClick={handlePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            style={{ width: 48 }}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            className={styles.controlBtn}
            onClick={handleNext}
            disabled={currentTurn >= totalTurns}
            aria-label="Next turn"
          >
            ▶
          </button>
          <button
            className={styles.controlBtn}
            onClick={() => {
              setCurrentTurn(totalTurns)
              setIsPlaying(false)
            }}
            disabled={currentTurn >= totalTurns}
            aria-label="Go to end"
          >
            ⏭
          </button>

          <div className={styles.turnInfo}>
            <div className={styles.turnLabel}>
              Turn {currentTurn}/{totalTurns}
            </div>
            <div className={styles.turnDetail}>
              {currentPlayerName}
              {currentTurnRecord && currentTurnRecord.score > 0
                ? ` — +${currentTurnRecord.score} points (${currentTurnRecord.placements.length} card${currentTurnRecord.placements.length > 1 ? "s" : ""})`
                : currentTurnRecord
                  ? " — swap"
                  : ""}
              {currentAnalysis && currentAnalysis.scoreDiff > 0 && (
                <span className={styles.analysisHint}>
                  {" "}
                  (best: +{currentAnalysis.bestPossibleScore}, missed {currentAnalysis.scoreDiff})
                </span>
              )}
              {currentAnalysis && currentAnalysis.rating === "optimal" && (
                <span className={styles.analysisOptimal}> (optimal)</span>
              )}
            </div>
          </div>

          {summary && (
            <div className={styles.analysisSummary}>
              Accuracy: {summary.accuracy}% | Missed: {summary.totalMissed} pts
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
