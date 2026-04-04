import React, { useState, useCallback } from 'react'
import { tutorialSteps } from './tutorialSteps'
import { GameCard } from '../GameCard'
import styles from './Tutorial.module.css'

interface TutorialProps {
  onComplete: () => void
  onBack: () => void
}

export const Tutorial: React.FC<TutorialProps> = ({ onComplete, onBack }) => {
  const [stepIndex, setStepIndex] = useState(0)
  const [stepCompleted, setStepCompleted] = useState(false)
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)

  const step = tutorialSteps[stepIndex]
  const isLastStep = stepIndex === tutorialSteps.length - 1
  const hasPlacementTask = step.targetPosition !== null
  const canAdvance = !hasPlacementTask || stepCompleted

  const handleNext = useCallback(() => {
    if (isLastStep) {
      localStorage.setItem('nodusnexus-tutorial-completed', 'true')
      onComplete()
      return
    }
    setStepIndex(prev => prev + 1)
    setStepCompleted(false)
    setSelectedCardIndex(null)
  }, [isLastStep, onComplete])

  const handlePrev = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1)
      setStepCompleted(false)
      setSelectedCardIndex(null)
    }
  }, [stepIndex])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (!hasPlacementTask || stepCompleted) return
    if (selectedCardIndex === null && step.targetCardIndex !== null) {
      // Auto-select the target card
      setSelectedCardIndex(step.targetCardIndex)
      return
    }
    if (step.targetPosition && row === step.targetPosition.row && col === step.targetPosition.col) {
      setStepCompleted(true)
    }
  }, [hasPlacementTask, stepCompleted, selectedCardIndex, step])

  const handleCardClick = useCallback((index: number) => {
    if (stepCompleted) return
    if (step.targetCardIndex !== null && index !== step.targetCardIndex) return
    setSelectedCardIndex(prev => prev === index ? null : index)
  }, [stepCompleted, step.targetCardIndex])

  // Calculate board grid bounds
  const allPositions = [
    ...step.board.map(p => p.position),
    ...(step.targetPosition ? [step.targetPosition] : []),
  ]
  const minRow = Math.min(...allPositions.map(p => p.row)) - 1
  const maxRow = Math.max(...allPositions.map(p => p.row)) + 1
  const minCol = Math.min(...allPositions.map(p => p.col)) - 1
  const maxCol = Math.max(...allPositions.map(p => p.col)) + 1
  const rows = maxRow - minRow + 1
  const cols = maxCol - minCol + 1

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          Back
        </button>
        <span className={styles.progress}>
          {stepIndex + 1} / {tutorialSteps.length}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.instruction}>
          <h2 className={styles.stepTitle}>{step.title}</h2>
          <p className={styles.stepDesc}>{step.description}</p>
        </div>

        <div className={styles.boardPreview}>
          <div
            className={styles.miniBoard}
            style={{
              gridTemplateColumns: `repeat(${cols}, 64px)`,
              gridTemplateRows: `repeat(${rows}, 80px)`,
            }}
          >
            {Array.from({ length: rows * cols }, (_, idx) => {
              const row = Math.floor(idx / cols) + minRow
              const col = (idx % cols) + minCol
              const boardCard = step.board.find(
                p => p.position.row === row && p.position.col === col
              )
              const isTarget =
                step.targetPosition?.row === row &&
                step.targetPosition?.col === col &&
                !stepCompleted
              const isPlaced =
                stepCompleted &&
                step.targetPosition?.row === row &&
                step.targetPosition?.col === col

              return (
                <div
                  key={`${row}-${col}`}
                  className={`${styles.miniCell} ${isTarget && selectedCardIndex !== null ? styles.miniCellTarget : ''}`}
                  onClick={() => handleCellClick(row, col)}
                >
                  {boardCard && <GameCard card={boardCard.card} disabled boardCard />}
                  {isPlaced && step.hand[step.targetCardIndex ?? 0] && (
                    <GameCard card={step.hand[step.targetCardIndex ?? 0]} disabled boardCard placed />
                  )}
                </div>
              )
            })}
          </div>

          {step.hand.length > 0 && !stepCompleted && (
            <div className={styles.handPreview}>
              {step.hand.map((card, index) => (
                <GameCard
                  key={card.id}
                  card={card}
                  selected={selectedCardIndex === index}
                  onClick={() => handleCardClick(index)}
                />
              ))}
            </div>
          )}

          {stepCompleted && (
            <span className={styles.completedMsg}>Correct!</span>
          )}
        </div>

        <div className={styles.nav}>
          {stepIndex > 0 && (
            <button
              className={`${styles.navBtn} ${styles.navBtnSecondary}`}
              onClick={handlePrev}
            >
              Previous
            </button>
          )}
          <button
            className={`${styles.navBtn} ${styles.navBtnPrimary}`}
            onClick={handleNext}
            disabled={!canAdvance}
            style={{ opacity: canAdvance ? 1 : 0.5 }}
          >
            {isLastStep ? 'Start Playing' : hasPlacementTask && !stepCompleted ? 'Place the card' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
