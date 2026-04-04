/**
 * Shared protocol for multiplayer communication.
 * Used by both client and server.
 */

import type { Card, PlacedCard, PendingPlacement, GridPosition } from '../types/game'

// --- Room types ---

export interface RoomPlayer {
  id: string
  name: string
  connected: boolean
  lastSeen: number
}

export type RoomStatus = 'lobby' | 'playing' | 'ended'

export interface RoomSettings {
  maxPlayers: 2 | 3 | 4
  turnTimer: number | null // seconds, null = untimed
}

export interface RoomState {
  code: string
  hostId: string
  players: RoomPlayer[]
  status: RoomStatus
  settings: RoomSettings
}

// --- Game state sent to clients ---

export interface MultiplayerGameState {
  board: PlacedCard[]
  currentPlayerIndex: number
  players: MultiplayerPlayerView[]
  pendingPlacements: PendingPlacement[] // only current player sees their own
  turnInProgress: boolean
  lastTurnScore: number | null
  deckCount: number
  gamePhase: 'playing' | 'ended'
}

export interface MultiplayerPlayerView {
  id: string
  name: string
  cardCount: number // don't reveal actual cards
  score: number
  connected: boolean
}

// --- Client → Server events ---

export interface ClientToServerEvents {
  'room:create': (settings: RoomSettings, playerName: string, callback: (response: { ok: boolean; code?: string; error?: string }) => void) => void
  'room:join': (code: string, playerName: string, callback: (response: { ok: boolean; error?: string }) => void) => void
  'room:leave': () => void
  'game:start': () => void
  'game:place_card': (cardId: string, position: GridPosition) => void
  'game:complete_turn': () => void
  'game:undo': () => void
  'game:swap_cards': (cardIds: string[]) => void
}

// --- Server → Client events ---

export interface ServerToClientEvents {
  'room:state': (state: RoomState) => void
  'room:error': (message: string) => void
  'game:state': (state: MultiplayerGameState) => void
  'game:your_hand': (cards: Card[]) => void
  'game:error': (message: string) => void
  'game:ended': (state: MultiplayerGameState) => void
  'player:joined': (player: RoomPlayer) => void
  'player:left': (playerId: string) => void
  'player:disconnected': (playerId: string) => void
  'player:reconnected': (playerId: string) => void
}
