import React, { useState } from "react"
import {
  Button,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { useRouter } from "next/router"

const Settings = () => {
  const router = useRouter()
  const [gridSize, setGridSize] = useState<number>(5)
  const [colors, setColors] = useState<number>(4)
  const [shapes, setShapes] = useState<number>(4)
  const [numbers, setNumbers] = useState<number>(4)

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gridSize", gridSize.toString())
      localStorage.setItem("colors", colors.toString())
      localStorage.setItem("shapes", shapes.toString())
      localStorage.setItem("numbers", numbers.toString())
    }
    router.push("/")
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Grid Size</InputLabel>
        <Select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))}>
          {[5, 7, 9, 11].map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Number of Colors</InputLabel>
        <Select value={colors} onChange={(e) => setColors(Number(e.target.value))}>
          {[3, 4, 5, 6].map((num) => (
            <MenuItem key={num} value={num}>
              {num}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Number of Shapes</InputLabel>
        <Select value={shapes} onChange={(e) => setShapes(Number(e.target.value))}>
          {[3, 4, 5, 6].map((num) => (
            <MenuItem key={num} value={num}>
              {num}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Number of Numbers</InputLabel>
        <Select value={numbers} onChange={(e) => setNumbers(Number(e.target.value))}>
          {[3, 4, 5, 6].map((num) => (
            <MenuItem key={num} value={num}>
              {num}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        style={{ marginTop: "20px" }}
      >
        Save
      </Button>
    </Container>
  )
}

export default Settings
