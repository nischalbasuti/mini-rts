# AGENTS.md

Mini-RTS — a 2D real-time strategy game in TypeScript, rendered with [Kontra](https://straker.github.io/kontra/) on a single HTML canvas and bundled with Vite.

This file is for coding agents. For the human-facing roadmap see `readme.md`.

## Setup

```bash
npm install
```

Requires Node ≥ 18. No other system dependencies.

## Commands

| Purpose | Command |
| --- | --- |
| Dev server (HMR) | `npm run dev` |
| Typecheck + production build | `npm run build` |
| Preview built bundle | `npm run preview` |
| Run tests | `npx vitest run` (watch: `npx vitest`) |

There is no lint/format step configured. `npm run build` runs `tsc` first, so any type error blocks the build — rely on that as the CI-style check.

## Project layout

```
index.html              Canvas + resource/selection UI, inline CSS
src/
  main.ts               Entry: Kontra init, asset load, game loop, input handlers
  GameState.ts          Singleton — players, resources, grid, selection, per-frame update
  Renderer.ts           Draw order, debug overlay, grid lines, action vectors
  Spawner.ts            Factories for units, buildings, resources (snaps to free cells)
  Player.ts             Name, color, owned units/buildings, wood/gold counters
  gameObjects/
    units/Unit.ts       Abstract base: movement, attack, re-path, selection ring
    units/InfantryUnit.ts, VillagerUnit.ts
    units/UnitAction.ts Discriminated union: move | attack | gather
    buildings/ProductionBuilding.ts
    resources/TreeResource.ts, GoldResource.ts
  pathing/
    Grid.ts             Cell grid, reservations, obstacle footprints, neighbor lookup
    AStar.ts            Octile-heuristic A* with corner-cutting prevention
    AStar.test.ts       Vitest suite for the pather
    GroupMovement.ts    Group destination assignment around a click or target
  assets/               PNG sprite sheets (32×32 frames, 64×64 for the castle)
```

## Architecture

**Entity pattern.** Every game entity is a plain TS class that owns a Kontra `Sprite` (or `GameObject`) as `gameObject`. The wrapper holds gameplay state (hp, action, player); the sprite handles animation/rendering. When touching entities, mutate the wrapper — never reach into `gameObject` for logic.

**Singletons.** `GameState.getInstance(canvas?)` is the canonical accessor. First call must pass the canvas; subsequent calls ignore it. `window.gameState` is exposed for debugging. `Renderer` and `Spawner` are constructed once in `main.ts` and passed the `GameState`.

**Game loop.** Kontra `GameLoop` calls `gameState.update()` then `renderer.render()`. `update()` iterates all players' units/buildings plus resources, then sweeps dead/depleted entities (HP ≤ 0 or quantity ≤ 0) by calling `dispose(gameState)` and splicing them out.

**Units.** `Unit` is abstract. Subclasses set static `BASE_*` stats and a `SPRITE_SHEET`. Animation states live in `Unit.AnimationStates` (`idle`, `moving`, `attacking`, `gathering`). A unit has at most one `currentAction`; `move` clears itself when the path ends, `attack`/`gather` persist until the target dies/depletes or moves out of reach. Re-pathing while chasing is rate-limited by `Unit.REPATH_INTERVAL`; attack/gather ticks by `Unit.ACTION_TICK_INTERVAL`.

**Pathing.**
- World is a `GRID_COLS × GRID_ROWS` grid of `CELL_SIZE = 32` px cells (see `pathing/Grid.ts`).
- `Cell` can be *occupied* (buildings, resources — via `registerObstacle`) or *reserved* (units claiming their destination — via `reserveCell`). `isWalkable` rejects both.
- `findPath` treats the start cell as walkable (a unit is always allowed to leave where it stands) and snaps unwalkable goals to the nearest walkable cell.
- Group moves use `assignGroupDestinations` (BFS outward from click) or `findAdjacentWalkableCells` + `assignClosestCells` (ring around a target footprint) so units don't stack.

**Input.** All mouse handling lives in `main.ts`:
- Left-click empty space → clear selection. Left-click on a unit/building → Kontra's `onDown` on the sprite selects it.
- Left-drag → marquee box; units inside the box get selected on `mouseup`.
- Double-click a unit → select all units of that type owned by the same player.
- Right-click → `handleRightClick` dispatches to move / gather / attack-unit / attack-building based on the clicked cell's occupant.
- Key `g` toggles `gameState.debugMode` (draws unwalkable cells red, reserved cells yellow).

**Rendering order** (in `Renderer.render`): trees → gold → buildings → units (with selection rings, path queues, action vectors) → debug overlay → grid lines. The marquee sprite is drawn separately from `main.ts` after `renderer.render()`.

## Conventions

- **Anchors.** All sprites use `anchor: { x: 0.5, y: 0.5 }`. Footprint math in `Grid.ts` assumes center-anchored rects.
- **Units for positions.** Pixels for rendering/velocity; grid `{col, row}` for pathing and reservation. Convert with `pixelToGrid` / `gridToPixel`.
- **Sprite sheets.** 32×32 frames, scaled on the sprite via `scaleX`/`scaleY`. Castle is 64×64. Animations are defined in `main.ts` after asset load, then assigned to `ClassName.SPRITE_SHEET` before `main()` runs.
- **Reservations must be cleaned up.** `Unit.setPath` calls `grid.unreserveCellsForUnit(this)` before reserving the new destination; `Unit.dispose` does the same. If you introduce a new code path that reassigns a destination, preserve this invariant or units will leave ghost reservations that block other pathing.
- **Selection.** `GameState.selection: Set<Selectable>`. Always mirror membership with `entity.isSelected`. Use `clearSelection()` — it resets the flag on every current member.
- **Discriminated unions.** `UnitAction` is the pattern — prefer this over boolean flags when adding new unit states.
- **No tests outside `pathing/`.** If you add tests, keep them colocated (`*.test.ts`) and runnable via `npx vitest`.

## Gotchas

- `GameState` depends on the canvas existing. Tests that import it transitively will throw unless they avoid calling `getInstance()` — `AStar.test.ts` works around this by constructing `Grid` directly.
- `vite-plugin-pwa` is in `devDependencies` but not wired into `vite.config` (there is no config file). Safe to ignore unless you're adding PWA support.
- `ProductionBuilding.wayPoint` is the rally point for newly spawned units; right-clicking with a building selected moves this waypoint rather than issuing a move order.
- `Unit.onTakeDamage` auto-retaliates if idle and in range — keep this in mind when scripting scenarios or writing tests that deal damage.
