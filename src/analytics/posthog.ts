/**
 * PostHog analytics wrapper.
 * Env var NEXT_PUBLIC_POSTHOG_KEY must be set for tracking to activate.
 * No tracking occurs without the key (safe for dev).
 */

import posthog from 'posthog-js'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? ''
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

let initialized = false

export function initAnalytics(): void {
  if (typeof window === 'undefined') return
  if (initialized) return
  if (!POSTHOG_KEY) {
    console.debug('[analytics] No POSTHOG_KEY — tracking disabled')
    return
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false, // we track custom events
    persistence: 'localStorage+cookie',
    loaded: (ph) => {
      // Opt out of session replay by default (privacy)
      if (process.env.NODE_ENV === 'development') {
        ph.opt_out_capturing()
      }
    },
  })

  initialized = true
}

// --- Event tracking ---

export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  if (!initialized || !POSTHOG_KEY) return
  posthog.capture(event, properties)
}

export function trackGameStart(mode: string, playerCount: number, aiDifficulties: string[]): void {
  trackEvent('game_start', { mode, playerCount, aiDifficulties })
}

export function trackGameEnd(
  mode: string,
  winner: string,
  humanScore: number,
  totalTurns: number,
  duration: number,
  won: boolean
): void {
  trackEvent('game_end', { mode, winner, humanScore, totalTurns, duration, won })
}

export function trackTurnComplete(score: number, cardsPlaced: number, isLot: boolean): void {
  trackEvent('turn_complete', { score, cardsPlaced, isLot })
}

export function trackCardPlaced(cardNumber: number, cardColor: string, cardShape: string): void {
  trackEvent('card_placed', { cardNumber, cardColor, cardShape })
}

export function trackModeSelected(mode: string): void {
  trackEvent('mode_selected', { mode })
}

export function trackTutorialStep(step: number, total: number): void {
  trackEvent('tutorial_step', { step, total })
}

export function trackTutorialComplete(): void {
  trackEvent('tutorial_complete')
}

export function trackAchievementUnlocked(achievementId: string): void {
  trackEvent('achievement_unlocked', { achievementId })
}

export function trackDailyChallenge(score: number, streak: number): void {
  trackEvent('daily_challenge', { score, streak })
}

export function trackMultiplayerRoom(action: 'create' | 'join' | 'leave'): void {
  trackEvent('multiplayer_room', { action })
}

export function trackHelperToggled(helper: string, enabled: boolean): void {
  trackEvent('helper_toggled', { helper, enabled })
}

export function trackThemeChanged(theme: string): void {
  trackEvent('theme_changed', { theme })
}

export function trackPatternTrainer(correct: boolean, responseTimeMs: number): void {
  trackEvent('pattern_trainer', { correct, responseTimeMs })
}

export function trackError(error: string, context?: Record<string, unknown>): void {
  trackEvent('client_error', { error, ...context })
}

// --- User identification ---

export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (!initialized || !POSTHOG_KEY) return
  posthog.identify(userId, properties)
}

export function resetUser(): void {
  if (!initialized || !POSTHOG_KEY) return
  posthog.reset()
}
