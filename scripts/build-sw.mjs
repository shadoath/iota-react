/**
 * Post-build script: injects the precache manifest into the service worker
 * and bundles it into a single file (no bare ES imports in output).
 * Run after `next build` via: node scripts/build-sw.mjs
 */
import { injectManifest } from "workbox-build"
import { build as esbuild } from "esbuild"
import { readFileSync, existsSync } from "fs"
import { createHash } from "crypto"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")

function fileHash(filePath) {
  if (!existsSync(filePath)) return Date.now().toString()
  const content = readFileSync(filePath)
  return createHash("md5").update(content).digest("hex").slice(0, 8)
}

async function buildServiceWorker() {
  const buildIdPath = resolve(root, ".next/BUILD_ID")
  if (!existsSync(buildIdPath)) {
    console.error("Error: .next/BUILD_ID not found. Run `next build` first.")
    process.exit(1)
  }

  const buildId = readFileSync(buildIdPath, "utf-8").trim()

  const additionalManifestEntries = [
    { url: "/", revision: buildId },
    { url: "/manifest.json", revision: fileHash(resolve(root, "public/manifest.json")) },
    { url: "/offline.html", revision: fileHash(resolve(root, "public/offline.html")) },
    { url: "/icons/icon.svg", revision: fileHash(resolve(root, "public/icons/icon.svg")) },
    { url: "/icons/icon-192.png", revision: fileHash(resolve(root, "public/icons/icon-192.png")) },
    { url: "/icons/icon-512.png", revision: fileHash(resolve(root, "public/icons/icon-512.png")) },
  ]

  // Step 1: Inject the precache manifest (outputs unbundled ES module)
  const swIntermediate = resolve(root, "public/sw.unbundled.js")
  const { count, size, warnings } = await injectManifest({
    swSrc: resolve(root, "src/sw/service-worker.js"),
    swDest: swIntermediate,
    globDirectory: resolve(root, ".next/static"),
    globPatterns: ["**/*.{js,css,woff2}"],
    modifyURLPrefix: { "": "/_next/static/" },
    additionalManifestEntries,
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  })

  if (warnings.length > 0) {
    console.warn("Workbox warnings:")
    warnings.forEach((w) => console.warn("  ", w))
  }

  // Step 2: Bundle into a single IIFE so the browser can load it as a classic script
  await esbuild({
    entryPoints: [swIntermediate],
    bundle: true,
    outfile: resolve(root, "public/sw.js"),
    format: "iife",
    minify: true,
    sourcemap: false,
  })

  // Clean up intermediate file
  const { unlinkSync } = await import("fs")
  try { unlinkSync(swIntermediate) } catch { /* ignore */ }

  console.log(`Service worker built: ${count} files precached (${(size / 1024).toFixed(1)} KB)`)
}

buildServiceWorker().catch((err) => {
  console.error("Service worker build failed:", err)
  process.exit(1)
})
