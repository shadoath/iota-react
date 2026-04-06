"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export interface SoundConfig {
  enabled: boolean
  volume: number // 0-1
}

const STORAGE_KEY = "nodusnexus-sound"

function getStored(): SoundConfig {
  if (typeof window === "undefined") return { enabled: false, volume: 0.5 }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { enabled: false, volume: 0.5 }
  } catch {
    return { enabled: false, volume: 0.5 }
  }
}

export function useSound() {
  const [config, setConfig] = useState<SoundConfig>(getStored)
  const ctxRef = useRef<AudioContext | null>(null)

  // Lazy-init AudioContext (must be after user interaction)
  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const setEnabled = useCallback((enabled: boolean) => {
    setConfig((prev) => {
      const next = { ...prev, enabled }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const setVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume))
    setConfig((prev) => {
      const next = { ...prev, volume: clamped }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  // --- Sound generators (Web Audio API, no files needed) ---

  const playTone = useCallback(
    (
      frequency: number,
      duration: number,
      type: OscillatorType = "sine",
      volumeMultiplier: number = 1
    ) => {
      if (!config.enabled) return
      try {
        const ctx = getCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = type
        osc.frequency.setValueAtTime(frequency, ctx.currentTime)

        const vol = config.volume * volumeMultiplier * 0.3 // keep it subtle
        gain.gain.setValueAtTime(vol, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + duration)
      } catch {
        // Audio not available
      }
    },
    [config.enabled, config.volume, getCtx]
  )

  // --- Named sounds ---

  const playCardPlace = useCallback(() => {
    playTone(440, 0.1, "sine", 0.8)
  }, [playTone])

  const playCardSelect = useCallback(() => {
    playTone(330, 0.06, "sine", 0.5)
  }, [playTone])

  const playTurnComplete = useCallback(() => {
    // Rising two-note chime
    playTone(523, 0.15, "sine", 0.8)
    setTimeout(() => playTone(659, 0.2, "sine", 0.8), 100)
  }, [playTone])

  const playLotBonus = useCallback(() => {
    // Triumphant three-note arpeggio
    playTone(523, 0.15, "sine", 1.0)
    setTimeout(() => playTone(659, 0.15, "sine", 1.0), 100)
    setTimeout(() => playTone(784, 0.25, "sine", 1.0), 200)
  }, [playTone])

  const playInvalidMove = useCallback(() => {
    playTone(200, 0.15, "square", 0.4)
  }, [playTone])

  const playGameOver = useCallback(() => {
    // Descending fanfare
    playTone(784, 0.2, "sine", 0.9)
    setTimeout(() => playTone(659, 0.2, "sine", 0.9), 150)
    setTimeout(() => playTone(523, 0.2, "sine", 0.9), 300)
    setTimeout(() => playTone(523, 0.4, "triangle", 0.7), 500)
  }, [playTone])

  const playUndo = useCallback(() => {
    playTone(350, 0.08, "sine", 0.5)
  }, [playTone])

  const playAchievement = useCallback(() => {
    // Sparkly ascending
    playTone(523, 0.1, "sine", 0.8)
    setTimeout(() => playTone(659, 0.1, "sine", 0.8), 80)
    setTimeout(() => playTone(784, 0.1, "sine", 0.8), 160)
    setTimeout(() => playTone(1047, 0.3, "sine", 0.9), 240)
  }, [playTone])

  return {
    config,
    setEnabled,
    setVolume,
    playCardPlace,
    playCardSelect,
    playTurnComplete,
    playLotBonus,
    playInvalidMove,
    playGameOver,
    playUndo,
    playAchievement,
  }
}
