import { describe, it, expect } from "vitest";
import { Grid } from "./Grid";
import { findPath } from "./AStar";

describe("findPath", () => {
  it("finds path when start cell is reserved by the moving unit itself", () => {
    // Grid: 25 cols × 19 rows (matches GRID_COLS × GRID_ROWS)
    const grid = new Grid(25, 19);

    // Unit at {24, 1} reserves its own cell (simulates Unit spawn reservation)
    const fakeUnit = {} as any;
    grid.reserveCell(24, 1, fakeUnit);

    // Another unit occupies {23, 0}
    grid.getCell(23, 0)!.setOccupying({} as any);

    const start = { col: 24, row: 1 };
    const goal = { col: 20, row: 1 };

    const path = findPath(grid, start, goal);

    // Path must be found — there's a clear route via {23, 1} → {22, 1} → ... → {20, 1}
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);

    // Path should end at the goal
    const last = path![path!.length - 1];
    expect(last).toEqual(goal);
  });

  it("finds path on open grid with no obstacles", () => {
    const grid = new Grid(25, 19);

    const path = findPath(grid, { col: 24, row: 1 }, { col: 20, row: 1 });

    expect(path).not.toBeNull();
    expect(path![path!.length - 1]).toEqual({ col: 20, row: 1 });
  });

  it("finds path when start is reserved but not at grid edge", () => {
    const grid = new Grid(25, 19);

    const fakeUnit = {} as any;
    grid.reserveCell(10, 10, fakeUnit);

    const path = findPath(grid, { col: 10, row: 10 }, { col: 5, row: 10 });

    expect(path).not.toBeNull();
    expect(path![path!.length - 1]).toEqual({ col: 5, row: 10 });
  });
});
