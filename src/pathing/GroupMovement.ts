import { Grid, GridPoint, pixelToGrid } from "./Grid";

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
