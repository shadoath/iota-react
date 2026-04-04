# Milestone 8: Digital-Only Features (Wild Cards)

> Things a physical card game can never do.

These features have no analog in the tabletop game. They're the reason to go digital.

## Ideas

### 8.1 Move Replay & Analysis

After any game, replay it turn by turn:

- Scrub through turns with a timeline slider
- See what each player played and where
- "What if" mode: go back to any turn and try a different move
- AI analysis: "You could have scored 12 here instead of 6" (run hard AI on your hand at each turn)
- Share replays via link

This is the "chess.com analysis board" equivalent for Iota.

### 8.2 Board Heatmap

Visual overlay on the board showing:

- **Score potential**: Brighter squares = higher potential score if a card is placed there
- **Danger zones**: Positions that would give opponents high-scoring opportunities
- **Line density**: How many lines pass through each position

Toggle on/off. Incredible for learning strategy.

### 8.3 Elo Rating System

Competitive ranking for multiplayer:

- Start at 1200 Elo
- Win against higher-rated player = big gain, lower = small gain
- Separate ratings for timed vs untimed
- Seasonal resets (soft reset toward 1200)
- Rank tiers with names: Novice → Apprentice → Strategist → Master → Grandmaster

### 8.4 Tournaments

Automated tournament brackets:

- **Daily tournament**: Sign up, play 3 games over the day, top scorers advance
- **Weekend tournament**: 8 or 16 player bracket, one game per round
- **League**: Weekly round-robin, promoted/relegated between divisions

Start with daily tournaments (async-friendly). Brackets are stretch.

### 8.5 Card Collection / Variants

Instead of always playing with the standard 66 cards:

- **Mini Iota**: 3 colors × 3 shapes × 3 numbers = 27 cards + 1 wild. Faster games.
- **Mega Iota**: 5th color (purple) and 5th shape (star) = 100 cards + 2 wild. Epic games.
- **Draft mode**: Players alternate drafting cards from a shared pool before the game starts.
- **Asymmetric start**: Players start with different hand sizes based on turn order.

These variants keep the core rules but change the feel.

### 8.6 Spectator Commentary / Casting

For competitive play:

- Commentator role that can highlight moves, draw arrows on board
- Delayed broadcast (30-second delay to prevent cheating)
- Chat for spectators

### 8.7 Collaborative Mode

2 players on the same team vs 2 AI (or 2 other humans):

- Shared score
- Can see each other's hands
- Take alternating turns
- Strategic coordination: "I'll set up the line, you complete it"

### 8.8 Card Pattern Recognition Training

A standalone training mode:

- Flash a line of 3 cards → "What card completes this line?"
- Timed: how fast can you identify the valid 4th card?
- Tracks improvement over time
- Categories: color matching, shape matching, number matching, all-different

Builds the pattern recognition muscle that makes you better at the full game.

### 8.9 Smart Notifications

For engaged players:

- "Your daily challenge is ready" (morning push notification)
- "Your friend [name] just beat your high score"
- "You're on a 6-day streak — don't break it!"
- "New weekly tournament starts in 2 hours"

Respectful frequency. Easy to disable per-category.

### 8.10 Themes & Customization

Beyond cosmetic card skins:

- **Dark mode** (essential)
- **Board themes**: Wood, marble, felt, minimalist grid
- **Card styles**: Classic, neon, pastel, pixel art
- **Animations**: Subtle, bouncy, none
- **Sound packs**: Classic, arcade, zen, off

Let players make the game feel like theirs.

## Prioritization

Not all of these should be built. Prioritize based on:

1. **Player retention impact**: Move replay, heatmap, Elo, dark mode
2. **Competitive differentiation**: Pattern training, collaborative mode
3. **Revenue potential**: Themes, tournaments (entry fees?)
4. **Development effort**: Smart notifications and spectator features are complex

**Suggested order**: Dark mode → Move replay → Heatmap → Elo → Pattern training → Themes → Tournaments

## Definition of Done

These are individually scoped. Each has its own definition of done. The milestone is complete when at least 4 of the top-priority features ship.
