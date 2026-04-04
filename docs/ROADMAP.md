# NodusNexus - Product Roadmap

## Vision

A polished, commercial-grade digital version of NodusNexus — playable solo against AI, or online with friends. Fast, beautiful, and accessible on any device.

## Current State

- Single-player mode with functional game logic (deck, placement validation, scoring)
- Basic React UI with MUI components and inline styles
- No tests, no state management library, no multiplayer
- Legacy unused components scattered in codebase
- No AI opponent — just open solitaire

## Architecture Principles

1. **Game logic is pure** — all rules, validation, and scoring live in testable utility functions with zero UI coupling
2. **State is centralized** — React Context + useReducer for predictable game state
3. **Components are dumb** — they receive props and dispatch actions, nothing more
4. **Multiplayer-ready from early** — state shape designed so network sync is additive, not a rewrite
5. **Mobile-first** — touch interactions are primary, mouse is the enhancement

## Phase Overview

| Phase | Name | Goal |
|-------|------|------|
| 1 | Foundation | Clean codebase, tests, proper state management |
| 2 | Core Game Polish | Beautiful cards, smooth interactions, responsive layout |
| 3 | Solo Play | AI opponents with difficulty levels |
| 4 | Game Modes | Timed mode, challenge mode, tutorial |
| 5 | Multiplayer | Real-time online play with friends |
| 6 | Social & Engagement | Profiles, stats, leaderboards, achievements |
| 7 | Commercial Polish | PWA, onboarding, analytics, monetization hooks |

## Milestone Documents

Each phase is broken into a detailed milestone document in `docs/milestones/`:

- [01-foundation.md](milestones/01-foundation.md) — Cleanup, testing, state management
- [02-core-ui.md](milestones/02-core-ui.md) — Card design, board UX, animations
- [03-solo-play.md](milestones/03-solo-play.md) — AI opponents, difficulty levels
- [04-game-modes.md](milestones/04-game-modes.md) — Tutorial, timed, challenge modes
- [05-multiplayer.md](milestones/05-multiplayer.md) — Online play, lobbies, matchmaking
- [06-social.md](milestones/06-social.md) — Profiles, stats, leaderboards
- [07-commercial.md](milestones/07-commercial.md) — PWA, polish, monetization
- [08-wild-cards.md](milestones/08-wild-cards.md) — Digital-only features that make this special

## Key Technical Decisions

### State Management: Context + useReducer
Redux is overkill for this. A single `GameContext` with a reducer handles all game state. Actions are serializable (important for multiplayer replay later).

### Styling: CSS Modules + CSS Custom Properties
Move away from MUI `sx` prop soup. CSS Modules give scoped styles with zero runtime cost. Custom properties enable theming. MUI stays only for utility components (drawer, tooltips).

### Testing: Vitest + React Testing Library
Vitest is fast, works natively with TypeScript, and shares Vite's transform pipeline. Game logic gets unit tests. Components get integration tests.

### Multiplayer: WebSocket via Socket.io (or Liveblocks/PartyKit)
The game state is small — the entire board fits in a few KB. Real-time sync is simple. Start with Socket.io for control, evaluate managed services later.

### Deployment: Vercel
Next.js on Vercel is zero-config. Edge functions for API routes. Preview deployments for every PR.

## Success Metrics

- **Phase 1-2**: App builds clean, 80%+ test coverage on game logic, Lighthouse 90+
- **Phase 3**: Average session length > 10 minutes (engaging AI)
- **Phase 5**: < 200ms latency for multiplayer moves
- **Phase 7**: PWA installable, < 3s first load, accessible (WCAG 2.1 AA)
