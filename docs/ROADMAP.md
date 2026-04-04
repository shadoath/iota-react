# NodusNexus - Product Roadmap

## Vision

A polished, commercial-grade digital card game — playable solo against AI, or online with friends. Fast, beautiful, and accessible on any device.

**Live at [nodusnexus.com](https://nodusnexus.com)**

## Current State (v1.0.0)

All 8 foundation milestones have been completed:

- Clean TypeScript codebase with 120+ tests
- Context + useReducer state management
- CSS Modules with design tokens (no runtime CSS-in-JS)
- AI opponents at 3 difficulty levels
- 4 game modes (Classic, Practice, Timed, Multiplayer)
- Interactive tutorial and pattern trainer
- Game replay with turn-by-turn scrubbing
- Board heatmap overlay
- Stats tracking with 16 achievements
- Dark mode with system preference detection
- PWA manifest for installability
- Keyboard accessible with screen reader support
- Global error boundary

## Architecture

1. **Game logic is pure** — all rules, validation, and scoring live in testable utility functions with zero UI coupling
2. **State is centralized** — React Context + useReducer for predictable game state
3. **Components are presentational** — they receive props and dispatch actions
4. **Multiplayer is server-authoritative** — Socket.io validates all moves, clients render state

## Completed Milestones

| # | Milestone | Status |
|---|-----------|--------|
| 1 | [Foundation](milestones/01-foundation.md) — Cleanup, testing, state management | Done |
| 2 | [Core UI](milestones/02-core-ui.md) — Card design, board UX, CSS Modules | Done |
| 3 | [Solo Play](milestones/03-solo-play.md) — AI opponents, difficulty levels | Done |
| 4 | [Game Modes](milestones/04-game-modes.md) — Tutorial, timed, practice modes | Done |
| 5 | [Multiplayer](milestones/05-multiplayer.md) — Online play, lobbies, matchmaking | Done |
| 6 | [Social](milestones/06-social.md) — Stats, achievements, dashboard | Done |
| 7 | [Commercial](milestones/07-commercial.md) — PWA, dark mode, a11y, error boundary | Done |
| 8 | [Digital Features](milestones/08-wild-cards.md) — Replay, heatmap, pattern trainer | Done |

## What's Next

Potential future work (not yet planned):

- **Authentication** — Anonymous-first with optional social login
- **Database** — Migrate localStorage stats to Supabase/Postgres
- **Daily Challenge** — Seeded deck, same game for everyone, leaderboard
- **Elo Rating** — Competitive ranking for multiplayer
- **Tournaments** — Automated brackets and leagues
- **Cosmetics** — Card themes, board skins, card backs
- **Move Analysis** — AI-powered "you could have scored X here"
- **Collaborative Mode** — 2v2 team play

## Tech Stack

- **Next.js 14** — App Router
- **TypeScript** — Strict mode
- **CSS Modules** — Design tokens, dark mode, zero runtime cost
- **Socket.io** — Real-time multiplayer
- **Vitest** — 120+ tests
- **Vercel** — Deployment
