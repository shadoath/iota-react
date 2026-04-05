# Upgrade: React 18 → 19

> React 19 is a significant release with new APIs and some breaking changes. This should be done before the Next.js upgrade.

## Why

- Next.js 15+ requires React 19
- React 19 introduces `use()`, improved Suspense, Actions, `useOptimistic`, `useFormStatus`
- Better server component support
- Performance improvements in reconciler

## Breaking Changes to Address

### 1. Ref changes

- `ref` is now a regular prop (no more `forwardRef` needed)
- We don't use `forwardRef` anywhere — **no action needed**

### 2. Context as provider

- `<Context>` can be used directly instead of `<Context.Provider>`
- Our `GameContext.tsx` uses `<GameContext.Provider>` — **optional cleanup, not breaking**

### 3. Cleanup functions in refs

- Ref callbacks can return cleanup functions
- **No action needed** — we don't use ref callbacks

### 4. `useDeferredValue` initial value

- New optional second argument
- **No action needed** — we don't use this hook

### 5. Stricter hydration error reporting

- Better error messages for SSR mismatches
- May surface hidden issues with our `useEffect`-based client state (localStorage reads, etc.)
- **Test thoroughly** — our theme hook, stats, and tutorial completion check all read localStorage in effects

### 6. Removed deprecated APIs

- `react-dom/test-utils` — removed. `act()` now exported from `react`
- Check if `@testing-library/react` handles this (it should in v16+)
- `ReactDOM.render` / `ReactDOM.unmountComponentAtNode` — removed. We use Next.js entry, so **no action**

### 7. TypeScript changes

- `@types/react@19` has stricter types
- `React.FC` children are no longer implicit — must be explicit in props
- Audit all components that receive `children`

## Migration Steps

### 1. Install

```bash
npm install react@19 react-dom@19
npm install -D @types/react@19 @types/react-dom@19
```

### 2. Fix TypeScript errors

Run `npm run typecheck` and fix:

- Any components relying on implicit `children` prop
- Any usage of removed types

### 3. Fix test infrastructure

```bash
npm install -D @testing-library/react@latest
```

Ensure `act()` imports work correctly. Update test setup if needed.

### 4. Test hydration

- Run `npm run build && npm start`
- Open browser, check console for hydration warnings
- Focus on pages that read localStorage on mount (theme, stats, tutorial)

### 5. Optional: Adopt new APIs

These are nice-to-haves, not required for the upgrade:

- Replace `<GameContext.Provider>` with `<GameContext>` (cleaner)
- Explore `useOptimistic` for card placement (optimistic UI)
- Explore `use()` for async data loading

## Testing Checklist

- [ ] `npm run typecheck` — clean
- [ ] `npm run test:run` — all tests pass
- [ ] `npm run build` — no build errors
- [ ] No hydration warnings in browser console
- [ ] Dark mode toggle works (localStorage)
- [ ] Stats page loads correctly (localStorage)
- [ ] Tutorial completion state persists
- [ ] All game modes functional

## Estimated Effort

Low-medium — React 19 is largely backwards compatible. The main work is TypeScript type fixes and testing for hydration issues. Plan for 1 session.

## Order

1. **Do this first**
2. Then [Next.js 14 → 15/16](09-upgrade-nextjs.md)
3. Then [ESLint 8 → 9](11-upgrade-eslint.md) (optional, can be independent)
