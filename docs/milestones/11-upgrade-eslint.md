# Upgrade: ESLint 8 → 9+

> ESLint 9 introduced "flat config" — a completely new configuration format. This is the biggest migration of the three.

## Why

- ESLint 8 is end-of-life (October 2024)
- ESLint 9+ uses flat config (`eslint.config.js`) instead of `.eslintrc.json`
- Next.js 15+ eslint-config-next supports flat config
- Better performance and simpler configuration

## Breaking Changes

### 1. Configuration format

- `.eslintrc.json` → `eslint.config.js` (or `.mjs`)
- `extends` → `import` and spread
- Completely different structure

### 2. Plugin format

- Plugins must export flat config format
- `eslint-config-next` added flat config support in v15

### 3. Node.js version

- ESLint 9 requires Node.js 18.18+
- **Verify our deployment target supports this**

## Migration Steps

### 1. Upgrade packages

```bash
npm install -D eslint@9 eslint-config-next@latest
```

### 2. Migrate config

Delete `.eslintrc.json` and create `eslint.config.mjs`:

```js
import { FlatCompat } from "@eslint/eslintrc"
import nextConfig from "eslint-config-next"

const compat = new FlatCompat()

export default [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // any custom rules
    },
  },
]
```

Or if eslint-config-next@16 supports native flat config:

```js
import nextConfig from "@next/eslint-plugin-next"

export default [nextConfig.configs.recommended, nextConfig.configs["core-web-vitals"]]
```

### 3. Update npm script

The `next lint` command should work with flat config in Next.js 15+. If not, switch to:

```json
"lint": "eslint ."
```

### 4. Test

```bash
npm run lint
```

Fix any newly surfaced issues (flat config may apply rules slightly differently).

## Alternative: Skip to TypeScript ESLint

Consider switching to `typescript-eslint` flat config directly, which gives:

- Type-aware linting
- Better TypeScript integration
- Single config system

This is more work but produces a cleaner setup. Evaluate when doing the migration.

## Testing Checklist

- [ ] `npm run lint` — clean
- [ ] No config files left over (`.eslintrc.json` deleted)
- [ ] `eslint.config.mjs` in place
- [ ] Same rules enforced as before (no regressions)

## Estimated Effort

Low — mostly config file changes. The actual rule behavior is the same. Plan for 1 short session.

## Order

This can be done independently or alongside the Next.js upgrade:

1. [React 18 → 19](10-upgrade-react-19.md)
2. [Next.js 14 → 15/16](09-upgrade-nextjs.md)
3. **ESLint 8 → 9** (this — can also be done with step 2)

## Note on TypeScript 6

TypeScript 6.0 was recently released. It's largely backwards compatible with TS 5.x but:

- Introduces stricter `--isolatedDeclarations` by default
- May surface new type errors

Recommendation: upgrade TS alongside or after the React/Next.js migration, since `@types/react@19` + TS 6 together may surface compounding type issues. One thing at a time.
