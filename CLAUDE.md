# CLAUDE.md

Mini-RTS: 2D real-time strategy game (TypeScript, Vite, Kontra).

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Compile + build
npm run preview  # Preview build
```

## Architecture

**Entry:** `main.ts` → Kontra init, sprite sheets, input handlers, game loop.

**Core singletons:**
- `GameState` — players, resources, selection, entity updates
- `Renderer` — draw all entities in order
- `Spawner` — create and register units/buildings/resources

**Entities:** Wrapper class + Kontra `Sprite` (logic + rendering).

**Units:** `Unit` base class → `InfantryUnit`, `VillagerUnit`. States: idle, moving, attacking. Direct point-to-point movement with velocity vectors.

**Input:** Left-click (select), left-drag (marquee), right-click (waypoint).

**Pathing:** `src/pathing/Grid.ts` (grid structure), `AStar.ts` (A* search).

**Sprites:** 32×32 frames, scaled 2×. Animations in `main.ts`.
