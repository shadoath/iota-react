import React, { useEffect, useState, useRef } from 'react'
import styles from './TurnTimer.module.css'

interface TurnTimerProps {
  timeLimit: number // seconds
  onTimeout: () => void
  isActive: boolean // only count down when active (human turn)
  resetKey: number // changes to reset the timer (e.g. turn index)
}

/**
 * Inner component that resets via key prop (avoids setState in effect).
 */
function TurnTimerInner({
  timeLimit,
  onTimeout,
  isActive,
}: Omit<TurnTimerProps, 'resetKey'>) {
  const [remaining, setRemaining] = useState(timeLimit)
  const onTimeoutRef = useRef(onTimeout)

  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  const isExpired = remaining <= 0
  useEffect(() => {
    if (!isActive || isExpired) return

    const interval = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1
        if (next <= 0) {
          clearInterval(interval)
          setTimeout(() => onTimeoutRef.current(), 0)
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, isExpired])

  const fraction = remaining / timeLimit
  const colorClass = fraction > 0.5 ? styles.green : fraction > 0.2 ? styles.yellow : styles.red
  const isUrgent = remaining <= 5 && remaining > 0

  return (
    <div className={styles.timer}>
      <span className={`${styles.timeText} ${isUrgent ? styles.urgent : ''}`}>
        {remaining}s
      </span>
      <div className={styles.bar}>
        <div
          className={`${styles.barFill} ${colorClass}`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
    </div>
  )
}

/** Wrapper that remounts the timer via key to reset it. */
export const TurnTimer: React.FC<TurnTimerProps> = ({
  resetKey,
  ...props
}) => {
  return <TurnTimerInner key={resetKey} {...props} />
}
