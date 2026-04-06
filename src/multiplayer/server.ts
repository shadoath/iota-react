/**
 * Socket.io server initialization.
 * Attached to the Next.js HTTP server via a custom server or API route.
 */

import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"
import type { ClientToServerEvents, ServerToClientEvents } from "./protocol"
import { RoomManager } from "./RoomManager"

const roomManager = new RoomManager()

// Periodic cleanup
setInterval(() => roomManager.cleanup(), 5 * 60 * 1000)

// --- Per-socket rate limiting ---

const RATE_LIMIT_WINDOW_MS = 1000
const RATE_LIMIT_MAX_EVENTS = 15

class RateLimiter {
  private counters = new Map<string, { count: number; resetAt: number }>()

  check(socketId: string): boolean {
    const now = Date.now()
    const entry = this.counters.get(socketId)

    if (!entry || now >= entry.resetAt) {
      this.counters.set(socketId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
      return true
    }

    entry.count++
    return entry.count <= RATE_LIMIT_MAX_EVENTS
  }

  remove(socketId: string): void {
    this.counters.delete(socketId)
  }
}

const rateLimiter = new RateLimiter()

export function initSocketServer(
  httpServer: HTTPServer,
  corsOrigin: string | string[] = "https://nodusnexus.com"
): SocketIOServer {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: corsOrigin },
    path: "/api/socket",
  })

  io.on("connection", (socket) => {
    let currentRoom: string | null = null
    let currentPlayerId: string | null = null

    // Rate-limit middleware for all incoming events
    socket.use((_event, next) => {
      if (!rateLimiter.check(socket.id)) {
        next(new Error("Rate limit exceeded"))
        return
      }
      next()
    })

    socket.on("room:create", (settings, playerName, callback) => {
      const { code, playerId } = roomManager.createRoom(socket.id, settings, playerName)
      currentRoom = code
      currentPlayerId = playerId
      socket.join(code)

      const roomState = roomManager.getRoomState(code)
      if (roomState) {
        callback({ ok: true, code })
        socket.emit("room:state", roomState)
      } else {
        callback({ ok: false, error: "Failed to create room" })
      }
    })

    socket.on("room:join", (code, playerName, callback) => {
      const result = roomManager.joinRoom(code.toUpperCase(), socket.id, playerName)
      if (!result.ok) {
        callback({ ok: false, error: result.error })
        return
      }

      currentRoom = code.toUpperCase()
      currentPlayerId = result.playerId!
      socket.join(currentRoom)

      const roomState = roomManager.getRoomState(currentRoom)
      if (roomState) {
        callback({ ok: true })
        io.to(currentRoom).emit("room:state", roomState)
      }
    })

    socket.on("room:leave", () => {
      if (!currentRoom) return
      const { playerId, roomDeleted } = roomManager.leaveRoom(currentRoom, socket.id)
      socket.leave(currentRoom)

      if (!roomDeleted && playerId) {
        const roomState = roomManager.getRoomState(currentRoom)
        if (roomState) {
          io.to(currentRoom).emit("room:state", roomState)
        }
        io.to(currentRoom).emit("player:left", playerId)
      }

      currentRoom = null
      currentPlayerId = null
    })

    socket.on("game:start", () => {
      if (!currentRoom) return
      const result = roomManager.startGame(currentRoom, socket.id)
      if (!result.ok) {
        socket.emit("game:error", result.error!)
        return
      }

      // Send personalized state to each player
      broadcastGameState(currentRoom)
    })

    socket.on("game:place_card", (cardId, position) => {
      if (!currentRoom) return
      const result = roomManager.placeCard(currentRoom, socket.id, cardId, position)
      if (!result.ok) {
        socket.emit("game:error", result.error!)
        return
      }
      broadcastGameState(currentRoom)
    })

    socket.on("game:undo", () => {
      if (!currentRoom) return
      const result = roomManager.undoPlacement(currentRoom, socket.id)
      if (!result.ok) {
        socket.emit("game:error", result.error!)
        return
      }
      broadcastGameState(currentRoom)
    })

    socket.on("game:complete_turn", () => {
      if (!currentRoom) return
      const result = roomManager.completeTurn(currentRoom, socket.id)
      if (!result.ok) {
        socket.emit("game:error", result.error!)
        return
      }
      broadcastGameState(currentRoom)
    })

    socket.on("game:swap_cards", (cardIds) => {
      if (!currentRoom) return
      const result = roomManager.swapCards(currentRoom, socket.id, cardIds)
      if (!result.ok) {
        socket.emit("game:error", result.error!)
        return
      }
      broadcastGameState(currentRoom)
    })

    socket.on("disconnect", () => {
      rateLimiter.remove(socket.id)
      if (!currentRoom || !currentPlayerId) return
      const { roomDeleted } = roomManager.leaveRoom(currentRoom, socket.id)
      if (!roomDeleted) {
        io.to(currentRoom).emit("player:disconnected", currentPlayerId)
        const roomState = roomManager.getRoomState(currentRoom)
        if (roomState) {
          io.to(currentRoom).emit("room:state", roomState)
        }
      }
    })
  })

  function broadcastGameState(roomCode: string) {
    const roomState = roomManager.getRoomState(roomCode)
    if (roomState) {
      io.to(roomCode).emit("room:state", roomState)
    }

    // Send personalized game state to each player
    const room = io.sockets.adapter.rooms.get(roomCode)
    if (!room) return

    const socketIds = Array.from(room)
    for (let i = 0; i < socketIds.length; i++) {
      const socketId = socketIds[i]
      const playerId = roomManager.getPlayerIdBySocket(roomCode, socketId)
      if (!playerId) continue

      const view = roomManager.getGameStateForPlayer(roomCode, playerId)
      if (!view) continue

      const playerSocket = io.sockets.sockets.get(socketId)
      if (playerSocket) {
        playerSocket.emit("game:state", view.gameState)
        playerSocket.emit("game:your_hand", view.hand)
      }
    }
  }

  return io
}
