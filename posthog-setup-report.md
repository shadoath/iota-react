<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into NodusNexus. The existing custom `AnalyticsProvider` / `initAnalytics` approach was replaced with the recommended Next.js 15.3+ pattern using `instrumentation-client.ts` for client-side initialization. A reverse proxy was added via `next.config.mjs` rewrites to route PostHog traffic through `/ingest`, improving ad-blocker resilience and reducing latency. Built-in `capture_exceptions: true` now handles uncaught exceptions natively. Two new events were added to supplement the existing 13: `pwa_install_prompted` (top of PWA install funnel) and `replay_started` (post-game engagement).

| Event | Description | File |
|---|---|---|
| `game_start` | Player starts a new game — mode, player count, AI difficulties | `src/components/Game.tsx` |
| `game_end` | Game concludes — mode, winner, human score, turns, duration, won | `src/components/Game.tsx` |
| `turn_complete` | Player completes a turn — score, cards placed, lot scored | `src/context/GameContext.tsx` |
| `card_placed` | Player places a card — number, color, shape | `src/context/GameContext.tsx` |
| `mode_selected` | Player selects a game mode from the main menu | `src/components/Game.tsx` |
| `tutorial_step` | Player advances through a tutorial step | `src/components/Tutorial/Tutorial.tsx` |
| `tutorial_complete` | Player completes the tutorial | `src/components/Tutorial/Tutorial.tsx` |
| `achievement_unlocked` | Player unlocks an achievement after a game | `src/components/Game.tsx` |
| `daily_challenge` | Player completes a daily challenge — score and streak | `src/components/Game.tsx` |
| `multiplayer_room` | Player creates, joins, or leaves a multiplayer room | `src/components/Lobby.tsx` |
| `helper_toggled` | Player enables/disables a gameplay helper | `src/components/Sidebar.tsx` |
| `theme_changed` | Player changes the UI theme | `src/hooks/useTheme.ts` |
| `pattern_trainer` | Player answers a pattern trainer question | `src/components/PatternTrainer.tsx` |
| `pwa_install_prompted` | Player taps Install App — top of PWA install funnel | `src/hooks/useInstallPrompt.ts` |
| `replay_started` | Player clicks Watch Replay on game over screen | `src/components/Game.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics:** https://us.posthog.com/project/370116/dashboard/1433094
- **Daily Active Players:** https://us.posthog.com/project/370116/insights/iPMR5YUT
- **Game Completion Funnel:** https://us.posthog.com/project/370116/insights/UbjG4XE0
- **Game Mode Popularity:** https://us.posthog.com/project/370116/insights/YzNbSTZw
- **Tutorial Completion Funnel:** https://us.posthog.com/project/370116/insights/aH270ETL
- **Achievement Unlocks per Day:** https://us.posthog.com/project/370116/insights/OGVbrTgu

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
