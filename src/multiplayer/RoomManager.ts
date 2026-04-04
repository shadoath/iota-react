/**
 * Server-side room and game state management.
 * Runs in the Node.js Socket.io server.
 */

import type { Card, PlacedCard, PendingPlacement, GridPosition } from '../types/game'
import type { RoomState, RoomSettings, RoomPlayer, MultiplayerGameState, MultiplayerPlayerView } from './protocol'
import { createDeck, isValidPlacement, calculateScore, getValidPlacements, shuffleDeck } from '../utils/gameLogic'
import { isPlacementInSameLineAsPending } from '../utils/turnValidation'
import { HAND_SIZE, MAX_LINE_LENGTH } from '../constants/game'

// --- Internal game state (server-only, includes hidden info) ---

interface ServerPlayer {
  id: string
  socketId: string
  name: string
  hand: Card[]
  score: number
  connected: boolean
  lastSeen: number
}

interface ServerGameState {
  deck: Card[]
  board: PlacedCard[]
  players: ServerPlayer[]
  currentPlayerIndex: number
  pendingPlacements: PendingPlacement[]
  turnInProgress: boolean
  lastTurnScore: number | null
  gamePhase: 'playing' | 'ended'
}

interface Room {
  code: string
  hostId: string
  settings: RoomSettings
  status: 'lobby' | 'playing' | 'ended'
  players: RoomPlayer[]
  game: ServerGameState | null
  // Map socketId → playerId for reconnection
  socketToPlayer: Map<string, string>
}

// --- Room code generation ---

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// --- Room Manager ---

export class RoomManager {
  private rooms = new Map<string, Room>()

  createRoom(hostSocketId: string, settings: RoomSettings, playerName: string): { code: string; playerId: string } {
    let code: string
    do {
      code = generateRoomCode()
    } while (this.rooms.has(code))

    const playerId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    const room: Room = {
      code,
      hostId: playerId,
      settings,
      status: 'lobby',
      players: [{
        id: playerId,
        name: playerName,
        connected: true,
        lastSeen: Date.now(),
      }],
      game: null,
      socketToPlayer: new Map([[hostSocketId, playerId]]),
    }

    this.rooms.set(code, room)
    return { code, playerId }
  }

  joinRoom(code: string, socketId: string, playerName: string): { ok: boolean; playerId?: string; error?: string } {
    const room = this.rooms.get(code)
    if (!room) return { ok: false, error: 'Room not found' }
    if (room.status !== 'lobby') return { ok: false, error: 'Game already in progress' }
    if (room.players.length >= room.settings.maxPlayers) return { ok: false, error: 'Room is full' }

    const playerId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    room.players.push({
      id: playerId,
      name: playerName,
      connected: true,
      lastSeen: Date.now(),
    })
    room.socketToPlayer.set(socketId, playerId)

    return { ok: true, playerId }
  }

  leaveRoom(code: string, socketId: string): { playerId?: string; roomDeleted: boolean } {
    const room = this.rooms.get(code)
    if (!room) return { roomDeleted: false }

    const playerId = room.socketToPlayer.get(socketId)
    if (!playerId) return { roomDeleted: false }

    room.socketToPlayer.delete(socketId)

    if (room.status === 'lobby') {
      room.players = room.players.filter(p => p.id !== playerId)
      if (room.players.length === 0) {
        this.rooms.delete(code)
        return { playerId, roomDeleted: true }
      }
      // Transfer host if host left
      if (room.hostId === playerId) {
        room.hostId = room.players[0].id
      }
    } else {
      // During game, mark as disconnected
      const player = room.players.find(p => p.id === playerId)
      if (player) {
        player.connected = false
        player.lastSeen = Date.now()
      }
    }

    return { playerId, roomDeleted: false }
  }

  reconnect(code: string, socketId: string, playerId: string): boolean {
    const room = this.rooms.get(code)
    if (!room) return false

    const player = room.players.find(p => p.id === playerId)
    if (!player) return false

    player.connected = true
    player.lastSeen = Date.now()
    room.socketToPlayer.set(socketId, playerId)

    // Update server game state if in progress
    if (room.game) {
      const serverPlayer = room.game.players.find(p => p.id === playerId)
      if (serverPlayer) {
        serverPlayer.socketId = socketId
        serverPlayer.connected = true
      }
    }

    return true
  }

