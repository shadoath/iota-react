/**
 * Custom Next.js server with Socket.io for multiplayer.
 * Run with: npx tsx server.ts
 *
 * Socket.io runs on a separate HTTP server (port 3001) to avoid
 * conflicts with Next.js/Turbopack's WebSocket handling.
 */

import { createServer } from "http"
import { parse } from "url"
import next from "next"
import { initSocketServer } from "./src/multiplayer/server"

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = parseInt(process.env.PORT || "3000", 10)
const socketPort = parseInt(process.env.SOCKET_PORT || "3001", 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Next.js HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  })

  // Separate HTTP server for Socket.io to avoid conflicts with
  // Next.js/Turbopack WebSocket handling in dev mode.
  const socketServer = createServer()
  const devOrigins = [`http://localhost:${port}`, `http://${hostname}:${port}`]
  initSocketServer(socketServer, devOrigins)

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })

  socketServer.listen(socketPort, () => {
    console.log(`> Socket.io server on http://${hostname}:${socketPort}`)
  })
})
