# Milestone 3: Solo Play — AI Opponents

> A game is only as good as its opponent.

## Goals

- Implement AI opponents with 3 difficulty levels
- Turn-based play against 1-3 AI players
- AI "thinking" animation so it feels like playing a person
- Post-game summary

## Tasks

### 3.1 Multi-Player State

Extend `GameState` to support multiple players:

```typescript
interface Player {
  id: string
  name: string
  type: 'human' | 'ai'
  difficulty?: 'easy' | 'medium' | 'hard'
  hand: Card[]
  score: number
}

interface GameState {
  deck: Card[]
  board: PlacedCard[]
  players: Player[]
  currentPlayerIndex: number
  pendingPlacements: PendingPlacement[]
  turnHistory: TurnRecord[]
  gamePhase: 'setup' | 'playing' | 'ended'
}

interface TurnRecord {
  playerId: string
  placements: PlacedCard[]
  score: number
}
```

### 3.2 Game Setup Screen

Before the game starts, a setup screen where you choose:

- Number of players (1-4)
- For each AI slot: difficulty level
- AI player names (fun default names: "Dot", "Dash", "Pixel", etc.)

Simple form, not over-designed. Gets you into the game fast.

### 3.3 AI Engine

Create `src/ai/engine.ts` — a pure function:

```typescript
function computeAIMove(
  hand: Card[],
  board: PlacedCard[],
  difficulty: 'easy' | 'medium' | 'hard'
): PendingPlacement[]
```

**Easy AI:**
- Finds all valid single-card placements
- Picks one randomly
- Never plays multiple cards per turn

**Medium AI:**
- Finds all valid single and double-card placements
- Scores each option
- Picks the highest-scoring move
- Occasionally (20%) picks a random move instead (feels human)

**Hard AI:**
- Exhaustive search of all possible placements (1-4 cards)
- Evaluates each by score
- Tiebreaker: prefer moves that don't open high-value positions for opponents
- Considers board state (avoids creating easy 4-card line completions for next player)

**Implementation approach:**
1. Generate all valid single-card placements
2. For each, generate valid second-card placements (same line)
3. Continue to 3 and 4 cards
4. Score each complete move
5. Apply difficulty filter

The search space is bounded: max 4 cards from hand, valid positions are adjacent to existing cards. Even brute force is fast enough for hard AI.

### 3.4 AI Turn Execution

When it's an AI player's turn:

1. Show "Thinking..." indicator (500ms-2000ms delay based on difficulty)
2. Animate cards being placed one at a time (300ms per card)
3. Show score popup
4. Auto-advance to next player

The delay makes AI feel natural, not instant. Hard AI "thinks" longer.

### 3.5 Turn Order & Flow

- Players take turns clockwise (by array index)
- Current player highlighted in scoreboard
- When a player can't play (no valid moves), they can swap cards:
  - Return 1-4 cards to deck, draw same number
  - Costs the turn (scores 0)
- Game ends when deck is empty AND any player can't play
- Final round: each player gets one more turn after deck empties

### 3.6 Card Swap Mechanic

Implement the "can't play" scenario:

- Detect when no valid placements exist for any card in hand
- Offer "Swap Cards" button
- Player selects which cards to return (1 to all)
- Cards shuffled back into deck, new cards drawn
- Turn ends with 0 points

### 3.7 End Game Screen

When the game ends:

- Final scoreboard with all players ranked
- Turn-by-turn score chart (simple bar chart — no charting library, just CSS)
- Best single turn for each player
- "Play Again" and "New Game" buttons
- Win/loss record saved to localStorage

## Definition of Done

- [ ] Can play against 1-3 AI opponents
- [ ] Three difficulty levels produce noticeably different play styles
- [ ] AI moves are animated and feel natural
- [ ] Card swap works when no moves available
- [ ] Game end detection works correctly
- [ ] End game screen shows meaningful stats
- [ ] AI turn completes in < 500ms computation time (even hard)
