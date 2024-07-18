// components/ControlPanel.tsx
import React from "react"
import { Button } from "@mui/material"
import { useGameContext } from "../contexts/GameContext"

const ControlPanel: React.FC = () => {
  const { dispatch } = useGameContext()

  const endTurn = () => {
    dispatch({ type: "END_TURN" })
  }

  return (
    <div>
      <Button variant="contained" color="primary" onClick={endTurn}>
        End Turn
      </Button>
    </div>
  )
}

export default ControlPanel
