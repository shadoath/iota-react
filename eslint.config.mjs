import nextConfig from 'eslint-config-next'

const config = [
  ...nextConfig,
  {
    ignores: ['node_modules/', '.next/', 'out/', 'vitest.config.ts'],
  },
]

export default config
