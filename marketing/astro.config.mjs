import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  site: "https://nodusnexus.com",
  outDir: "../docs",
  build: {
    // Don't clean the output dir — docs/ contains ROADMAP.md and milestones/
    clean: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
