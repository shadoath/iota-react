# Milestone 6: Social & Engagement

> Sticky games have identity and progression.

## Goals

- Player profiles and authentication
- Persistent stats and game history
- Leaderboards (daily, weekly, all-time)
- Achievements that reward exploration

## Tasks

### 6.1 Authentication

Keep it simple. Players want to play, not fill out forms.

**Options (pick one):**
- **Anonymous + upgrade**: Start playing immediately with a generated name. Optionally sign in later to save progress permanently. Best for conversion.
- **Social login only**: Google / Apple / GitHub sign-in. No passwords to manage.

**Recommendation**: Anonymous-first with optional social login upgrade.

Implementation:
- NextAuth.js (or Auth.js) for the auth layer
- Session stored in cookie
- Guest sessions stored in localStorage, migrated to account on sign-in
- Minimal user model: `{ id, name, avatar, createdAt }`

### 6.2 Database

Lightweight data needs. Two options:

**Option A: Supabase (Postgres + Auth + Realtime)**
- Free tier covers early growth
- Row-level security for multiplayer data
- Built-in auth (could replace NextAuth)

**Option B: PlanetScale / Neon (serverless Postgres) + Prisma**
- More control, standard stack
- Prisma for type-safe queries

**Data models:**
```
User { id, name, avatar, createdAt }
GameResult { id, date, mode, players[], scores[], winner, duration, turnCount }
DailyChallenge { date, seed, userId, score, rank }
Achievement { userId, achievementId, unlockedAt }
```

### 6.3 Player Profile

`/profile/[username]` page:

- Display name + avatar (from social login or chosen)
- Win/loss record
- Average score per game
- Best single turn score
- Total games played
- Favorite card (most frequently played color/shape)
- Achievement showcase (top 6 pinned)
- Recent game history (last 10 games)

### 6.4 Stats Dashboard

`/stats` page:

- Games played (total, this week, this month)
- Win rate (vs AI easy/medium/hard, vs humans)
- Score distribution histogram
- Average score trend over time
- Longest win streak
- Best scores by mode

All charts built with CSS (no charting library). Simple bar charts and sparklines.

### 6.5 Leaderboards

`/leaderboard` page:

- **Daily Challenge**: Today's top 50 scores
- **Weekly**: Best cumulative daily challenge score this week
- **All-Time**: Highest single-game scores
- **Friends**: Filtered to people you've played with

Leaderboard updates in near real-time for daily challenges.

### 6.6 Achievements

Rewarding milestones that encourage different play styles:

**Beginner:**
- "First Move" — Complete your first game
- "Student" — Complete the tutorial
- "Daily Player" — Complete a daily challenge

**Skill:**
- "Four of a Kind" — Play all 4 cards in a single turn
- "Line Master" — Complete a line of 4
- "Century" — Score 100+ in a single game
- "Perfect Line" — Score 16 in a single line (4+4+4+4)

**Dedication:**
- "Week Warrior" — 7-day daily challenge streak
- "Centurion" — Play 100 games
- "Veteran" — Play 500 games

**Social:**
- "Friendly" — Play 10 multiplayer games
- "Rival" — Play 5 games against the same person
- "Champion" — Win a game against Hard AI

**Secret:**
- "Wild Thing" — Win a game using both wild cards
- "Minimalist" — Win while never playing more than 1 card per turn
- "Speedster" — Win a blitz game with 30+ seconds remaining

Display: Toast notification on unlock + profile showcase.

### 6.7 Friends System (Lite)

No full social graph. Keep it simple:

- "Recent opponents" list (auto-populated from multiplayer games)
- Quick invite: send room link to recent opponent
- Compare stats with any recent opponent
- No friend requests, no DMs, no feeds

## Definition of Done

- [ ] Players can sign in and have persistent profiles
- [ ] Game results saved to database
- [ ] Profile page shows meaningful stats
- [ ] Daily challenge leaderboard works
- [ ] At least 15 achievements implemented
- [ ] Recent opponents list enables quick rematches
