import { ProductionBuilding } from "../gameObjects/buildings/ProductionBuilding";
import { GoldResource } from "../gameObjects/resources/GoldResource";
import { TreeResource } from "../gameObjects/resources/TreeResource";
import { Unit } from "../gameObjects/units/Unit";

export const CELL_SIZE = 32;
export const GRID_COLS = 25;
export const GRID_ROWS = 19;

type CellOccupant = Unit | ProductionBuilding | TreeResource | GoldResource | undefined;

export class Cell {
  private objectOccupying?: (CellOccupant);

  get walkable(): boolean {
    return this.objectOccupying === undefined;
  }

  setOccupying(object: CellOccupant) {
    // Allow overwrite — resources cluster and share cells
    this.objectOccupying = object;
  }

  replaceOccupying(object: CellOccupant) {
    this.objectOccupying = object;
  }

  getOccupying(): CellOccupant {
    return this.objectOccupying;
  }

  removeOccupying() {
    return this.objectOccupying = undefined;
  }
}

export interface GridPoint {
  col: number;
  row: number;
}

export function pixelToGrid(px: number, py: number): GridPoint {
  return {
    col: Math.floor(px / CELL_SIZE),
    row: Math.floor(py / CELL_SIZE),
  };
}

export function gridToPixel(col: number, row: number): { x: number; y: number } {
  return {
    x: col * CELL_SIZE + CELL_SIZE / 2,
    y: row * CELL_SIZE + CELL_SIZE / 2,
  };
}

export class Grid {
  width: number;
  height: number;
  cells: Cell[][];
  private reservedCells: Map<string, Unit> = new Map();

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cells = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => new Cell())
    );
  }

  isInBounds(col: number, row: number): boolean {
    return col >= 0 && col < this.width && row >= 0 && row < this.height;
  }

  getCell(col: number, row: number): Cell | null {
    if (!this.isInBounds(col, row)) return null;
    return this.cells[row][col];
  }

  isWalkable(col: number, row: number): boolean {
    if (!this.isInBounds(col, row)) return false;
    if (this.reservedCells.has(`${col},${row}`)) return false;
    return this.cells[row][col].walkable;
  }

  reserveCell(col: number, row: number, unit: Unit) {
    this.reservedCells.set(`${col},${row}`, unit);
  }

  unreserveCell(col: number, row: number) {
    this.reservedCells.delete(`${col},${row}`);
  }

  unreserveCellsForUnit(unit: Unit) {
    for (const [key, reservedUnit] of this.reservedCells) {
      if (reservedUnit === unit) {
        this.reservedCells.delete(key);
      }
    }
  }

  isCellReserved(col: number, row: number): boolean {
    return this.reservedCells.has(`${col},${row}`);
  }

  getReservedCells(): Map<string, Unit> {
    return this.reservedCells;
  }

  getNeighbors(col: number, row: number): GridPoint[] {
    const neighbors: GridPoint[] = [];

    // Cardinal directions
    const cardinals: [number, number][] = [
      [0, -1], [1, 0], [0, 1], [-1, 0],
    ];
    for (const [dc, dr] of cardinals) {
      const nc = col + dc;
      const nr = row + dr;
      if (this.isWalkable(nc, nr)) {
        neighbors.push({ col: nc, row: nr });
      }
    }

    // Diagonal: only if both adjacent cardinals are walkable (prevents corner-cutting)
    const diagPairs: [number, number, [number, number], [number, number]][] = [
      [-1, -1, [-1, 0], [0, -1]],
      [1, -1, [1, 0], [0, -1]],
      [1, 1, [1, 0], [0, 1]],
      [-1, 1, [-1, 0], [0, 1]],
    ];

    for (const [dc, dr, [ac1, ar1], [ac2, ar2]] of diagPairs) {
      const nc = col + dc;
      const nr = row + dr;
      if (
        this.isWalkable(nc, nr) &&
        this.isWalkable(col + ac1, row + ar1) &&
        this.isWalkable(col + ac2, row + ar2)
      ) {
        neighbors.push({ col: nc, row: nr });
      }
    }

    return neighbors;
  }

  registerObstacle(
    entity: CellOccupant,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
  ) {
    // Convert pixel rect (center-anchored) to grid cells
    const left = centerX - width / 2;
    const top = centerY - height / 2;
    const right = centerX + width / 2;
    const bottom = centerY + height / 2;

    const startCol = Math.floor(left / CELL_SIZE);
    const endCol = Math.floor((right - 1) / CELL_SIZE);
    const startRow = Math.floor(top / CELL_SIZE);
    const endRow = Math.floor((bottom - 1) / CELL_SIZE);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = this.getCell(c, r);
        if (cell) {
          cell.setOccupying(entity);
        }
      }
    }
  }

  removeObstacle(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
  ) {
    const left = centerX - width / 2;
    const top = centerY - height / 2;
    const right = centerX + width / 2;
    const bottom = centerY + height / 2;

    const startCol = Math.floor(left / CELL_SIZE);
    const endCol = Math.floor((right - 1) / CELL_SIZE);
    const startRow = Math.floor(top / CELL_SIZE);
    const endRow = Math.floor((bottom - 1) / CELL_SIZE);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = this.getCell(c, r);
        if (cell) {
          cell.removeOccupying();
        }
      }
    }
  }
}
