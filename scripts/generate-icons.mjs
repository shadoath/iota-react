/**
 * One-time script to generate PWA icon PNGs from icon.svg.
 * Run: node scripts/generate-icons.mjs
 * Requires: sharp (npm install -D sharp)
 */
import sharp from "sharp"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = resolve(__dirname, "../public/icons")
const svgBuffer = readFileSync(resolve(iconsDir, "icon.svg"))

const standardSizes = [72, 96, 128, 144, 152, 192, 384, 512]
const maskableSizes = [192, 512]
const appleTouchSize = 180

async function generateStandard(size) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(resolve(iconsDir, `icon-${size}.png`))
  console.log(`Generated icon-${size}.png`)
}

async function generateMaskable(size) {
  // Maskable icons need content in the inner 80% safe zone
  const padding = Math.round(size * 0.1)
  const innerSize = size - padding * 2

  const resizedSvg = await sharp(svgBuffer).resize(innerSize, innerSize).png().toBuffer()

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: "#1a1a1a",
    },
  })
    .composite([{ input: resizedSvg, left: padding, top: padding }])
    .png()
    .toFile(resolve(iconsDir, `icon-maskable-${size}.png`))
  console.log(`Generated icon-maskable-${size}.png`)
}

async function generateAppleTouch() {
  await sharp(svgBuffer)
    .resize(appleTouchSize, appleTouchSize)
    .png()
    .toFile(resolve(iconsDir, "apple-touch-icon.png"))
  console.log("Generated apple-touch-icon.png")
}

async function main() {
  const tasks = [
    ...standardSizes.map((s) => generateStandard(s)),
    ...maskableSizes.map((s) => generateMaskable(s)),
    generateAppleTouch(),
  ]
  await Promise.all(tasks)
  console.log("All icons generated successfully.")
}

main().catch((err) => {
  console.error("Icon generation failed:", err)
  process.exit(1)
})
