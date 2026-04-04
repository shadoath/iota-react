import type React from 'react'
import type { Card } from '../types/game'
import { GameCard } from './GameCard'
import styles from './PlayerHand.module.css'

interface PlayerHandProps {
  cards: Card[]
  selectedCard: Card | null
  onSelectCard: (card: Card) => void
  turnInProgress: boolean
  pendingCount: number
  pendingPoints: number
  onCompleteTurn: () => void
  onUndoLast: () => void
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  selectedCard,
  onSelectCard,
  turnInProgress,
  pendingCount,
  pendingPoints,
  onCompleteTurn,
  onUndoLast,
}) => {
  return (
    <>
      {turnInProgress && (
        <div className={styles.turnActions}>
          <button
            className={styles.btnComplete}
            onClick={onCompleteTurn}
            disabled={pendingCount === 0}
          >
            Complete Turn {pendingPoints > 0 && `(+${pendingPoints})`}
          </button>
          <button
            className={styles.btnUndo}
            onClick={onUndoLast}
            disabled={pendingCount === 0}
          >
            Undo
          </button>
        </div>
      )}

      <div className={styles.hand}>
        {cards.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            selected={selectedCard?.id === card.id}
            onClick={() => onSelectCard(card)}
          />
        ))}
      </div>
    </>
  )
}
