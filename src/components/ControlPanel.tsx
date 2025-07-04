// src/components/ControlPanel.tsx
import React from 'react'
import { Button } from '@mui/material'

interface ControlPanelProps {
  onEndTurn: () => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onEndTurn }) => {
  return (
    <div>
      <Button variant='contained' color='primary' onClick={onEndTurn}>
        End Turn
      </Button>
    </div>
  )
}

export default ControlPanel
