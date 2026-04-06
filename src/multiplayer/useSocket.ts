"use client"

import { useRef, useState, useCallback } from "react"
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  RoomState,
  MultiplayerGameState,
} from "./protocol"
import type { Card, GridPosition } from "../types/game"

type TypedSocket = import("socket.io-client").Socket<ServerToClientEvents, ClientToServerEvents>

export interface UseSocketReturn {
  connected: boolean
  connecting: boolean
  roomState: RoomState | null
  gameState: MultiplayerGameState | null
  hand: Card[]
  error: string | null
  playerId: string | null
  connect: () => void
  createRoom: (
    maxPlayers: 2 | 3 | 4,
    turnTimer: number | null,
    playerName: string
  ) => Promise<string | null>
  joinRoom: (code: string, playerName: string) => Promise<boolean>
  leaveRoom: () => void
  startGame: () => void
  placeCard: (cardId: string, position: GridPosition) => void
  completeTurn: () => void
  undoPlacement: () => void
  swapCards: (cardIds: string[]) => void
  disconnect: () => void
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<TypedSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [gameState, setGameState] = useState<MultiplayerGameState | null>(null)
  const [hand, setHand] = useState<Card[]>([])
  const [error, setError] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)

  // Lazy connect — only when user enters multiplayer
  const connect = useCallback(() => {
    if (socketRef.current) return // already connected

    setConnecting(true)
    setError(null)

    // Dynamic import to avoid loading socket.io-client on every page load
    import("socket.io-client").then(({ io }) => {
      // In production, NEXT_PUBLIC_SOCKET_URL points to the standalone
      // multiplayer server. In dev, falls back to localhost:3001.
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL ||
        (typeof window !== "undefined" && window.location.hostname === "localhost"
          ? "http://localhost:3001"
          : undefined)

      const socket: TypedSocket = io(socketUrl ?? "/", {
        path: "/api/socket",
        transports: ["websocket", "polling"],
        timeout: 10000,
        reconnectionAttempts: 3,
      })

      socketRef.current = socket

      socket.on("connect", () => {
        setConnected(true)
        setConnecting(false)
      })

      socket.on("disconnect", () => setConnected(false))

      socket.on("connect_error", (err) => {
        setConnecting(false)
        setError(`Connection failed: ${err.message}. Make sure the multiplayer server is running (npm run dev:mp).`)
      })

      socket.on("room:state", (state) => setRoomState(state))
      socket.on("room:error", (msg) => setError(msg))
      socket.on("game:state", (state) => setGameState(state))
      socket.on("game:your_hand", (cards) => setHand(cards))
      socket.on("game:error", (msg) => setError(msg))
    }).catch(() => {
      setConnecting(false)
      setError("Failed to load multiplayer module")
    })
  }, [])

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
    socketRef.current = null
    setConnected(false)
    setConnecting(false)
    setRoomState(null)
    setGameState(null)
    setHand([])
    setPlayerId(null)
    setError(null)
  }, [])

  const createRoom = useCallback(
    async (
      maxPlayers: 2 | 3 | 4,
      turnTimer: number | null,
      playerName: string
    ): Promise<string | null> => {
      const socket = socketRef.current
      if (!socket) return null

      return new Promise((resolve) => {
        socket.emit("room:create", { maxPlayers, turnTimer }, playerName, (response) => {
          if (response.ok && response.code) {
            setPlayerId(response.code)
            setError(null)
            resolve(response.code)
          } else {
            setError(response.error ?? "Failed to create room")
            resolve(null)
          }
        })
      })
    },
    []
  )

  const joinRoom = useCallback(async (code: string, playerName: string): Promise<boolean> => {
    const socket = socketRef.current
    if (!socket) return false

    return new Promise((resolve) => {
      socket.emit("room:join", code, playerName, (response) => {
        if (response.ok) {
          setError(null)
          resolve(true)
        } else {
          setError(response.error ?? "Failed to join room")
          resolve(false)
        }
      })
    })
  }, [])

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit("room:leave")
    setRoomState(null)
    setGameState(null)
    setHand([])
    setPlayerId(null)
  }, [])

  const startGame = useCallback(() => {
    socketRef.current?.emit("game:start")
  }, [])

  const placeCard = useCallback((cardId: string, position: GridPosition) => {
    socketRef.current?.emit("game:place_card", cardId, position)
  }, [])

  const completeTurn = useCallback(() => {
    socketRef.current?.emit("game:complete_turn")
  }, [])

  const undoPlacement = useCallback(() => {
    socketRef.current?.emit("game:undo")
  }, [])

  const swapCards = useCallback((cardIds: string[]) => {
    socketRef.current?.emit("game:swap_cards", cardIds)
  }, [])

  // Clear error after 5 seconds
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  if (error && !errorTimerRef.current) {
    errorTimerRef.current = setTimeout(() => {
      setError(null)
      errorTimerRef.current = null
    }, 8000)
  }

  return {
    connected,
    connecting,
    roomState,
    gameState,
    hand,
    error,
    playerId,
    connect,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    placeCard,
    completeTurn,
    undoPlacement,
    swapCards,
    disconnect,
  }
}
