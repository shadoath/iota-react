# Milestone 12: Supabase Database, Authentication, and Elo Ratings

> The final piece: persistent identity, cloud-synced stats, and competitive rankings.

## Overview

Migrate from localStorage-only to Supabase for persistent data. Add authentication (anonymous-first with social login upgrade), sync game results to the cloud, and implement an Elo rating system for competitive play.

## Architecture

```
Browser → Supabase Auth (anonymous / Google / GitHub)
       → Supabase Postgres (game results, ratings, profiles)
       → Row-Level Security (users can only read/write their own data)
       → localStorage remains as offline fallback
```

## Phase 1: Supabase Setup

### 1.1 Create Supabase Project
- Create project at supabase.com
- Note: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.2 Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 1.3 Create Supabase Client
```
src/lib/supabase.ts         — browser client
src/lib/supabase-server.ts  — server client (for API routes)
```

### 1.4 Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Phase 2: Database Schema

### Tables

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Player',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game results
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL, -- 'classic', 'practice', 'timed', 'daily'
  score INTEGER NOT NULL,
  won BOOLEAN NOT NULL,
  opponent_difficulty TEXT, -- 'easy', 'medium', 'hard'
  total_turns INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  best_turn_score INTEGER NOT NULL DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Elo ratings
CREATE TABLE elo_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL DEFAULT 1200,
  games_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  peak_rating INTEGER NOT NULL DEFAULT 1200,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Elo match history
CREATE TABLE elo_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES profiles(id),
  opponent_id UUID REFERENCES profiles(id),
  player_rating_before INTEGER NOT NULL,
  player_rating_after INTEGER NOT NULL,
  result TEXT NOT NULL, -- 'win', 'loss', 'draw'
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily challenge leaderboard
CREATE TABLE daily_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  score INTEGER NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Achievements (cloud-synced)
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

### Row-Level Security
```sql
-- Users can only read/write their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Game results: own data only
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own results" ON game_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own results" ON game_results FOR SELECT USING (auth.uid() = user_id);

-- Elo: own data readable, public leaderboard via function
ALTER TABLE elo_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own rating" ON elo_ratings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public leaderboard" ON elo_ratings FOR SELECT USING (true);

-- Daily scores: public (it's a leaderboard)
ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public daily scores" ON daily_scores FOR SELECT USING (true);
CREATE POLICY "Users can insert own scores" ON daily_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Phase 3: Authentication

### 3.1 Anonymous-First Flow
1. User opens the game → auto-creates anonymous Supabase session
2. All game data saved under anonymous user ID
3. Prompt to "Save your progress" after 3rd game
4. User signs in with Google/GitHub → anonymous account upgraded, data preserved

### 3.2 Auth Provider Component
```
src/context/AuthContext.tsx
- Manages Supabase auth state
- Provides user, signIn, signOut, isAnonymous
- Handles anonymous → authenticated upgrade
- Migrates localStorage data to cloud on first sign-in
```

### 3.3 Sign-In UI
- Small profile icon in mode select header
- Click → modal with "Sign in with Google" / "Sign in with GitHub"
- After sign-in: display name, profile in sidebar

### 3.4 Data Migration
When a user signs in for the first time:
1. Read localStorage stats and achievements
2. Bulk insert into Supabase tables
3. Mark localStorage as "synced"
4. Future writes go to both localStorage (offline fallback) and Supabase

## Phase 4: Elo Rating System

### 4.1 Elo Calculation
```typescript
function calculateElo(
  playerRating: number,
  opponentRating: number,
  result: 'win' | 'loss' | 'draw',
  kFactor: number = 32
): { newPlayerRating: number; newOpponentRating: number }
```

Standard Elo formula:
- Expected score: `E = 1 / (1 + 10^((Ro - Rp) / 400))`
- New rating: `R' = R + K * (S - E)` where S = 1 (win), 0 (loss), 0.5 (draw)
- K-factor: 32 for new players (<30 games), 24 for established, 16 for rated >2400

### 4.2 AI Elo Assignments
| Difficulty | Fixed Elo |
|-----------|-----------|
| Easy | 800 |
| Medium | 1200 |
| Hard | 1600 |

Playing against AI adjusts your Elo but doesn't change the AI's.

### 4.3 Rank Tiers
| Rating | Tier |
|--------|------|
| < 900 | Novice |
| 900-1100 | Apprentice |
| 1100-1300 | Strategist |
| 1300-1500 | Expert |
| 1500-1800 | Master |
| > 1800 | Grandmaster |

### 4.4 Leaderboard
- `/leaderboard` page (new Next.js route)
- Global top 50 by Elo rating
- Daily challenge top 50 by score
- Filterable by time period (today, week, all-time)

## Phase 5: Cloud-Synced Features

### 5.1 Stats Service Upgrade
- `statsService.ts` gets a Supabase variant
- Writes to both localStorage (instant) and Supabase (async)
- Reads from Supabase if authenticated, localStorage if offline
- Conflict resolution: Supabase is source of truth

### 5.2 Achievement Sync
- On sign-in: merge localStorage achievements with cloud
- New unlocks go to both immediately

### 5.3 Daily Challenge Leaderboard
- After completing daily, score submitted to `daily_scores`
- Leaderboard component shows top 50 for today
- "Your rank" indicator

## Implementation Order

1. **Supabase setup + schema** (30 min)
2. **Auth context + anonymous sessions** (1 session)
3. **Sign-in UI + profile display** (1 session)
4. **Stats sync (localStorage → Supabase)** (1 session)
5. **Elo system + AI ratings** (1 session)
6. **Leaderboard page** (1 session)
7. **Daily challenge leaderboard** (30 min)
8. **Data migration for existing users** (30 min)

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Testing Checklist

- [ ] Anonymous session created on first visit
- [ ] Game results saved to Supabase
- [ ] Sign in with Google works
- [ ] Sign in with GitHub works
- [ ] Anonymous → authenticated upgrade preserves data
- [ ] Elo updates correctly after each game
- [ ] Leaderboard loads and paginates
- [ ] Daily challenge scores appear on leaderboard
- [ ] Offline play falls back to localStorage
- [ ] RLS policies prevent cross-user data access
