import nextConfig from "eslint-config-next"
import prettier from "eslint-config-prettier"

const config = [
  ...nextConfig,
  prettier,
  {
    ignores: ["node_modules/", ".next/", "out/", "vitest.config.ts", "public/sw.js"],
  },
]

export default config
