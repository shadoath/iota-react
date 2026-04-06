"use client"

import React, { useState, useCallback } from "react"
import type { RoomState } from "../multiplayer/protocol"
import type { UseSocketReturn } from "../multiplayer/useSocket"
import styles from "./Lobby.module.css"

interface LobbyProps {
  socket: UseSocketReturn
  onBack: () => void
}

export const Lobby: React.FC<LobbyProps> = ({ socket, onBack }) => {
  const [tab, setTab] = useState<"create" | "join">("create")
  const [playerName, setPlayerName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [maxPlayers, setMaxPlayers] = useState<2 | 3 | 4>(2)
  const [loading, setLoading] = useState(false)

  const { connected, roomState, error } = socket

  const handleCreate = useCallback(async () => {
    if (!playerName.trim()) return
    setLoading(true)
    await socket.createRoom(maxPlayers, null, playerName.trim())
    setLoading(false)
  }, [socket, maxPlayers, playerName])

  const handleJoin = useCallback(async () => {
    if (!playerName.trim() || !joinCode.trim()) return
    setLoading(true)
    await socket.joinRoom(joinCode.trim().toUpperCase(), playerName.trim())
    setLoading(false)
  }, [socket, joinCode, playerName])

  const handleCopyCode = useCallback(() => {
    if (roomState?.code) {
      navigator.clipboard?.writeText(roomState.code)
    }
  }, [roomState])

  // If in a room, show the lobby view
  if (roomState) {
    return (
      <LobbyRoom
        roomState={roomState}
        socket={socket}
        onLeave={() => {
          socket.leaveRoom()
        }}
      />
    )
  }

  // Create / Join form
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Multiplayer</h1>

        <div className={styles.connectionStatus}>
          <span
            className={styles.playerDot}
            style={{ background: connected ? "var(--color-success)" : "var(--color-error)" }}
          />
          {connected ? "Connected" : "Connecting..."}
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "create" ? styles.tabActive : ""}`}
            onClick={() => setTab("create")}
          >
            Create Room
          </button>
          <button
            className={`${styles.tab} ${tab === "join" ? styles.tabActive : ""}`}
            onClick={() => setTab("join")}
          >
            Join Room
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Your Name</label>
          <input
            className={styles.input}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            maxLength={16}
          />
        </div>

        {tab === "create" && (
          <>
            <div className={styles.field}>
              <label className={styles.label}>Max Players</label>
              <div className={styles.playerCountRow}>
                {([2, 3, 4] as const).map((n) => (
                  <button
                    key={n}
                    className={`${styles.countBtn} ${maxPlayers === n ? styles.countBtnActive : ""}`}
                    onClick={() => setMaxPlayers(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button
              className={styles.primaryBtn}
              onClick={handleCreate}
              disabled={!connected || !playerName.trim() || loading}
            >
              {loading ? "Creating..." : "Create Room"}
            </button>
          </>
        )}

        {tab === "join" && (
          <>
            <div className={styles.field}>
              <label className={styles.label}>Room Code</label>
              <input
                className={`${styles.input} ${styles.codeInput}`}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
              />
            </div>
            <button
              className={styles.primaryBtn}
              onClick={handleJoin}
              disabled={!connected || !playerName.trim() || joinCode.length < 6 || loading}
            >
              {loading ? "Joining..." : "Join Room"}
            </button>
          </>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <button className={styles.secondaryBtn} onClick={onBack}>
          Back to Menu
        </button>
      </div>
    </div>
  )
}

// --- Room lobby (waiting for players, host can start) ---

interface LobbyRoomProps {
  roomState: RoomState
  socket: UseSocketReturn
  onLeave: () => void
}

function LobbyRoom({ roomState, socket, onLeave }: LobbyRoomProps) {
  const isHost = roomState.players[0]?.connected // simplification: first connected player

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Room Lobby</h2>

        <div
          className={styles.roomCode}
          onClick={() => navigator.clipboard?.writeText(roomState.code)}
          title="Click to copy"
        >
          {roomState.code}
        </div>
        <p className={styles.copyHint}>Share this code with friends (click to copy)</p>

        <div className={styles.divider} />

        <div className={styles.field}>
          <label className={styles.label}>
            Players ({roomState.players.length}/{roomState.settings.maxPlayers})
          </label>
          <div className={styles.playerList}>
            {roomState.players.map((player, index) => (
              <div key={player.id} className={styles.playerItem}>
                <span
                  className={`${styles.playerDot} ${player.connected ? styles.dotConnected : styles.dotDisconnected}`}
                />
                <span className={styles.playerItemName}>{player.name}</span>
                {index === 0 && <span className={styles.hostBadge}>HOST</span>}
              </div>
            ))}
          </div>
        </div>

        {roomState.players.length < roomState.settings.maxPlayers && (
          <p className={styles.waitingDots}>Waiting for players...</p>
        )}

        {roomState.status === "lobby" && (
          <button
            className={styles.primaryBtn}
            onClick={() => socket.startGame()}
            disabled={roomState.players.length < 2}
          >
            {roomState.players.length < 2
              ? "Need at least 2 players"
              : `Start Game (${roomState.players.length} players)`}
          </button>
        )}

        <button className={styles.secondaryBtn} onClick={onLeave}>
          Leave Room
        </button>
      </div>
    </div>
  )
}
