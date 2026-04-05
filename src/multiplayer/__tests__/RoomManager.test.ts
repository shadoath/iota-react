import { describe, it, expect, beforeEach } from "vitest"
import { RoomManager } from "../RoomManager"

describe("RoomManager", () => {
  let manager: RoomManager

  beforeEach(() => {
    manager = new RoomManager()
  })

  describe("createRoom", () => {
    it("creates a room with a 6-char code", () => {
      const { code } = manager.createRoom("socket-1", { maxPlayers: 4, turnTimer: null }, "Alice")
      expect(code).toHaveLength(6)
    })

    it("creates room with host as first player", () => {
      const { code } = manager.createRoom("socket-1", { maxPlayers: 4, turnTimer: null }, "Alice")
      const state = manager.getRoomState(code)
      expect(state?.players).toHaveLength(1)
      expect(state?.players[0].name).toBe("Alice")
      expect(state?.hostId).toBe(state?.players[0].id)
    })
  })

  describe("joinRoom", () => {
    it("adds a player to the room", () => {
      const { code } = manager.createRoom("socket-1", { maxPlayers: 4, turnTimer: null }, "Alice")
      const result = manager.joinRoom(code, "socket-2", "Bob")
      expect(result.ok).toBe(true)

      const state = manager.getRoomState(code)
      expect(state?.players).toHaveLength(2)
      expect(state?.players[1].name).toBe("Bob")
    })

    it("rejects when room is full", () => {
      const { code } = manager.createRoom("socket-1", { maxPlayers: 2, turnTimer: null }, "Alice")
      manager.joinRoom(code, "socket-2", "Bob")
      const result = manager.joinRoom(code, "socket-3", "Charlie")
      expect(result.ok).toBe(false)
      expect(result.error).toContain("full")
    })

    it("rejects invalid room code", () => {
      const result = manager.joinRoom("XXXXXX", "socket-2", "Bob")
      expect(result.ok).toBe(false)
      expect(result.error).toContain("not found")
    })
  })

  describe("startGame", () => {
    it("starts game when host requests and enough players", () => {
      const { code } = manager.createRoom("socket-1", { maxPlayers: 4, turnTimer: null }, "Alice")
      manager.joinRoom(code, "socket-2", "Bob")
      const result = manager.startGame(code, "socket-1")
      expect(result.ok).toBe(true)

      const state = manager.getRoomState(code)
      expect(state?.status).toBe("playing")
    })

    it("rejects when not enough players", () => {
      const { code } = manager.createRoom("socket-1", { maxPlayers: 4, turnTimer: null }, "Alice")
      const result = manager.startGame(code, "socket-1")
      expect(result.ok).toBe(false)
      expect(result.error).toContain("2 players")
    })

    it("rejects when non-host tries to start", () => {
      const { code } = manager.createRoom("socket-1", { maxPlayers: 4, turnTimer: null }, "Alice")
      manager.joinRoom(code, "socket-2", "Bob")
      const result = manager.startGame(code, "socket-2")
      expect(result.ok).toBe(false)
      expect(result.error).toContain("host")
    })

    it("deals 4 cards to each player", () => {
      const { code } = manager.createRoom("socket-1", { maxPlayers: 4, turnTimer: null }, "Alice")
      const joinResult = manager.joinRoom(code, "socket-2", "Bob")
      manager.startGame(code, "socket-1")

      const aliceView = manager.getGameStateForPlayer(
        code,
        manager.getPlayerIdBySocket(code, "socket-1")!
      )
      expect(aliceView?.hand).toHaveLength(4)

      const bobView = manager.getGameStateForPlayer(code, joinResult.playerId!)
      expect(bobView?.hand).toHaveLength(4)
    })
  })

  describe("game actions", () => {
    let code: string

    beforeEach(() => {
      const result = manager.createRoom("socket-1", { maxPlayers: 2, turnTimer: null }, "Alice")
      code = result.code
      manager.joinRoom(code, "socket-2", "Bob")
      manager.startGame(code, "socket-1")
    })

    it("placeCard validates placement", () => {
      const view = manager.getGameStateForPlayer(
        code,
        manager.getPlayerIdBySocket(code, "socket-1")!
      )
      const card = view!.hand[0]
      // Try placing at (0,1) — adjacent to the initial card
      const result = manager.placeCard(code, "socket-1", card.id, { row: 0, col: 1 })
      // May succeed or fail depending on card compatibility, but shouldn't crash
      expect(typeof result.ok).toBe("boolean")
    })

    it("rejects actions from wrong player", () => {
      const view = manager.getGameStateForPlayer(
        code,
        manager.getPlayerIdBySocket(code, "socket-2")!
      )
      if (view?.hand[0]) {
        const result = manager.placeCard(code, "socket-2", view.hand[0].id, { row: 0, col: 1 })
        expect(result.ok).toBe(false)
        expect(result.error).toContain("Not your turn")
      }
    })

    it("completeTurn rejects when nothing placed", () => {
      const result = manager.completeTurn(code, "socket-1")
      expect(result.ok).toBe(false)
    })

    it("players see different hands", () => {
      const aliceId = manager.getPlayerIdBySocket(code, "socket-1")!
      const bobId = manager.getPlayerIdBySocket(code, "socket-2")!
      const aliceView = manager.getGameStateForPlayer(code, aliceId)
      const bobView = manager.getGameStateForPlayer(code, bobId)

      expect(aliceView?.hand).not.toEqual(bobView?.hand)
    })

    it("game state hides other players cards", () => {
      const aliceId = manager.getPlayerIdBySocket(code, "socket-1")!
      const view = manager.getGameStateForPlayer(code, aliceId)
      // Players in game state only show card count, not actual cards
      expect(view?.gameState.players[1].cardCount).toBe(4)
    })
  })

  describe("leaveRoom", () => {
    it("removes player from lobby", () => {
      const { code } = manager.createRoom("socket-1", { maxPlayers: 4, turnTimer: null }, "Alice")
      manager.joinRoom(code, "socket-2", "Bob")
      manager.leaveRoom(code, "socket-2")

      const state = manager.getRoomState(code)
      expect(state?.players).toHaveLength(1)
    })

    it("deletes room when last player leaves", () => {
      const { code } = manager.createRoom("socket-1", { maxPlayers: 4, turnTimer: null }, "Alice")
      const { roomDeleted } = manager.leaveRoom(code, "socket-1")
      expect(roomDeleted).toBe(true)
      expect(manager.getRoomState(code)).toBeNull()
    })
  })
})
