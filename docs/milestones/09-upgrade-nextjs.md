# Upgrade: Next.js 14 → 15/16

> Next.js has had two major releases since our version. This plan upgrades through both.

## Why

- Next.js 14.2.5 is end-of-life — no more security patches
- Next.js 15 introduced Turbopack as default, async request APIs, React 19 support
- Next.js 16 added further performance improvements and API stabilization
- Vercel deployment benefits from latest runtime optimizations

## Pre-requisites

- React 19 upgrade must be completed first (Next.js 15+ requires React 19)
- ESLint upgrade should be done first or simultaneously (Next.js 16 uses eslint-config-next 16)

## Step 1: Next.js 14 → 15

### Breaking Changes to Address

1. **Async Request APIs**: `cookies()`, `headers()`, `params`, `searchParams` are now async. We don't use these heavily, but check all `app/` route files.

2. **Caching behavior changed**: `fetch` requests are no longer cached by default. We don't use server-side fetch, so low risk.

3. **`next/font`**: Google Font handling may have subtle changes. Check `layout.tsx` Inter import.

4. **Turbopack**: Now the default dev bundler. Should work out of the box but test thoroughly.

### Actions

```bash
npm install next@15 react@19 react-dom@19 eslint-config-next@15
npm install -D @types/react@19 @types/react-dom@19
```

- Run `npm run build` and fix any build errors
- Run `npm run dev` and test all game modes manually
- Run `npm run test:run` and fix any test failures
- Test multiplayer with `npm run dev:mp`

## Step 2: Next.js 15 → 16

### Changes

- Incremental improvement release — fewer breaking changes
- Updated defaults and performance optimizations

### Actions

```bash
npm install next@16 eslint-config-next@16
```

- Same verification steps as above

## Testing Checklist

- [ ] `npm run build` succeeds
- [ ] `npm run dev` — game loads, all modes playable
- [ ] `npm run dev:mp` — multiplayer server starts
- [ ] `npm run test:run` — all 120+ tests pass
- [ ] `npm run lint` — no warnings
- [ ] `npm run typecheck` — clean
- [ ] Dark mode works
- [ ] PWA manifest still loads
- [ ] Tutorial, Practice, Timed modes functional
- [ ] AI opponents play correctly at all difficulty levels
- [ ] Game replay works end to end

## Estimated Effort

Medium — mostly mechanical changes. The async API migration and React 19 compatibility are the main risk areas. Plan for 1-2 sessions.

## Dependencies

Must complete first:
1. [React 18 → 19 upgrade](10-upgrade-react-19.md)
