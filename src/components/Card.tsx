import React from "react"
import { useDrag } from "react-dnd"
import { Paper } from "@mui/material"
import { CardType } from "../types"

const getShapeSvg = (shape: string) => {
  switch (shape) {
    case "circle":
      return <circle cx="25" cy="25" r="20" />
    case "square":
      return <rect x="5" y="5" width="40" height="40" />
    case "triangle":
      return <polygon points="25,5 45,45 5,45" />
    case "cross":
      return (
        <>
          <rect x="20" y="5" width="10" height="40" />
          <rect x="5" y="20" width="40" height="10" />
        </>
      )
    case "star":
      return <polygon points="25,5 30,20 45,20 33,30 37,45 25,35 13,45 17,30 5,20 20,20" />
    case "hexagon":
      return <polygon points="25,5 40,15 40,35 25,45 10,35 10,15" />
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
        height: "80px",
        width: "80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <svg height="50" width="50" style={{ fill: color }}>
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
