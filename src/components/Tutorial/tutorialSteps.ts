import type { Card, PlacedCard } from "../../types/game"

export interface TutorialStep {
  title: string
  description: string
  board: PlacedCard[]
  hand: Card[]
  /** Position the player must place a card at (null = no placement required) */
  targetPosition: { row: number; col: number } | null
  /** Card index in hand that should be placed (null = any) */
  targetCardIndex: number | null
  highlight?: string
}

function card(
  number: Card["number"],
  color: Card["color"],
  shape: Card["shape"],
  id: string
): Card {
  return { id, number, color, shape }
}

function placed(c: Card, row: number, col: number): PlacedCard {
  return { card: c, position: { row, col } }
}

export const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to NodusNexus!",
    description:
      "NodusNexus is a card game where every card has three attributes: a color, a shape, and a number (1-4). The goal is to score points by placing cards on the board.",
    board: [placed(card(2, "red", "triangle", "demo-1"), 0, 0)],
    hand: [
      card(3, "blue", "circle", "hand-1"),
      card(1, "green", "square", "hand-2"),
      card(4, "yellow", "cross", "hand-3"),
      card(2, "red", "square", "hand-4"),
    ],
    targetPosition: null,
    targetCardIndex: null,
  },
  {
    title: "Placing Cards",
    description:
      "Cards must be placed adjacent to an existing card (up, down, left, or right — not diagonal). Try placing the red square next to the red triangle.",
    board: [placed(card(2, "red", "triangle", "board-1"), 0, 0)],
    hand: [card(2, "red", "square", "hand-1")],
    targetPosition: { row: 0, col: 1 },
    targetCardIndex: 0,
    highlight: "adjacency",
  },
  {
    title: "The Line Rule",
    description:
      "When cards form a line, each attribute must be either ALL THE SAME or ALL DIFFERENT across the line. These two cards share the same color (red) and number (2), but have different shapes — that's valid!",
    board: [
      placed(card(2, "red", "triangle", "board-1"), 0, 0),
      placed(card(2, "red", "square", "board-2"), 0, 1),
    ],
    hand: [card(2, "red", "circle", "hand-1")],
    targetPosition: { row: 0, col: 2 },
    targetCardIndex: 0,
    highlight: "line-rule",
  },
  {
    title: "All Different",
    description:
      "Lines can also have ALL DIFFERENT values for an attribute. Place the blue square below to create a vertical line where colors are all different.",
    board: [
      placed(card(1, "red", "square", "board-1"), 0, 0),
      placed(card(1, "green", "square", "board-2"), 1, 0),
    ],
    hand: [card(1, "blue", "square", "hand-1")],
    targetPosition: { row: 2, col: 0 },
    targetCardIndex: 0,
    highlight: "all-different",
  },
  {
    title: "Scoring",
    description:
      'Your score for a turn equals the sum of all card numbers in lines you form or extend. Placing a "3" next to a "1" creates a line worth 1+3 = 4 points. Higher numbers score more!',
    board: [placed(card(1, "red", "triangle", "board-1"), 0, 0)],
    hand: [card(3, "red", "triangle", "hand-1")],
    targetPosition: { row: 0, col: 1 },
    targetCardIndex: 0,
    highlight: "scoring",
  },
  {
    title: "Multiple Cards Per Turn",
    description:
      "You can place up to 4 cards in a single turn — but they must all go in the same row or column. More cards in a turn means bigger scores!",
    board: [placed(card(1, "red", "triangle", "board-1"), 0, 0)],
    hand: [card(2, "green", "square", "hand-1"), card(3, "blue", "circle", "hand-2")],
    targetPosition: null,
    targetCardIndex: null,
  },
  {
    title: "You're Ready!",
    description:
      "That's everything you need to start playing. Wild cards can match any attribute. The game ends when the deck runs out. Highest score wins!",
    board: [
      placed(card(1, "red", "triangle", "board-1"), 0, 0),
      placed(card(2, "green", "square", "board-2"), 0, 1),
      placed(card(3, "blue", "circle", "board-3"), 0, 2),
    ],
    hand: [],
    targetPosition: null,
    targetCardIndex: null,
  },
]
