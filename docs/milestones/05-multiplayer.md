# Milestone 5: Multiplayer

> The game gets real when you play a human.

## Goals

- Real-time online play with 2-4 players
- Room-based matchmaking (share a link to play with friends)
- Spectator mode
- Reconnection handling

## Tasks

### 5.1 Choose Infrastructure

**Option A: Socket.io + Express server**

- Full control, self-hosted
- Deploy on Railway/Render/Fly.io alongside Next.js
- More work but more flexibility

**Option B: PartyKit**

- Edge-deployed WebSocket rooms
- Minimal server code — just define room behavior
- Built for exactly this kind of real-time game
- Free tier is generous

**Option C: Liveblocks**

- Managed real-time sync with conflict resolution
- Presence, storage, and rooms built in
- Higher-level API, less boilerplate
- Paid beyond free tier

**Recommendation**: Start with **PartyKit** for speed. Migrate to self-hosted Socket.io only if you need more control or hit limits.

### 5.2 Game State Sync Architecture

The game state is authoritative on the server. Clients send actions, server validates and broadcasts.

```
Client A                    Server                    Client B
   │                          │                          │
   │── PLACE_CARD ──────────▶│                          │
   │                          │── validate ──┐           │
   │                          │◀─────────────┘           │
   │◀── STATE_UPDATE ────────│── STATE_UPDATE ─────────▶│
   │                          │                          │
```

**Server responsibilities:**

- Hold authoritative game state
- Validate all moves (reuse `gameLogic.ts` — it's pure, runs anywhere)
- Broadcast state updates to all clients
- Handle turn timeouts
- Manage player disconnection/reconnection

**Client responsibilities:**

- Send actions (place card, complete turn, swap cards)
- Render state received from server
- Optimistic updates for own moves (revert on rejection)
- Show other players' actions with animation

### 5.3 Room System

**Creating a game:**

1. Host selects "Create Room" → gets a 6-character room code (e.g., `NDX4X7`)
2. Share code or link via room code
3. Lobby shows connected players
4. Host starts game when ready (2-4 players)

**Joining a game:**

1. Enter room code or click shared link
2. Choose display name
3. Wait in lobby until host starts

**Room state:**

```typescript
interface Room {
  code: string
  host: string
  players: RoomPlayer[]
  status: "lobby" | "playing" | "ended"
  settings: {
    turnTimer: number | null // seconds, or null for untimed
    maxPlayers: 2 | 3 | 4
  }
  gameState: GameState | null
}

interface RoomPlayer {
  id: string
  name: string
  connected: boolean
  lastSeen: number
}
```

### 5.4 Turn Management

- Current player has a configurable time limit (or unlimited)
- Timer visible to all players
- On timeout: turn auto-skipped (0 points) or auto-swap
- Between turns: brief pause (1s) so transitions feel natural
- Player can see opponent hand count (but not cards)

### 5.5 Reconnection

Players disconnect. Handle it gracefully:

- If disconnected < 30s: auto-reconnect, resume turn if it was theirs
- If disconnected 30s-5min: AI takes over temporarily, player can reclaim
- If disconnected > 5min: player forfeits, AI finishes the game for them
- Connection status shown next to player name (green dot / yellow dot / red dot)

### 5.6 Spectator Mode

- Join a room as spectator (no hand, can see board)
- See all placements in real-time
- Player count badge shows spectators separately
- Optional: spectators can see all hands (for coaching/learning)

### 5.7 Chat (Minimal)

- Quick emoji reactions (thumbs up, clap, thinking, wow)
- No free-text chat initially (avoids moderation headaches)
- Reactions appear briefly over the sender's name
- Optional: pre-built messages ("Nice move!", "Thinking...", "GG")

### 5.8 Anti-Cheat Basics

Since game logic runs on server:

- Clients can't manipulate scores or card positions
- Server validates every move
- Hand contents never sent to other clients
- Rate limiting on actions (prevent spam)
- No need for complex anti-cheat — the architecture handles it

## Definition of Done

- [ ] 2-4 players can play in real-time via shared room code
- [ ] All moves validated server-side
- [ ] Reconnection works within 5-minute window
- [ ] Spectators can watch live games
- [ ] Turn timer works across all clients
- [ ] Latency < 200ms for move propagation
- [ ] No state desync issues after 50+ turns
