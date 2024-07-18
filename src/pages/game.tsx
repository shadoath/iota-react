import React, { useEffect, useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { GameProvider } from "../contexts/GameContext"
import GameBoard from "../components/GameBoard"
import Hand from "../components/Hand"
import ControlPanel from "../components/ControlPanel"
import { Grid } from "@mui/material"

export const initializeSettings = () => {
  let gridSize = 9
  let colors = 4
  let shapes = 4
  let numbers = 4
  if (typeof window !== "undefined") {
    gridSize = Number(localStorage.getItem("gridSize")) || 9
    colors = Number(localStorage.getItem("colors")) || 4
    shapes = Number(localStorage.getItem("shapes")) || 4
    numbers = Number(localStorage.getItem("numbers")) || 4
  }
  return { gridSize, colors, shapes, numbers }
}

const Game: React.FC = () => {
  const [isClient, setIsClient] = useState(false)
  const [settings, setSettings] = useState(initializeSettings())

  useEffect(() => {
    setIsClient(true)
    setSettings(initializeSettings())
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <GameProvider>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <GameBoard />
          </Grid>
          <Grid item xs={12}>
            <Hand />
          </Grid>
          <Grid item xs={12}>
            <ControlPanel />
          </Grid>
        </Grid>
      </GameProvider>
    </DndProvider>
  )
}

export default Game
