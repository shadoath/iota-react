import { Game } from "../src/components/Game"
import { ErrorBoundary } from "../src/components/ErrorBoundary"

export default function Home() {
  return (
    <ErrorBoundary>
      <Game />
    </ErrorBoundary>
  )
}
