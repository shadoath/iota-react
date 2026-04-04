import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { PlacedCard, GridPosition, Card } from '../types/game'
import { GameCard } from './GameCard'
import { getValidPlacements } from '../utils/gameLogic'
import { isImpossibleSquare } from '../utils/impossibleSquares'
import { computeHeatmap, heatmapToMap } from '../utils/heatmap'
import { MOBILE_BREAKPOINT, MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '../constants/game'
import styles from './Board.module.css'

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
}) => {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  // Compute heatmap (memoized, only when toggled on)
  const heatmapData = useMemo(() => {
    if (!showHeatmap) return null
    const allPlacements = [...board, ...pendingPlacements]
    return heatmapToMap(computeHeatmap(allPlacements))
  }, [showHeatmap, board, pendingPlacements])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Center board when it first renders or on new game
  const isNewGame = board.length === 1
  useEffect(() => {
    if (viewportRef.current) {
      const vw = viewportRef.current.clientWidth
      const vh = viewportRef.current.clientHeight
      setPan({ x: vw / 2 - 40, y: vh / 2 - 40 })
    }
  }, [isNewGame])

  const validPlacements = selectedCard
    ? getValidPlacements(board, pendingPlacements)
    : []

  const cellSize = isMobile ? 62 : 68
  const gap = isMobile ? 3 : 4
  const allPlacements = [...board, ...pendingPlacements]

  // Calculate bounds
  let minRow = 0, maxRow = 0, minCol = 0, maxCol = 0
  if (allPlacements.length > 0) {
    for (const { position } of allPlacements) {
      minRow = Math.min(minRow, position.row)
      maxRow = Math.max(maxRow, position.row)
      minCol = Math.min(minCol, position.col)
      maxCol = Math.max(maxCol, position.col)
    }
  }
  minRow -= 1; maxRow += 1; minCol -= 1; maxCol += 1
  const rows = maxRow - minRow + 1
  const cols = maxCol - minCol + 1

  const isValid = (row: number, col: number) =>
    validPlacements.some(pos => pos.row === row && pos.col === col)

  const getPlacedCard = (row: number, col: number) =>
    allPlacements.find(p => p.position.row === row && p.position.col === col)

  // --- Pan handlers ---
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only pan with primary button when no card selected, or with middle button
    if (e.button === 1 || (!selectedCard && e.button === 0)) {
      setIsPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      e.preventDefault()
    }
  }, [selectedCard, pan])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning) return
    const dx = e.clientX - panStart.current.x
    const dy = e.clientY - panStart.current.y
    setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy })
  }, [isPanning])

  const handlePointerUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // --- Wheel zoom ---
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    onZoomChange(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomLevel + delta)))
  }, [zoomLevel, onZoomChange])

  // --- Keyboard zoom ---
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '=' || e.key === '+') {
        onZoomChange(Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP))
      } else if (e.key === '-') {
        onZoomChange(Math.max(MIN_ZOOM, zoomLevel - ZOOM_STEP))
      } else if (e.key === 'ArrowUp') {
        setPan(p => ({ ...p, y: p.y + 40 }))
      } else if (e.key === 'ArrowDown') {
        setPan(p => ({ ...p, y: p.y - 40 }))
      } else if (e.key === 'ArrowLeft') {
        setPan(p => ({ ...p, x: p.x + 40 }))
      } else if (e.key === 'ArrowRight') {
        setPan(p => ({ ...p, x: p.x - 40 }))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [zoomLevel, onZoomChange])

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
          aria-label='Zoom in'
        >
          +
        </button>
        <span className={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</span>
        <button
          className={styles.zoomBtn}
          onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoomLevel - ZOOM_STEP))}
          aria-label='Zoom out'
        >
          -
        </button>
        <button
          className={`${styles.zoomBtn} ${showHeatmap ? styles.heatmapActive : ''}`}
          onClick={() => setShowHeatmap(prev => !prev)}
          aria-label={showHeatmap ? 'Hide heatmap' : 'Show heatmap'}
          title='Score heatmap'
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
            p => p.position.row === row && p.position.col === col
          )

          const cellClass = [
            styles.cell,
            valid && selectedCard && !impossible && styles.cellValid,
          ].filter(Boolean).join(' ')

          const isClickable = valid && selectedCard && !impossible
          const cellLabel = placedCard
            ? `Card: ${placedCard.card.isWild ? 'Wild' : `${placedCard.card.number} ${placedCard.card.color} ${placedCard.card.shape}`} at row ${row}, column ${col}`
            : isClickable
            ? `Place card at row ${row}, column ${col}${scoreHints?.[`${row},${col}`] ? ` for ${scoreHints[`${row},${col}`]} points` : ''}`
            : undefined

          return (
            <div
              key={`${row}-${col}`}
              className={cellClass}
              style={{ width: cellSize, height: cellSize }}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              aria-label={cellLabel}
              onClick={() => {
                if (isClickable) onPlaceCard({ row, col })
              }}
              onKeyDown={(e) => {
                if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onPlaceCard({ row, col })
                }
              }}
            >
              {placedCard && (
                <GameCard card={placedCard.card} disabled boardCard placed={isPending} />
              )}
              {!placedCard && valid && selectedCard && !impossible && (() => {
                const isBest = bestMove && bestMove.position.row === row && bestMove.position.col === col
                const attrHint = attributeHints?.[`${row},${col}`]
                return (
                  <div
                    className={`${styles.placeholder} ${isBest ? styles.bestMovePlaceholder : ''}`}
                    style={{ width: cellSize - 12, height: cellSize - 12 }}
                  >
                    {isBest && <span className={styles.bestMoveStar}>&#9733;</span>}
                    {scoreHints && scoreHints[`${row},${col}`] !== undefined && (
                      <span className={styles.scoreHint}>
                        +{scoreHints[`${row},${col}`]}
                      </span>
                    )}
                    {attrHint && (
                      <span className={styles.attrHint}>{attrHint}</span>
                    )}
                  </div>
                )
              })()}
              {!placedCard && impossible && (
                <div className={styles.impossible} />
              )}
              {!placedCard && !impossible && !isClickable && heatmapData && heatmapData[`${row},${col}`] && (
                <div
                  className={styles.heatmapCell}
                  style={{
                    opacity: Math.min(0.9, 0.2 + (heatmapData[`${row},${col}`].maxScore / 16) * 0.7),
                  }}
                  title={`Max: ${heatmapData[`${row},${col}`].maxScore} | Avg: ${heatmapData[`${row},${col}`].avgScore} | ${heatmapData[`${row},${col}`].validCardCount} valid cards`}
                >
                  <span className={styles.heatmapScore}>{heatmapData[`${row},${col}`].maxScore}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
