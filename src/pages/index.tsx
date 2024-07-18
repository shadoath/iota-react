import React from "react"
import { Button, Container, Typography } from "@mui/material"
import { useRouter } from "next/router"

const Menu: React.FC = () => {
  const router = useRouter()

  const handleStartGame = () => {
    router.push("/game")
  }

  const handleSettings = () => {
    router.push("/settings")
  }

  return (
    <Container>
      <Typography variant="h2" gutterBottom>
        Iota Game
      </Typography>
      <Button variant="contained" color="primary" onClick={handleStartGame}>
        Start Game
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleSettings}
        style={{ marginLeft: "10px" }}
      >
        Settings
      </Button>
    </Container>
  )
}

export default Menu
