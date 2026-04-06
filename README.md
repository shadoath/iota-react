# NodusNexus

A strategic card game of matching patterns. Play solo against AI, practice your skills, or challenge friends online.

**[Play now at nodusnexus.com](https://nodusnexus.com)**

## How It Works

66 cards. Each has three attributes:

| Attribute  | Values                          |
| ---------- | ------------------------------- |
| **Number** | 1, 2, 3, 4                      |
| **Color**  | Red, Green, Blue, Yellow        |
| **Shape**  | Triangle, Square, Circle, Cross |

Plus 2 wild cards that match anything.

Place cards on the board to form lines. In every line, each attribute must be either **all the same** or **all different**. Score points equal to the sum of card numbers in your lines.

### Quick Examples

- `Red Triangle 1` + `Red Triangle 2` + `Red Triangle 3` — same color, same shape, different numbers
- `Blue Circle 2` + `Red Square 2` + `Yellow Triangle 2` — same number, all different colors and shapes

## Game Modes

| Mode                | Description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| **Classic**         | Play against 1-3 AI opponents (Easy / Medium / Hard difficulty)           |
| **Practice**        | Hints enabled — see score previews on every valid position                |
| **Timed**           | Turn timer (15s / 30s / 60s) — auto-skips if you run out                  |
| **Multiplayer**     | Online play with friends via 6-character room codes                       |
| **Tutorial**        | Interactive 7-step walkthrough teaching all the rules                     |
| **Pattern Trainer** | Quick-fire drills — given a partial line, pick the card that completes it |

## Features

- **AI Engine** — Easy (random), Medium (best of 1-2 cards), Hard (exhaustive search of all combos)
- **Game Replay** — Scrub through any completed game turn by turn
- **Board Heatmap** — Toggle overlay showing score potential at every position
- **Stats & Achievements** — 16 achievements, win rate tracking, game history
- **Dark Mode** — Follows system preference or toggle manually
- **PWA** — Installable on any device
- **Accessible** — Keyboard navigation, screen reader support, focus indicators

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

For multiplayer (requires WebSocket server):

```bash
npm run dev:mp
```

## Development

```bash
npm run dev          # Next.js dev server
npm run dev:mp       # Dev server with Socket.io multiplayer
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript type checking
npm run test         # Vitest in watch mode
npm run test:run     # Run tests once
```

### Code Style Notes

- Prefer `for...of` loops over `forEach` for iteration.

## Project Structure

```
src/
├── ai/                    # AI opponent engine
│   └── engine.ts          # Easy/Medium/Hard move computation
├── components/            # React components
│   ├── Game.tsx           # Main game orchestrator
│   ├── BoardComponent.tsx # Pan/zoom game board
│   ├── GameCard.tsx       # Card rendering (shapes by count)
│   ├── PlayerHand.tsx     # Player hand + turn actions
│   ├── GameSetup.tsx      # Opponent selection screen
│   ├── ModeSelect.tsx     # Mode selection landing page
│   ├── Sidebar.tsx        # Menu drawer with theme toggle
│   ├── ScoreBoard.tsx     # Multi-player score display
│   ├── GameOver.tsx       # End game results screen
│   ├── Replay.tsx         # Turn-by-turn game replay
│   ├── PatternTrainer.tsx # Pattern recognition drills
│   ├── TurnTimer.tsx      # Countdown timer for timed mode
│   ├── StatsPage.tsx      # Stats & achievements dashboard
│   ├── Lobby.tsx          # Multiplayer room creation/joining
│   ├── MultiplayerGame.tsx# Online game view
│   ├── ErrorBoundary.tsx  # Global error recovery
│   └── Tutorial/          # Interactive tutorial steps
├── context/
│   └── GameContext.tsx     # Central state (useReducer + Context)
├── constants/
│   └── game.ts            # Game constants (hand size, zoom, etc.)
├── hooks/
│   └── useTheme.ts        # Dark mode toggle
├── multiplayer/
│   ├── protocol.ts        # Shared client/server event types
│   ├── RoomManager.ts     # Server-side room + game state
│   ├── server.ts          # Socket.io server setup
│   └── useSocket.ts       # Client-side socket hook
├── stats/
│   ├── achievements.ts    # 16 achievement definitions + logic
│   ├── statsService.ts    # Game result recording + aggregation
│   └── types.ts           # Stats/achievement types
├── styles/
│   └── tokens.css         # Design tokens (colors, spacing, dark mode)
├── types/
│   └── game.ts            # Core game types (Card, Player, GameState)
└── utils/
    ├── gameLogic.ts       # Deck, placement, scoring, validation
    ├── turnValidation.ts  # Turn-level rules
    ├── impossibleSquares.ts # Unplayable position detection
    ├── validationMessages.ts # Human-readable error messages
    └── heatmap.ts         # Board score potential analysis
```

## Tech Stack

- **Next.js 14** — React framework
- **TypeScript** — Strict mode
- **CSS Modules** — Scoped styles with CSS custom properties
- **Socket.io** — Real-time multiplayer
- **Vitest** — 120+ tests
- **Vercel** — Deployment

## License

MIT
