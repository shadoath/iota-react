# Milestone 7: Commercial Polish

> The difference between a project and a product.

## Goals

- PWA installable on any device
- Fast first load, offline capable
- Accessibility (WCAG 2.1 AA)
- Analytics to understand player behavior
- Monetization foundation

## Tasks

### 7.1 Progressive Web App

Make the game installable:

- `manifest.json` with icons (192px, 512px), theme color, display: standalone
- Service worker for offline caching (Next.js PWA plugin or `next-pwa`)
- Cache strategy: app shell cached, game assets cached, API calls network-first
- Offline mode: solo play works fully offline, multiplayer shows "offline" state
- Install prompt: subtle banner after 3rd visit

### 7.2 Performance Optimization

Target metrics:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.0s
- Cumulative Layout Shift: < 0.1

Actions:
- Code splitting: game modes loaded lazily
- Image optimization: use `next/image` for any raster assets
- Font subsetting: only load needed glyphs
- Bundle analysis: `@next/bundle-analyzer` to find bloat
- Remove MUI if fully migrated to CSS Modules (huge bundle reduction)
- Preload critical assets (card shapes, fonts)

### 7.3 Accessibility

- Full keyboard navigation (tab through cards, enter to place, escape to deselect)
- Screen reader announcements for game events ("Card placed at row 3, column 2. Score: 8")
- `aria-live` regions for score updates and turn changes
- High contrast mode (alternative color scheme for colorblind players)
- Reduced motion mode (respects `prefers-reduced-motion`)
- Focus indicators on all interactive elements
- Shape + pattern combinations so color is never the only differentiator

### 7.4 Onboarding Flow

First-time player experience:

1. Landing page: "NodusNexus — The card game of matching patterns" + "Play Now" CTA
2. Quick choice: "Learn the rules" → Tutorial, or "I know NodusNexus" → Quick game
3. After first game: prompt to create account (optional)
4. After 3rd game: prompt to try daily challenge

No registration wall. Play first, commit later.

### 7.5 Analytics

Understand how players use the app:

- **Events**: game_start, game_end, turn_complete, card_placed, tutorial_step, mode_selected
- **Properties**: game_mode, difficulty, score, turn_count, duration, device_type
- **Funnel**: landing → first_game → second_game → account_created → multiplayer

Use Plausible (privacy-friendly, no cookies) or PostHog (self-hostable, feature flags).

No tracking without consent. GDPR-compliant from day one.

### 7.6 SEO & Meta

- Open Graph tags for sharing (game preview image)
- Dynamic OG images for daily challenge results ("I scored 87 on today's NodusNexus challenge!")
- Structured data for the app
- Sitemap for public pages (/leaderboard, /about, /tutorial)
- `robots.txt` allowing indexing

### 7.7 Monetization (Non-Aggressive)

Options, in order of user-friendliness:

1. **Cosmetics**: Card themes (dark mode, neon, vintage), board skins, card backs. $1-3 each.
2. **Premium modes**: Unlimited puzzle mode, advanced stats dashboard. $5/month or $30/year.
3. **Ad-supported free tier**: Small banner ad between games (never during). Premium removes ads.
4. **One-time purchase**: Pay $5 to unlock everything forever. Simplest, most honest.

**Recommendation**: Start with cosmetics + optional tip jar. Evaluate premium subscription later based on engagement data.

### 7.8 Legal & Compliance

- Terms of Service
- Privacy Policy (required for app stores and GDPR)
- Cookie consent (if any cookies used beyond session)
- NodusNexus trademark research — ensure you can use the name or choose an alternative
- Age rating considerations

### 7.9 Error Handling & Monitoring

- Global error boundary with friendly "something went wrong" screen
- Sentry (or similar) for error tracking
- Uptime monitoring for multiplayer server
- Graceful degradation: if WebSocket fails, fall back to polling

## Definition of Done

- [ ] Installable as PWA on iOS, Android, desktop
- [ ] Works offline for solo play
- [ ] Lighthouse scores: Performance 90+, Accessibility 95+, Best Practices 95+
- [ ] Full keyboard navigation
- [ ] Colorblind-friendly mode
- [ ] Analytics tracking core events
- [ ] At least one cosmetic purchasable
- [ ] Privacy policy and terms published
