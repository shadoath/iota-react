import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import type { PlacedCard, GridPosition, Card } from "../types/game"
import { GameCard } from "./GameCard"
import { getValidPlacements, isValidPlacement } from "../utils/gameLogic"
import { isImpossibleSquare } from "../utils/impossibleSquares"
import { isPlacementInSameLineAsPending } from "../utils/turnValidation"
import { computeHeatmap, heatmapToMap } from "../utils/heatmap"
import { MOBILE_BREAKPOINT, MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from "../constants/game"
import styles from "./Board.module.css"

interface BoardComponentProps {
  board: PlacedCard[]
  pendingPlacements: PlacedCard[]
  onPlaceCard: (position: GridPosition) => void
  selectedCard: Card | null
  zoomLevel: number
  onZoomChange: (zoom: number) => void
  scoreHints?: Record<string, number> | null
  bestMove?: { cardId: string; position: GridPosition; score: number } | null
  attributeHints?: Record<string, string> | null
  showCardValidMoves?: boolean
  onInvalidClick?: (reason: string) => void
  lastOpponentPlacements?: { row: number; col: number; color: string }[]
}

export const BoardComponent: React.FC<BoardComponentProps> = ({
  board,
  pendingPlacements,
  onPlaceCard,
  selectedCard,
  zoomLevel,
  onZoomChange,
  scoreHints,
  bestMove,
  attributeHints,
  showCardValidMoves,
  onInvalidClick,
  lastOpponentPlacements,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [showHeatmap, setShowHeatmap] = useState(false)

  // Touch/pointer tracking
  const gestureRef = useRef({
    isPanning: false,
    startX: 0,
    startY: 0,
    panX: 0,
    panY: 0,
    totalMovement: 0, // track total distance to distinguish tap vs drag
    // Pinch zoom tracking
    isPinching: false,
    initialPinchDist: 0,
    initialZoom: 1,
    activePointers: new Map<number, { x: number; y: number }>(),
  })

  const heatmapData = useMemo(() => {
    if (!showHeatmap) return null
    const allPlacements = [...board, ...pendingPlacements]
    return heatmapToMap(computeHeatmap(allPlacements))
  }, [showHeatmap, board, pendingPlacements])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const isNewGame = board.length === 1
  useEffect(() => {
    if (viewportRef.current) {
      const vw = viewportRef.current.clientWidth
      const vh = viewportRef.current.clientHeight
      setPan({ x: vw / 2 - 40, y: vh / 2 - 40 })
    }
  }, [isNewGame])

  const validPlacements = useMemo(() => {
    if (!selectedCard) return []
    const positions = getValidPlacements(board, pendingPlacements)
    if (!showCardValidMoves) return positions
    const allPlacements = [...board, ...pendingPlacements]
    return positions.filter((pos) => isValidPlacement(selectedCard, pos, allPlacements))
  }, [selectedCard, board, pendingPlacements, showCardValidMoves])

  const cellSize = isMobile ? 62 : 68
  const gap = isMobile ? 3 : 4
  const allPlacements = [...board, ...pendingPlacements]

  let minRow = 0,
    maxRow = 0,
    minCol = 0,
    maxCol = 0
  if (allPlacements.length > 0) {
    for (const { position } of allPlacements) {
      minRow = Math.min(minRow, position.row)
      maxRow = Math.max(maxRow, position.row)
      minCol = Math.min(minCol, position.col)
      maxCol = Math.max(maxCol, position.col)
    }
  }
  minRow -= 1
  maxRow += 1
  minCol -= 1
  maxCol += 1
  const rows = maxRow - minRow + 1
  const cols = maxCol - minCol + 1

  const isValid = (row: number, col: number) =>
    validPlacements.some((pos) => pos.row === row && pos.col === col)

  const getPlacedCard = (row: number, col: number) =>
    allPlacements.find((p) => p.position.row === row && p.position.col === col)

  // --- Pinch distance ---
  function getPinchDist(pointers: Map<number, { x: number; y: number }>): number {
    const pts = Array.from(pointers.values())
    if (pts.length < 2) return 0
    const dx = pts[0].x - pts[1].x
    const dy = pts[0].y - pts[1].y
    return Math.sqrt(dx * dx + dy * dy)
  }

  // --- Pointer handlers (unified touch + mouse) ---
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const g = gestureRef.current
      g.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (g.activePointers.size === 2) {
        // Start pinch
        g.isPinching = true
        g.isPanning = false
        g.initialPinchDist = getPinchDist(g.activePointers)
        g.initialZoom = zoomLevel
        e.preventDefault()
        return
      }

      // Single pointer: pan if no card selected or middle button
      if (e.button === 1 || (!selectedCard && e.button === 0)) {
        g.isPanning = true
        g.startX = e.clientX
        g.startY = e.clientY
        g.panX = pan.x
        g.panY = pan.y
        g.totalMovement = 0
        ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
        e.preventDefault()
      } else if (selectedCard && e.button === 0) {
        // With card selected, track movement to distinguish tap vs drag
        g.isPanning = true
        g.startX = e.clientX
        g.startY = e.clientY
        g.panX = pan.x
        g.panY = pan.y
        g.totalMovement = 0
      }
    },
    [selectedCard, pan, zoomLevel]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const g = gestureRef.current
      g.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      // Pinch zoom
      if (g.isPinching && g.activePointers.size >= 2) {
        const dist = getPinchDist(g.activePointers)
        if (g.initialPinchDist > 0) {
          const scale = dist / g.initialPinchDist
          const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, g.initialZoom * scale))
          onZoomChange(newZoom)
        }
        return
      }

      if (!g.isPanning) return
      const dx = e.clientX - g.startX
      const dy = e.clientY - g.startY
      g.totalMovement += Math.abs(dx - (pan.x - g.panX)) + Math.abs(dy - (pan.y - g.panY))

      // Only pan if we've moved enough (prevents accidental drags on tap)
      if (Math.abs(e.clientX - g.startX) > 5 || Math.abs(e.clientY - g.startY) > 5) {
        setPan({ x: g.panX + dx, y: g.panY + dy })
      }
    },
    [pan, onZoomChange]
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const g = gestureRef.current
    g.activePointers.delete(e.pointerId)

    if (g.activePointers.size < 2) {
      g.isPinching = false
    }
    g.isPanning = false
  }, [])

  // --- Wheel zoom ---
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
      onZoomChange(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomLevel + delta)))
    },
    [zoomLevel, onZoomChange]
  )

  // --- Keyboard zoom/pan ---
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "=" || e.key === "+") {
        onZoomChange(Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP))
      } else if (e.key === "-") {
        onZoomChange(Math.max(MIN_ZOOM, zoomLevel - ZOOM_STEP))
      } else if (e.key === "ArrowUp") {
        setPan((p) => ({ ...p, y: p.y + 40 }))
      } else if (e.key === "ArrowDown") {
        setPan((p) => ({ ...p, y: p.y - 40 }))
      } else if (e.key === "ArrowLeft") {
        setPan((p) => ({ ...p, x: p.x + 40 }))
      } else if (e.key === "ArrowRight") {
        setPan((p) => ({ ...p, x: p.x - 40 }))
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [zoomLevel, onZoomChange])

  // --- Cell click handler (respects drag threshold) ---
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const g = gestureRef.current
      // Only place card if we didn't drag significantly
      if (g.totalMovement < 15) {
        onPlaceCard({ row, col })
      }
    },
    [onPlaceCard]
  )

  return (
    <div
      ref={viewportRef}
      className={styles.viewport}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Zoom controls */}
      <div className={styles.zoomControls}>
        <button
          className={styles.zoomBtn}
          onClick={() => onZoomChange(Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP))}
          aria-label="Zoom in"
        >
          +
        </button>
        <span className={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</span>
        <button
          className={styles.zoomBtn}
          onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoomLevel - ZOOM_STEP))}
          aria-label="Zoom out"
        >
          -
        </button>
        <button
          className={`${styles.zoomBtn} ${showHeatmap ? styles.heatmapActive : ""}`}
          onClick={() => setShowHeatmap((prev) => !prev)}
          aria-label={showHeatmap ? "Hide heatmap" : "Show heatmap"}
          title="Score heatmap"
        >
          H
        </button>
      </div>

      {/* Board grid */}
      <div
        className={styles.board}
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          gap: `${gap}px`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
        }}
      >
        {Array.from({ length: rows * cols }, (_, index) => {
          const row = Math.floor(index / cols) + minRow
          const col = (index % cols) + minCol
          const placedCard = getPlacedCard(row, col)
          const valid = isValid(row, col)
          const impossible = !placedCard && isImpossibleSquare({ row, col }, allPlacements)
          const isPending = pendingPlacements.some(
            (p) => p.position.row === row && p.position.col === col
          )

          const opponentHighlight = lastOpponentPlacements?.find(
            (p) => p.row === row && p.col === col
          )

          const cellClass = [styles.cell, valid && selectedCard && !impossible && styles.cellValid]
            .filter(Boolean)
            .join(" ")

          const isClickable = valid && selectedCard && !impossible
          const cellLabel = placedCard
            ? `Card: ${placedCard.card.isWild ? "Wild" : `${placedCard.card.number} ${placedCard.card.color} ${placedCard.card.shape}`} at row ${row}, column ${col}`
            : isClickable
              ? `Place card at row ${row}, column ${col}${scoreHints?.[`${row},${col}`] ? ` for ${scoreHints[`${row},${col}`]} points` : ""}`
              : undefined

          return (
            <div
              key={`${row}-${col}`}
              className={cellClass}
              style={{ width: cellSize, height: cellSize }}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              aria-label={cellLabel}
              onClick={() => {
                if (isClickable) {
                  handleCellClick(row, col)
                } else if (selectedCard && !placedCard) {
                  let reason = "Can't place here."
                  if (impossible) {
                    reason = "Permanently blocked — no card can ever legally be placed here."
                  } else if (
                    pendingPlacements.length > 0 &&
                    !isPlacementInSameLineAsPending({ row, col }, pendingPlacements)
                  ) {
                    reason = "Must stay in the same row or column as your other cards this turn."
                  } else if (!isValidPlacement(selectedCard, { row, col }, allPlacements)) {
                    reason = "Your card's attributes conflict with the line here."
                  }
                  onInvalidClick?.(reason)
                }
              }}
              onKeyDown={(e) => {
                if (isClickable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault()
                  onPlaceCard({ row, col })
                }
              }}
            >
              {placedCard && (
                <>
                  <GameCard card={placedCard.card} disabled boardCard placed={isPending} />
                  {opponentHighlight && (
                    <div
                      className={styles.opponentHighlight}
                      style={{ borderColor: opponentHighlight.color }}
                    />
                  )}
                </>
              )}
              {!placedCard &&
                valid &&
                selectedCard &&
                !impossible &&
                (() => {
                  const isBest =
                    bestMove && bestMove.position.row === row && bestMove.position.col === col
                  const attrHint = attributeHints?.[`${row},${col}`]
                  return (
                    <div
                      className={`${styles.placeholder} ${isBest ? styles.bestMovePlaceholder : ""}`}
                      style={{ width: cellSize - 12, height: cellSize - 12 }}
                    >
                      {isBest && <span className={styles.bestMoveStar}>&#9733;</span>}
                      {scoreHints && scoreHints[`${row},${col}`] !== undefined && (
                        <span className={styles.scoreHint}>+{scoreHints[`${row},${col}`]}</span>
                      )}
                      {attrHint && <span className={styles.attrHint}>{attrHint}</span>}
                    </div>
                  )
                })()}
              {!placedCard && impossible && <div className={styles.impossible} />}
              {!placedCard &&
                !impossible &&
                !isClickable &&
                heatmapData &&
                heatmapData[`${row},${col}`] && (
                  <div
                    className={styles.heatmapCell}
                    style={{
                      opacity: Math.min(
                        0.9,
                        0.2 + (heatmapData[`${row},${col}`].maxScore / 16) * 0.7
                      ),
                    }}
                    title={`Max: ${heatmapData[`${row},${col}`].maxScore} | Avg: ${heatmapData[`${row},${col}`].avgScore} | ${heatmapData[`${row},${col}`].validCardCount} valid cards`}
                  >
                    <span className={styles.heatmapScore}>
                      {heatmapData[`${row},${col}`].maxScore}
                    </span>
                  </div>
                )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
