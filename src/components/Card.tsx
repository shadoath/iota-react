import React from "react"
import { useDrag } from "react-dnd"
import { Paper } from "@mui/material"
import { CardType } from "../types"

const getShapeSvg = (shape: string) => {
  switch (shape) {
    case "circle":
      return <circle cx="50" cy="50" r="40" />
    case "square":
      return <rect x="10" y="10" width="80" height="80" />
    case "triangle":
      return <polygon points="50,10 90,90 10,90" />
    case "cross":
      return (
        <>
          <rect x="40" y="10" width="20" height="80" />
          <rect x="10" y="40" width="80" height="20" />
        </>
      )
    default:
      return null
  }
}

const Card = ({ shape, color, number }: CardType) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CARD",
    item: { shape, color, number },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const getRotateFromPosition = (position: string) => {
    switch (position) {
      case "top-left":
        return "0deg"
      case "top-right":
        return "90deg"
      case "bottom-left":
        return "270deg"
      case "bottom-right":
        return "180deg"
      default:
        return "0deg"
    }
  }
  const getEdgeSpacingFromPosition = (position: string) => {
    switch (position) {
      case "top-left":
        return { top: "4px", left: "4px" }
      case "top-right":
        return { top: "4px", right: "6px" }
      case "bottom-left":
        return { bottom: "4px", left: "6px" }
      case "bottom-right":
        return { bottom: "4px", right: "4px" }
      default:
        return {}
    }
  }

  return (
    <Paper
      ref={drag}
      style={{
        padding: "10px",
        textAlign: "center",
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: "white",
        border: `2px solid ${color}`,
        height: "100px",
        width: "100px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <svg height="100" width="100" style={{ fill: color }}>
        {getShapeSvg(shape)}
      </svg>
      {["top-left", "top-right", "bottom-left", "bottom-right"].map((position) => (
        <div
          key={position}
          style={{
            position: "absolute",
            ...getEdgeSpacingFromPosition(position),
            transform: `rotate(${getRotateFromPosition(position)})`,
            fontSize: "18px",
            color: color,
          }}
        >
          {number}
        </div>
      ))}
    </Paper>
  )
}

export default Card
