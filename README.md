# NodusNexus Card Game

A web-based strategic card game built with React, TypeScript, and Next.js.

## Game Overview

NodusNexus is a strategic card game played on a grid where players place cards to form lines. Each card has three attributes:
- **Number**: 1-4
- **Color**: Red, Green, Blue, or Yellow
- **Shape**: Triangle, Square, Circle, or Cross

## Game Rules

### Objective
Score points by placing cards to form lines where each attribute (number, color, shape) follows a consistent pattern.

### Core Rules
1. **Line Formation**: Cards form lines horizontally and vertically
2. **Attribute Rule**: In any line, each attribute must be either:
   - **All the SAME** across all cards, OR
   - **All DIFFERENT** across all cards
3. **Turn Rules**:
   - Play 1-4 cards per turn
   - All cards in a turn must be placed in the same row or column
   - Cards must be placed adjacent to existing cards
4. **Scoring**: Sum of all numbers in each line formed/extended by your placed cards
5. **Line Limit**: Maximum 4 cards per line

### Example Valid Lines
- Red Triangle 1, Red Triangle 2, Red Triangle 3 (same color & shape, different numbers)
- Blue Circle 2, Red Square 2, Yellow Triangle 2 (same number, all different colors & shapes)

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

## Features

- **Multiple Game Modes**: Classic, Practice (with hints), Timed
- **AI Opponents**: Three difficulty levels (Easy, Medium, Hard)
- **Multiplayer**: Online play via Socket.io rooms
- **Interactive Tutorial**: Step-by-step guide to learn the rules
- **Pattern Trainer**: Practice pattern recognition skills
- **Game Replay**: Watch turn-by-turn replays of completed games
- **Board Heatmap**: Visualize score potential across the board
- **Dark Mode**: System preference detection + manual toggle
- **Stats & Achievements**: Track your progress with 16 achievements
- **PWA**: Installable on any device
- **Accessible**: Keyboard navigation, screen reader support

## Built With

- **React** - UI framework
- **TypeScript** - Type safety
- **Next.js** - React framework
- **CSS Modules** - Scoped styling with design tokens
- **Socket.io** - Real-time multiplayer
- **Vitest** - Testing

## Development

```bash
npm run dev          # Development server
npm run dev:mp       # Development with multiplayer server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript checking
npm run test         # Run tests (watch mode)
npm run test:run     # Run tests once
```

## License

This project is licensed under the MIT License.
