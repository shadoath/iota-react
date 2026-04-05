# Milestone 1: Foundation

> Clean the house before inviting guests.

## Goals

- Remove dead code
- Add testing infrastructure and comprehensive game logic tests
- Centralize state management with Context + useReducer
- Add proper TypeScript strictness and linting
- Establish project conventions

## Tasks

### 1.1 Remove Legacy Code

Delete unused files that create confusion:

- `src/components/GameBoard.tsx` (replaced by `BoardComponent.tsx`)
- `src/components/Card.tsx` (replaced by `GameCard.tsx`)
- `src/components/Hand.tsx` (replaced by `PlayerHand.tsx`)
- `src/components/ControlPanel.tsx` (unused)
- `src/index.tsx` (unused — Next.js uses `app/` entry)
- `src/types/types.ts` (replaced by `src/types/game.ts`)

### 1.2 Add `typecheck` Script

```json
// package.json
"scripts": {
  "typecheck": "tsc --noEmit"
}
```

Run `npm run typecheck` and fix any issues.

### 1.3 Set Up Vitest

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
  resolve: {
    alias: { "@": "." },
  },
})
```

Add to `package.json`:

```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage"
}
```

### 1.4 Test Game Logic (High Priority)

Write unit tests for every function in the utils layer. These are pure functions — easy to test, critical to get right.

**`src/utils/__tests__/gameLogic.test.ts`**:

- `createDeck()` — returns 66 cards, correct distribution (4×4×4 + 2 wild)
- `shuffleDeck()` — returns same cards in different order
- `isValidLine()` — all-same, all-different, mixed invalid, wild card handling
- `getAdjacentPositions()` — returns 4 positions, correct coordinates
- `getValidPlacements()` — empty board edge case, single card board, constrained board
- `calculateScore()` — single card, line extension, multiple lines formed
- `isValidPlacement()` — valid placement, invalid (breaks line), non-adjacent

**`src/utils/__tests__/turnValidation.test.ts`**:

- `areAllPlacementsInSameLine()` — same row, same column, diagonal (invalid), single card
- `isPlacementInSameLineAsPending()` — aligns, doesn't align

**`src/utils/__tests__/impossibleSquares.test.ts`**:

- `isImpossibleSquare()` — open position, impossible due to line limit, impossible due to conflicting constraints

### 1.5 Centralize State with Context + Reducer

Create `src/context/GameContext.tsx`:

```typescript
// Action types
type GameAction =
  | { type: 'NEW_GAME' }
  | { type: 'SELECT_CARD'; cardId: string }
  | { type: 'PLACE_CARD'; position: GridPosition }
  | { type: 'UNDO_PLACEMENT' }
  | { type: 'COMPLETE_TURN' }
  | { type: 'SET_ZOOM'; zoom: number }

// Reducer — all state transitions in one place
function gameReducer(state: GameState, action: GameAction): GameState { ... }

// Context + Provider
const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<GameAction>
} | null>(null)

// Custom hook
export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within GameProvider')
  return context
}
```

Refactor `Game.tsx` to use the context instead of local `useState` calls. The component should shrink dramatically — all logic moves to the reducer.

### 1.6 Extract Constants

Create `src/constants/game.ts`:

```typescript
export const HAND_SIZE = 4
export const MAX_LINE_LENGTH = 4
export const GRID_PADDING = 2
export const INITIAL_ZOOM = 1.0
export const MIN_ZOOM = 0.25
export const MAX_ZOOM = 3.0
export const MOBILE_BREAKPOINT = 768
```

Replace magic numbers throughout the codebase.

### 1.7 Wild Card Implementation Audit

The current `createDeck()` adds 2 wild cards but the type system doesn't fully support them — `CardNumber`, `CardColor`, and `CardShape` have no wild variant. Audit and fix:

- Add `'wild'` to the Card type (or use a discriminated union)
- Ensure `isValidLine()` correctly treats wilds as matching anything
- Ensure scoring counts wild cards appropriately
- Add tests specifically for wild card scenarios

## Definition of Done

- [ ] Zero unused files in `src/`
- [ ] `npm run lint` passes clean
- [ ] `npm run typecheck` passes clean
- [ ] `npm run test:run` passes with 30+ game logic tests
- [ ] Game state managed via Context + useReducer
- [ ] No magic numbers in components
- [ ] Wild cards work correctly with full test coverage