  startGame(code: string, socketId: string): { ok: boolean; error?: string } {
    const room = this.rooms.get(code)
    if (!room) return { ok: false, error: 'Room not found' }

    const playerId = room.socketToPlayer.get(socketId)
    if (playerId !== room.hostId) return { ok: false, error: 'Only the host can start the game' }
    if (room.players.length < 2) return { ok: false, error: 'Need at least 2 players' }

    const deck = createDeck()
    const players: ServerPlayer[] = []

    for (let i = 0; i < room.players.length; i++) {
      const rp = room.players[i]
      const socketEntry = Array.from(room.socketToPlayer.entries()).find(([, pid]) => pid === rp.id)
      players.push({
        id: rp.id,
        socketId: socketEntry?.[0] ?? '',
        name: rp.name,
        hand: deck.splice(0, HAND_SIZE),
        score: 0,
        connected: rp.connected,
        lastSeen: rp.lastSeen,
      })
    }

    const initialCard = deck.shift()!
    const board: PlacedCard[] = [{ card: initialCard, position: { row: 0, col: 0 } }]

    room.game = {
      deck,
      board,
      players,
      currentPlayerIndex: 0,
      pendingPlacements: [],
      turnInProgress: false,
      lastTurnScore: null,
      gamePhase: 'playing',
    }
    room.status = 'playing'

    return { ok: true }
  }

  // --- Game actions ---

  placeCard(code: string, socketId: string, cardId: string, position: GridPosition): { ok: boolean; error?: string } {
    const { game, playerId } = this.getGameAndPlayer(code, socketId)
    if (!game || !playerId) return { ok: false, error: 'Not in a game' }
    if (game.players[game.currentPlayerIndex].id !== playerId) return { ok: false, error: 'Not your turn' }
    if (game.pendingPlacements.length >= MAX_LINE_LENGTH) return { ok: false, error: 'Maximum 4 cards per turn' }

    const player = game.players[game.currentPlayerIndex]
    const card = player.hand.find(c => c.id === cardId)
    if (!card) return { ok: false, error: 'Card not in hand' }

    if (!isPlacementInSameLineAsPending(position, game.pendingPlacements)) {
      return { ok: false, error: 'Must place in same row or column' }
    }

    const allPlacements = [...game.board, ...game.pendingPlacements]
    if (!isValidPlacement(card, position, allPlacements)) {
      return { ok: false, error: 'Invalid placement' }
    }

    const pending: PendingPlacement = {
      card: { ...card, id: `pending-${card.id}` },
      position,
    }

    game.pendingPlacements.push(pending)
    player.hand = player.hand.filter(c => c.id !== cardId)
    game.turnInProgress = true

    return { ok: true }
  }

  undoPlacement(code: string, socketId: string): { ok: boolean; error?: string } {
    const { game, playerId } = this.getGameAndPlayer(code, socketId)
    if (!game || !playerId) return { ok: false, error: 'Not in a game' }
    if (game.players[game.currentPlayerIndex].id !== playerId) return { ok: false, error: 'Not your turn' }
    if (game.pendingPlacements.length === 0) return { ok: false, error: 'Nothing to undo' }

    const last = game.pendingPlacements.pop()!
    const originalCard = { ...last.card, id: last.card.id.replace('pending-', '') }
    game.players[game.currentPlayerIndex].hand.push(originalCard)
    game.turnInProgress = game.pendingPlacements.length > 0

    return { ok: true }
  }

  completeTurn(code: string, socketId: string): { ok: boolean; error?: string; score?: number } {
    const { game, playerId } = this.getGameAndPlayer(code, socketId)
    if (!game || !playerId) return { ok: false, error: 'Not in a game' }
    if (game.players[game.currentPlayerIndex].id !== playerId) return { ok: false, error: 'Not your turn' }
    if (game.pendingPlacements.length === 0) return { ok: false, error: 'Place at least one card' }

    const score = calculateScore(game.pendingPlacements, game.board)
    game.board.push(...game.pendingPlacements)
    game.players[game.currentPlayerIndex].score += score
    game.pendingPlacements = []
    game.turnInProgress = false
    game.lastTurnScore = score

    // Draw cards
    const player = game.players[game.currentPlayerIndex]
    const needed = HAND_SIZE - player.hand.length
    const drawn = game.deck.splice(0, needed)
    player.hand.push(...drawn)

    // Advance turn
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length

    // Check game end
    if (game.deck.length === 0 && game.players.every(p => p.hand.length === 0)) {
      game.gamePhase = 'ended'
      const room = this.rooms.get(code)
      if (room) room.status = 'ended'
    }

    return { ok: true, score }
  }

