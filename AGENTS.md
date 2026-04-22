# AGENTS.md

Respond directly. Do not use thinking/reasoning mode.

Mini-RTS — 2D TypeScript RTS on [Kontra](https://straker.github.io/kontra/), single canvas, Vite. Human roadmap: `readme.md`.

## Commands

- `npm run dev` — dev server (HMR)
- `npm run build` — `tsc` + production build; type errors block (this is the lint step)
- `npx vitest run` — tests (watch: `npx vitest`)

## Layout

- `main.ts` — entry: Kontra init, asset load, animation wiring, all input handlers
- `GameState` — singleton; `getInstance(canvas?)` first call must pass canvas. `window.gameState` exposed for debug
- `Renderer`, `Spawner` — constructed once in `main.ts`
- `gameObjects/{units,buildings,resources}/` — each entity wraps a Kontra `Sprite` as `gameObject`. Mutate the wrapper for logic; the sprite is for render/animation only
- `pathing/` — `Grid` (32px cells, obstacles + reservations), `AStar` (octile, no corner-cutting), `GroupMovement`. Tests colocated as `*.test.ts`

## Invariants

- **Reservations.** `Unit.setPath` and `Unit.dispose` must call `grid.unreserveCellsForUnit(this)` before reassigning — else ghost reservations block other pathing. Preserve this in any new code path that reassigns a destination.
- **Selection.** `GameState.selection: Set<Selectable>`; always mirror `entity.isSelected`. Use `clearSelection()` (resets the flag on every member).
- **Anchors.** All sprites `anchor: {x:0.5, y:0.5}`; `Grid.ts` footprint math assumes this.
- **Coords.** Pixels for render/velocity, `{col,row}` for pathing. Convert with `pixelToGrid` / `gridToPixel`.
- **Unit actions.** `UnitAction` is a discriminated union (`move | attack | gather`); prefer over boolean flags. `move` self-clears at path end; `attack`/`gather` persist until target dies/depletes/moves out of reach. Re-path rate-limited by `Unit.REPATH_INTERVAL`, ticks by `Unit.ACTION_TICK_INTERVAL`.

## Gotchas

- `GameState.getInstance()` requires a canvas; tests that transitively import it throw. `AStar.test.ts` works around this by constructing `Grid` directly.
- `findPath` treats the start cell as walkable and snaps unwalkable goals to the nearest walkable cell.
- `ProductionBuilding.wayPoint`: right-click with a building selected moves the rally point, not a move order.
- `Unit.onTakeDamage` auto-retaliates if idle and in range.
- Key `g` toggles `gameState.debugMode` (unwalkable cells red, reserved yellow).
