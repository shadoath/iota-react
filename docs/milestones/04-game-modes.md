# Milestone 4: Game Modes

> Different ways to play keep people coming back.

## Goals

- Interactive tutorial that teaches the rules
- Timed mode for competitive pressure
- Daily challenge with shared leaderboard
- Practice mode with hints

## Tasks

### 4.1 Tutorial Mode

An interactive, step-by-step tutorial — not a wall of text.

**Tutorial flow (5-7 screens/steps):**

1. **"This is a card"** — Show a card, explain: 3 attributes (color, shape, number)
2. **"Place a card"** — One card on board, one in hand. Guide player to place it adjacent. Explain adjacency rule.
3. **"Lines must match"** — Show a line of 2 cards. Explain: each attribute must be all-same or all-different. Let player place a valid third card.
4. **"Scoring"** — Place a card, show how score is calculated (sum of numbers in line). Show how extending a line works.
5. **"Multiple cards per turn"** — Demonstrate placing 2-3 cards in same line in one turn.
6. **"Wild cards"** — Explain how wilds match anything. Place one in a line.
7. **"You're ready!"** — Quick 5-turn practice round, then launch into a real game.

Implementation:
- `src/components/Tutorial/Tutorial.tsx` — step-by-step overlay
- Pre-built board states for each step (no randomness)
- Forced valid placements (only correct position is clickable)
- Progress saved to localStorage so it doesn't repeat

### 4.2 Timed Mode

Race the clock:

- **Speed round**: 15 seconds per turn. Timer visible. Auto-skip on timeout (0 points).
- **Marathon**: 5-minute total game. Play as many turns as possible. Score is cumulative.
- **Blitz**: 30 seconds per turn, but bonus points for finishing early (remaining seconds × 2 added to turn score).

Timer component:
- Circular progress indicator
- Color changes: green → yellow → red as time runs down
- Pulse animation in last 5 seconds
- Optional ticking sound in last 3 seconds

### 4.3 Daily Challenge

Same puzzle for everyone, every day:

- Seeded random deck (seed = YYYY-MM-DD)
- Solo play against Hard AI
- Score submitted to daily leaderboard
- Compare with friends / global

Implementation:
- `src/utils/seededRandom.ts` — deterministic RNG from date seed
- Same deck order, same AI seed = same game for everyone
- Results stored locally + optionally synced (Phase 6)
- Calendar view of past challenges with your scores
- Streak tracking (consecutive days played)

### 4.4 Practice Mode with Hints

A learning-friendly mode:

- **Show valid positions**: All valid placements always highlighted (not just for selected card)
- **Score preview**: Hovering a valid position shows projected score
- **Best move hint**: Button that highlights the highest-scoring single move
- **Undo unlimited**: Can undo any number of turns, not just current
- **No opponent**: Just you and the board, exploring

Hints as a toggle — can be turned on/off mid-game. Useful for learning, disabled for real play.

### 4.5 Puzzle Mode (Stretch)

Pre-designed puzzles:

- Fixed board state, fixed hand
- Goal: "Score exactly 12" or "Place all 4 cards" or "Create a line of 4"
- 50-100 puzzles, increasing difficulty
- Star rating (1-3 stars based on solution elegance)

This is a significant content creation effort. Start with 10-20 hand-crafted puzzles, add more over time. Could be community-contributed later.

### 4.6 Mode Selection Screen

Update the game entry flow:

```
┌─────────────────────────┐
│       IOTA               │
│                          │
│   ▶ Quick Game           │
│   ▶ vs AI                │
│   ▶ Timed Mode           │
│   ▶ Daily Challenge      │
│   ▶ Practice             │
│   ▶ Tutorial             │
│                          │
│   ⚙ Settings             │
└──────────────────────────┘
```

Clean, minimal. Each option briefly described on hover/tap.

## Definition of Done

- [ ] Tutorial teaches all rules interactively in < 3 minutes
- [ ] Timed mode has at least 2 timer variants
- [ ] Daily challenge produces same game for same date
- [ ] Practice mode shows hints and score previews
- [ ] Mode selection screen is the new landing page
- [ ] All modes save progress/results to localStorage