  swapCards(code: string, socketId: string, cardIds: string[]): { ok: boolean; error?: string } {
    const { game, playerId } = this.getGameAndPlayer(code, socketId)
    if (!game || !playerId) return { ok: false, error: 'Not in a game' }
    if (game.players[game.currentPlayerIndex].id !== playerId) return { ok: false, error: 'Not your turn' }

    const player = game.players[game.currentPlayerIndex]
    const toSwap = player.hand.filter(c => cardIds.includes(c.id))
    if (toSwap.length === 0) return { ok: false, error: 'No valid cards to swap' }

    player.hand = player.hand.filter(c => !cardIds.includes(c.id))
    game.deck.push(...toSwap)

    // Shuffle deck using imported shuffleDeck
    game.deck = shuffleDeck(game.deck)

    // Draw same number
    const drawn = game.deck.splice(0, toSwap.length)
    player.hand.push(...drawn)

    game.lastTurnScore = 0
    game.pendingPlacements = []
    game.turnInProgress = false
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length

    return { ok: true }
  }

  // --- View generation ---

  getGameStateForPlayer(code: string, playerId: string): { gameState: MultiplayerGameState; hand: Card[] } | null {
    const room = this.rooms.get(code)
    if (!room?.game) return null

    const game = room.game
    const isCurrentPlayer = game.players[game.currentPlayerIndex].id === playerId
    const player = game.players.find(p => p.id === playerId)
    if (!player) return null

    const playerViews: MultiplayerPlayerView[] = game.players.map(p => ({
      id: p.id,
      name: p.name,
      cardCount: p.hand.length,
      score: p.score,
      connected: p.connected,
    }))

    return {
      gameState: {
        board: game.board,
        currentPlayerIndex: game.currentPlayerIndex,
        players: playerViews,
        pendingPlacements: isCurrentPlayer ? game.pendingPlacements : [],
        turnInProgress: game.turnInProgress,
        lastTurnScore: game.lastTurnScore,
        deckCount: game.deck.length,
        gamePhase: game.gamePhase,
      },
      hand: player.hand,
    }
  }

  getRoomState(code: string): RoomState | null {
    const room = this.rooms.get(code)
    if (!room) return null

    return {
      code: room.code,
      hostId: room.hostId,
      players: room.players,
      status: room.status,
      settings: room.settings,
    }
  }

  getRoomBySocket(socketId: string): string | null {
    const entries = Array.from(this.rooms.entries())
    for (let i = 0; i < entries.length; i++) {
      const [code, room] = entries[i]
      if (room.socketToPlayer.has(socketId)) return code
    }
    return null
  }

  getPlayerIdBySocket(code: string, socketId: string): string | null {
    return this.rooms.get(code)?.socketToPlayer.get(socketId) ?? null
  }

  // --- Helpers ---

  private getGameAndPlayer(code: string, socketId: string): { game: ServerGameState | null; playerId: string | null } {
    const room = this.rooms.get(code)
    if (!room?.game) return { game: null, playerId: null }
    const playerId = room.socketToPlayer.get(socketId) ?? null
    return { game: room.game, playerId }
  }

  // Cleanup stale rooms (call periodically)
  cleanup(maxAgeMs: number = 30 * 60 * 1000): void {
    const now = Date.now()
    const entries = Array.from(this.rooms.entries())
    for (let i = 0; i < entries.length; i++) {
      const [code, room] = entries[i]
      const allDisconnected = room.players.every((p: RoomPlayer) => !p.connected)
      const oldestSeen = Math.max(...room.players.map((p: RoomPlayer) => p.lastSeen))
      if (allDisconnected && now - oldestSeen > maxAgeMs) {
        this.rooms.delete(code)
      }
    }
  }
}
