"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  RoomState,
  MultiplayerGameState,
} from "./protocol"
import type { Card, GridPosition } from "../types/game"

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export interface UseSocketReturn {
  connected: boolean
  roomState: RoomState | null
  gameState: MultiplayerGameState | null
  hand: Card[]
  error: string | null
  playerId: string | null
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
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<TypedSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [gameState, setGameState] = useState<MultiplayerGameState | null>(null)
  const [hand, setHand] = useState<Card[]>([])
  const [error, setError] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)

  // Connect on mount
  useEffect(() => {
    const socket: TypedSocket = io({
      path: "/api/socket",
      transports: ["websocket", "polling"],
    })

    socketRef.current = socket

    socket.on("connect", () => setConnected(true))
    socket.on("disconnect", () => setConnected(false))

    socket.on("room:state", (state) => setRoomState(state))
    socket.on("room:error", (msg) => setError(msg))
    socket.on("game:state", (state) => setGameState(state))
    socket.on("game:your_hand", (cards) => setHand(cards))
    socket.on("game:error", (msg) => setError(msg))

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
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
            setPlayerId(response.code) // will be set via room:state
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
  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(null), 5000)
    return () => clearTimeout(timer)
  }, [error])

  return {
    connected,
    roomState,
    gameState,
    hand,
    error,
    playerId,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    placeCard,
    completeTurn,
    undoPlacement,
    swapCards,
  }
}
