"use client"

import React, { useState, useCallback, useMemo, useEffect } from "react"
import type { Card, CardNumber, CardColor, CardShape } from "../types/game"
import { CARD_NUMBERS, CARD_COLORS, CARD_SHAPES } from "../constants/game"
import { GameCard } from "./GameCard"
import styles from "./PatternTrainer.module.css"

interface PatternTrainerProps {
  onBack: () => void
}

interface Puzzle {
  lineCards: Card[]
  correctAnswer: Card
  wrongAnswers: Card[]
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generatePuzzle(): Puzzle {
  // Randomly decide if each attribute is "all same" or "all different"
  const lineLength = Math.random() < 0.5 ? 2 : 3 // show 2 or 3 cards, find the next
  const numberMode = Math.random() < 0.5 ? "same" : "different"
  const colorMode = Math.random() < 0.5 ? "same" : "different"
  const shapeMode = Math.random() < 0.5 ? "same" : "different"

  // Generate the line
  const numbers: CardNumber[] =
    numberMode === "same"
      ? Array(lineLength + 1).fill(randomItem(CARD_NUMBERS))
      : shuffleArray([...CARD_NUMBERS]).slice(0, lineLength + 1)

  const colors: CardColor[] =
    colorMode === "same"
      ? Array(lineLength + 1).fill(randomItem(CARD_COLORS))
      : shuffleArray([...CARD_COLORS]).slice(0, lineLength + 1)

  const shapes: CardShape[] =
    shapeMode === "same"
      ? Array(lineLength + 1).fill(randomItem(CARD_SHAPES))
      : shuffleArray([...CARD_SHAPES]).slice(0, lineLength + 1)

  const allCards: Card[] = []
  for (let i = 0; i <= lineLength; i++) {
    allCards.push({
      id: `puzzle-${i}`,
      number: numbers[i],
      color: colors[i],
      shape: shapes[i],
    })
  }

  const lineCards = allCards.slice(0, lineLength)
  const correctAnswer = allCards[lineLength]

  // Generate 3 wrong answers
  const wrongAnswers: Card[] = []
  let attempts = 0
  while (wrongAnswers.length < 3 && attempts < 100) {
    attempts++
    const wrong: Card = {
      id: `wrong-${wrongAnswers.length}`,
      number: randomItem(CARD_NUMBERS),
      color: randomItem(CARD_COLORS),
      shape: randomItem(CARD_SHAPES),
    }
    // Make sure it's actually wrong (breaks at least one attribute pattern)
    if (
      wrong.number === correctAnswer.number &&
      wrong.color === correctAnswer.color &&
      wrong.shape === correctAnswer.shape
    )
      continue

    // Check it would actually be invalid in the line
    const testLine = [...lineCards.map((c, i) => ({ ...c })), wrong]
    if (isValidLine(testLine, numberMode, colorMode, shapeMode)) continue

    // Not a duplicate wrong answer
    if (
      wrongAnswers.some(
        (w) => w.number === wrong.number && w.color === wrong.color && w.shape === wrong.shape
      )
    )
      continue

    wrongAnswers.push(wrong)
  }

  // If we couldn't generate enough wrong answers, fill with random cards
  while (wrongAnswers.length < 3) {
    wrongAnswers.push({
      id: `wrong-${wrongAnswers.length}`,
      number: randomItem(CARD_NUMBERS),
      color: randomItem(CARD_COLORS),
      shape: randomItem(CARD_SHAPES),
    })
  }

  return { lineCards, correctAnswer, wrongAnswers }
}

function isValidLine(cards: Card[], numMode: string, colMode: string, shpMode: string): boolean {
  const nums = new Set(cards.map((c) => c.number))
  const cols = new Set(cards.map((c) => c.color))
  const shps = new Set(cards.map((c) => c.shape))

  const numOk = numMode === "same" ? nums.size === 1 : nums.size === cards.length
  const colOk = colMode === "same" ? cols.size === 1 : cols.size === cards.length
  const shpOk = shpMode === "same" ? shps.size === 1 : shps.size === cards.length

  return numOk && colOk && shpOk
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const PatternTrainer: React.FC<PatternTrainerProps> = ({ onBack }) => {
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generatePuzzle())
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [startTime, setStartTime] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 100) / 10)
    }, 100)
    return () => clearInterval(interval)
  }, [startTime])

  // Shuffle choices
  const choices = useMemo(() => {
    return shuffleArray([puzzle.correctAnswer, ...puzzle.wrongAnswers])
  }, [puzzle])

  const isAnswered = selected !== null
  const isCorrect = selected !== null && choices[selected].id === puzzle.correctAnswer.id

  const handleSelect = useCallback(
    (index: number) => {
      if (isAnswered) return
      setSelected(index)
      const correct = choices[index].id === puzzle.correctAnswer.id
      setScore((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1,
      }))
    },
    [isAnswered, choices, puzzle.correctAnswer.id]
  )

  const handleNext = useCallback(() => {
    setPuzzle(generatePuzzle())
    setSelected(null)
    setStartTime(Date.now())
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onBack}>
            &larr;
          </button>
          <h1 className={styles.title}>Pattern Trainer</h1>
        </div>

        <div className={styles.stats}>
          <span>
            Score:{" "}
            <span className={styles.statBold}>
              {score.correct}/{score.total}
            </span>
          </span>
          <span>
            {score.total > 0 && (
              <>
                Accuracy:{" "}
                <span className={styles.statBold}>
                  {Math.round((score.correct / score.total) * 100)}%
                </span>
              </>
            )}
          </span>
        </div>

        <div className={styles.divider} />

        <p className={styles.prompt}>Which card completes this line?</p>

        <div className={styles.lineDisplay}>
          {puzzle.lineCards.map((card, i) => (
            <GameCard key={card.id} card={card} disabled />
          ))}
          <div className={styles.questionMark}>?</div>
        </div>

        <span className={styles.timer}>{elapsed.toFixed(1)}s</span>

        <div className={styles.choices}>
          {choices.map((card, index) => {
            const isThis = selected === index
            const isTheCorrect = card.id === puzzle.correctAnswer.id

            let stateClass = ""
            if (isAnswered) {
              if (isTheCorrect) stateClass = styles.correct
              else if (isThis) stateClass = styles.incorrect
            }

            return (
              <button
                key={index}
                className={`${styles.choiceBtn} ${stateClass} ${isAnswered ? styles.disabled : ""}`}
                onClick={() => handleSelect(index)}
              >
                <GameCard card={card} disabled />
              </button>
            )
          })}
        </div>

        {isAnswered && (
          <>
            <div
              className={`${styles.feedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect}`}
            >
              {isCorrect ? "Correct!" : "Wrong — the highlighted card completes the line"}
            </div>
            <button className={styles.nextBtn} onClick={handleNext}>
              Next Puzzle
            </button>
          </>
        )}
      </div>
    </div>
  )
}
