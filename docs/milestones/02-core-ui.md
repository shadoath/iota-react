# Milestone 2: Core UI Polish

> Cards should feel like cards. The board should feel like a table.

## Goals

- Redesign cards to be visually distinctive and satisfying
- Smooth drag-and-drop placement
- Board pan/zoom with touch support
- Responsive layout that works beautifully on phone, tablet, desktop
- Migrate from MUI inline styles to CSS Modules

## Tasks

### 2.1 Card Redesign

The current cards are black rectangles with colored SVG shapes. They work but don't delight.

**New card design:**
- White/cream card face with subtle rounded corners and shadow
- Shape fills the card center with bold, saturated colors
- Number shown as repeated shapes (e.g., 3 circles = three circles arranged)
- Subtle texture or grain on card surface
- Card back design for deck/opponent hands
- Wild card has a distinct rainbow/gradient treatment

Create `src/components/Card/Card.tsx` and `Card.module.css`:
- Props: `card`, `size`, `selected`, `disabled`, `faceDown`, `onClick`
- Sizes: `sm` (hand on mobile), `md` (hand on desktop), `lg` (board)
- CSS-only — no images needed for shapes (SVG stays, just polished)

### 2.2 Shape System

Formalize the shape rendering into a dedicated component:

Create `src/components/Card/shapes/`:
- `Triangle.tsx` — equilateral, filled
- `Square.tsx` — rounded corners, filled
- `Circle.tsx` — filled
- `Cross.tsx` — thick plus sign (not X), filled

Each shape takes `color` and `size`. The "number" on the card is represented by rendering 1-4 instances of the shape in a balanced layout.

### 2.3 Board Interaction: Pan & Zoom

Replace the current zoom buttons with proper pan/zoom:

- **Desktop**: Scroll to zoom, click-drag to pan (when no card selected)
- **Mobile**: Pinch to zoom, two-finger drag to pan
- **Keyboard**: +/- to zoom, arrow keys to pan

Implementation options:
- Use a lightweight library like `use-gesture` + CSS transforms
- Or build a custom `usePanZoom` hook with pointer events

The board is a CSS Grid positioned inside a transform container:
```
<div className={styles.viewport}>  ← clips overflow
  <div className={styles.board} style={{ transform }}>  ← pan/zoom applied here
    {cells}
  </div>
</div>
```

### 2.4 Card Placement: Drag & Drop

Allow cards to be dragged from hand to board (in addition to the current click-to-select, click-to-place flow):

- Use HTML Drag and Drop API or pointer events
- Show ghost card while dragging
- Valid positions highlight when dragging over them
- Snap to grid on drop
- Mobile: Long-press to pick up, drag to place
- Keep click-to-place as the primary method (it's faster for experienced players)

### 2.5 Layout Overhaul

**Desktop (>1024px):**
```
┌──────────────────────────────────┐
│  Score    │                      │
│  Info     │      Board           │
│  Menu     │      (pan/zoom)      │
│           │                      │
├───────────┴──────────────────────┤
│         Player Hand              │
└──────────────────────────────────┘
```

**Tablet (768-1024px):**
```
┌──────────────────┐
│   Score bar       │
├──────────────────┤
│                  │
│   Board          │
│   (pan/zoom)     │
│                  │
├──────────────────┤
│  Player Hand     │
└──────────────────┘
```

**Mobile (<768px):**
```
┌──────────────┐
│ Score (compact)│
├──────────────┤
│              │
│   Board      │
│              │
├──────────────┤
│ Hand (scroll)│
└──────────────┘
```

### 2.6 Migrate to CSS Modules

For each component, create a co-located `.module.css` file and remove MUI `sx` props:

- `Game.module.css`
- `Board.module.css`
- `Card.module.css`
- `Hand.module.css`
- `Sidebar.module.css`
- `ScoreDisplay.module.css`

Establish design tokens in `src/styles/tokens.css`:
```css
:root {
  --color-red: #ef4444;
  --color-green: #22c55e;
  --color-blue: #3b82f6;
  --color-yellow: #eab308;

  --color-bg: #f8f7f4;
  --color-surface: #ffffff;
  --color-text: #1a1a1a;
  --color-text-muted: #6b7280;

  --radius-card: 8px;
  --radius-button: 6px;

  --shadow-card: 0 2px 8px rgba(0,0,0,0.12);
  --shadow-card-hover: 0 4px 16px rgba(0,0,0,0.18);

  --z-board: 1;
  --z-hand: 10;
  --z-overlay: 100;
}
```

### 2.7 Animations

Add subtle, performance-friendly animations:

- **Card placement**: Scale from 0.8 → 1.0 with slight bounce
- **Score update**: Number counter animation (count up)
- **Turn completion**: Brief pulse on scored lines
- **Card draw**: Cards slide up from deck into hand
- **Invalid placement**: Shake animation on attempted invalid spot

Use CSS animations/transitions only — no animation libraries needed.

### 2.8 Sound Effects (Optional, Toggleable)

Simple, satisfying sounds:
- Card place: soft "thud"
- Turn complete: subtle "ding"
- Invalid move: quiet "bonk"
- Game over: celebratory tone

Use the Web Audio API with small audio sprites. Always off by default, toggle in settings.

## Definition of Done

- [ ] Cards are visually polished with shapes rendered at multiple counts
- [ ] Board supports pan and zoom via mouse/touch/keyboard
- [ ] Drag-and-drop works on desktop and mobile
- [ ] Layout is responsive across phone/tablet/desktop
- [ ] All styles use CSS Modules + design tokens (no MUI sx props in game UI)
- [ ] Placement and scoring animations feel smooth
- [ ] Lighthouse performance score 90+
