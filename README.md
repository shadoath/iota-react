# Iota Card Game

A web-based implementation of the Iota card game built with React, TypeScript, Next.js, and Material-UI.

## 🎮 Game Overview

Iota is a strategic card game played on a grid where players place cards to form lines. Each card has three attributes:
- **Number**: 1-4
- **Color**: Red, Green, Blue, or Yellow
- **Shape**: Triangle, Square, Circle, or Cross

## 🎯 Game Rules

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
- ✅ Red Triangle 1, Red Triangle 2, Red Triangle 3 (same color & shape, different numbers)
- ✅ Blue Circle 2, Red Square 2, Yellow Triangle 2 (same number, all different colors & shapes)
- ❌ Red Triangle 1, Red Square 2, Blue Square 3 (invalid - colors neither all same nor all different)

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/iota-react.git
cd iota-react

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

## 🎨 Features

- **Interactive Grid**: Dynamic game board that expands as you play
- **Smart Validation**: Real-time feedback on valid/invalid placements
- **Detailed Error Messages**: Explains exactly why a placement is invalid
- **Visual Indicators**:
  - Green squares for valid placements
  - Dark gray circles for impossible positions
  - Pending points display
- **Zoom Controls**: Zoom in/out to see more of the board
- **Turn Management**: Complete Turn and Undo buttons
- **Score Tracking**: Live score updates with pending points
- **Toast Notifications**: Non-intrusive game feedback

## 🛠️ Built With

- **React** - UI framework
- **TypeScript** - Type safety
- **Next.js** - React framework
- **Material-UI** - Component library
- **react-hot-toast** - Toast notifications

## 📁 Project Structure

```
src/
├── components/
│   ├── Game.tsx          # Main game component
│   ├── BoardComponent.tsx # Game board grid
│   ├── GameCard.tsx      # Individual card component
│   ├── PlayerHand.tsx    # Player's hand display
│   └── Sidebar.tsx       # Game menu sidebar
├── types/
│   └── game.ts          # TypeScript interfaces
└── utils/
    ├── gameLogic.ts      # Core game mechanics
    ├── turnValidation.ts # Turn validation rules
    ├── validationMessages.ts # Error message generation
    └── impossibleSquares.ts  # Invalid position detection
```

## 🎮 How to Play

1. **Select a Card**: Click a card from your hand at the bottom
2. **Place the Card**: Click a green square on the board
3. **Build Lines**: Place 1-4 cards in the same row/column
4. **Complete Turn**: Click "Complete Turn" to score and draw new cards
5. **Strategic Tips**:
   - Look for intersections where you can score in multiple directions
   - Watch for impossible positions (gray circles)
   - Plan multi-card turns for maximum points

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📱 Deployment

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy with default Next.js settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by the original Iota card game by Gamewright
- Built with Next.js create-next-app template