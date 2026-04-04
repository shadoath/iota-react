# CLAUDE.md

## Project Overview

NodusNexus — a strategic card game of matching patterns. Built with Next.js, React, and TypeScript. Deployed at [nodusnexus.com](https://nodusnexus.com).

## Key Technologies

- Next.js 14 (App Router)
- React 18 with TypeScript (strict mode)
- CSS Modules + CSS custom properties (no CSS-in-JS)
- Socket.io for multiplayer
- Vitest for testing

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Development server (localhost:3000)
npm run dev:mp       # Dev server with multiplayer (Socket.io)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript checking (tsc --noEmit)
npm run test         # Vitest watch mode
npm run test:run     # Run tests once
```

## Project Structure

- `app/` — Next.js App Router (layout, page, API routes)
- `src/components/` — React components with co-located CSS Modules
- `src/context/` — GameContext (useReducer + Context for all game state)
- `src/ai/` — AI opponent engine (easy/medium/hard)
- `src/utils/` — Pure game logic (deck, placement, scoring, validation)
- `src/multiplayer/` — Socket.io protocol, server, client hook
- `src/stats/` — Stats tracking and achievements (localStorage)
- `src/styles/` — Design tokens (CSS custom properties, dark mode)
- `src/types/` — TypeScript type definitions
- `src/constants/` — Game constants
- `src/hooks/` — Custom hooks (useTheme)
- `public/` — Static assets, PWA manifest
- `server.ts` — Custom server for multiplayer (Socket.io + Next.js)
- `docs/` — Product roadmap and milestone plans

## Architecture

- **Game logic is pure** — all rules live in `src/utils/`, zero UI coupling, fully unit tested
- **State is centralized** — single `GameContext` with `useReducer`, all transitions in one place
- **Components are presentational** — receive props, dispatch actions
- **Styling** — CSS Modules with design tokens from `src/styles/tokens.css`, supports dark mode
- **Multiplayer** — server-authoritative via Socket.io, clients send actions, server validates and broadcasts

## Important Notes

- The main branch is `master`
- Run `npm run lint && npm run typecheck` before committing
- 120+ tests across 8 test files — run `npm run test:run` to verify
- No MUI or CSS-in-JS dependencies — all styling is CSS Modules
- Dark mode uses `data-theme` attribute + `prefers-color-scheme` media query
- localStorage keys are prefixed with `nodusnexus-`
