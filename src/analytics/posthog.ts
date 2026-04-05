/**
 * PostHog analytics wrapper.
 * PostHog is initialized via instrumentation-client.ts (Next.js 15.3+).
 * Env var NEXT_PUBLIC_POSTHOG_KEY must be set for tracking to activate.
 */

import posthog from 'posthog-js'

// --- Event tracking ---

export function trackEvent(event: string, properties?: Record<string, unknown>): void {
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

export function trackPwaInstallPrompted(): void {
  trackEvent('pwa_install_prompted')
}

export function trackReplayStarted(): void {
  trackEvent('replay_started')
}

// --- User identification ---

export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  posthog.identify(userId, properties)
}

export function resetUser(): void {
  posthog.reset()
}
