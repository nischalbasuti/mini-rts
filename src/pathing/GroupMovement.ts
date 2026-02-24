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
 * Find all walkable cells adjacent to a target entity's grid footprint.
 * Scans the 1-ring of 8-neighbors around each footprint cell.
 */
export function findAdjacentWalkableCells(
  grid: Grid,
  targetX: number,
  targetY: number,
  targetWidth: number,
  targetHeight: number,
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

  // 1-ring neighbor scan: check 8 neighbors of each footprint cell
  const seen = new Set<string>();
  const candidates: GridPoint[] = [];

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nc = c + dc;
          const nr = r + dr;
          const k = `${nc},${nr}`;
          if (seen.has(k) || occupiedSet.has(k)) continue;
          seen.add(k);
          if (grid.isInBounds(nc, nr) && grid.isWalkable(nc, nr)) {
            candidates.push({ col: nc, row: nr });
          }
        }
      }
    }
  }

  return candidates;
}

/**
 * Greedy assignment: for each unit position, pick the closest unassigned candidate cell.
 * Returns (GridPoint | null)[] aligned with unitPositions.
 */
export function assignClosestCells(
  candidates: GridPoint[],
  unitPositions: GridPoint[],
): (GridPoint | null)[] {
  const assigned = new Set<number>();
  const result: (GridPoint | null)[] = [];

  for (const pos of unitPositions) {
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < candidates.length; i++) {
      if (assigned.has(i)) continue;
      const dist = Math.hypot(candidates[i].col - pos.col, candidates[i].row - pos.row);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) {
      assigned.add(bestIdx);
      result.push(candidates[bestIdx]);
    } else {
      result.push(null);
    }
  }

  return result;
}
