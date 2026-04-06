/**
 * Standalone Socket.io multiplayer server.
 * Deploy this separately from the Next.js app (Railway, Fly.io, Render, etc.).
 *
 * Required env vars:
 *   CORS_ORIGIN — allowed origins, comma-separated (e.g. "https://nodusnexus.com")
 *   PORT        — defaults to 3001
 */

import { createServer } from "http"
import { initSocketServer } from "./src/multiplayer/server"

const port = parseInt(process.env.PORT || "3001", 10)
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : "*"

const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ status: "ok" }))
    return
  }
  res.writeHead(404)
  res.end()
})

initSocketServer(httpServer, corsOrigin)

httpServer.listen(port, () => {
  console.log(`> Multiplayer server listening on port ${port}`)
  console.log(`> CORS origin: ${Array.isArray(corsOrigin) ? corsOrigin.join(", ") : corsOrigin}`)
})
