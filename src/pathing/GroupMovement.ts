import { CELL_SIZE, Grid, GridPoint, pixelToGrid } from "./Grid";

export function assignGroupDestinations(
  grid: Grid,
  clickX: number,
  clickY: number,
  unitCount: number,
): GridPoint[] {
  const origin = pixelToGrid(clickX, clickY);
  const destinations: GridPoint[] = [];
  const visited = new Set<string>();

  const queue: GridPoint[] = [origin];
  visited.add(`${origin.col},${origin.row}`);

  while (queue.length > 0 && destinations.length < unitCount) {
    const current = queue.shift()!;

    if (grid.isWalkable(current.col, current.row)) {
      destinations.push(current);
    }

    // BFS outward in 8 directions
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nc = current.col + dc;
        const nr = current.row + dr;
        const k = `${nc},${nr}`;
        if (!visited.has(k) && grid.isInBounds(nc, nr)) {
          visited.add(k);
          queue.push({ col: nc, row: nr });
        }
      }
    }
  }

  return destinations;
}

/**
 * Find walkable cells adjacent to a target entity's grid footprint.
 * BFS collects 8-neighbors of occupied cells, sorted by distance to target center.
 */
export function findAdjacentWalkableCells(
  grid: Grid,
  targetX: number,
  targetY: number,
  targetWidth: number,
  targetHeight: number,
  count: number,
): GridPoint[] {
  // Compute grid footprint of the target entity (center-anchored)
  const left = targetX - targetWidth / 2;
  const top = targetY - targetHeight / 2;
  const right = targetX + targetWidth / 2;
  const bottom = targetY + targetHeight / 2;

  const startCol = Math.floor(left / CELL_SIZE);
  const endCol = Math.floor((right - 1) / CELL_SIZE);
  const startRow = Math.floor(top / CELL_SIZE);
  const endRow = Math.floor((bottom - 1) / CELL_SIZE);

  // Collect all occupied cells
  const occupiedSet = new Set<string>();
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      occupiedSet.add(`${c},${r}`);
    }
  }

  // BFS from occupied cells outward to find walkable neighbors
  const visited = new Set<string>(occupiedSet);
  const candidates: GridPoint[] = [];
  const queue: GridPoint[] = [];

  // Seed BFS with occupied cells
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      queue.push({ col: c, row: r });
    }
  }

  // Target center in grid coords for distance sorting
  const centerCol = (startCol + endCol) / 2;
  const centerRow = (startRow + endRow) / 2;

  while (queue.length > 0 && candidates.length < count * 2) {
    const current = queue.shift()!;

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nc = current.col + dc;
        const nr = current.row + dr;
        const k = `${nc},${nr}`;
        if (!visited.has(k) && grid.isInBounds(nc, nr)) {
          visited.add(k);
          if (grid.isWalkable(nc, nr)) {
            candidates.push({ col: nc, row: nr });
          }
          queue.push({ col: nc, row: nr });
        }
      }
    }
  }

  // Sort by distance to target center
  candidates.sort((a, b) => {
    const distA = Math.hypot(a.col - centerCol, a.row - centerRow);
    const distB = Math.hypot(b.col - centerCol, b.row - centerRow);
    return distA - distB;
  });

  return candidates.slice(0, count);
}
