import { Grid, GridPoint } from "./Grid";

const SQRT2 = Math.SQRT2;

interface AStarNode {
  col: number;
  row: number;
  g: number;
  f: number;
  parent: AStarNode | null;
}

function heuristic(a: GridPoint, b: GridPoint): number {
  // Octile distance — exact for 8-directional movement with √2 diagonal cost
  const dx = Math.abs(a.col - b.col);
  const dy = Math.abs(a.row - b.row);
  return Math.max(dx, dy) + (SQRT2 - 1) * Math.min(dx, dy);
}

function key(col: number, row: number): string {
  return `${col},${row}`;
}

export function findNearestWalkable(grid: Grid, origin: GridPoint): GridPoint | null {
  const queue: GridPoint[] = [origin];
  const visited = new Set<string>();
  visited.add(key(origin.col, origin.row));

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (grid.isWalkable(current.col, current.row)) {
      return current;
    }

    // BFS in 8 directions
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nc = current.col + dc;
        const nr = current.row + dr;
        const k = key(nc, nr);
        if (!visited.has(k) && grid.isInBounds(nc, nr)) {
          visited.add(k);
          queue.push({ col: nc, row: nr });
        }
      }
    }
  }

  return null;
}

export function findPath(grid: Grid, start: GridPoint, goal: GridPoint): GridPoint[] | null {
  // If goal is unwalkable, find nearest walkable cell
  let actualGoal = goal;
  if (!grid.isWalkable(goal.col, goal.row)) {
    const nearest = findNearestWalkable(grid, goal);
    if (!nearest) return null;
    actualGoal = nearest;
  }

  // If start is unwalkable, find nearest walkable
  let actualStart = start;
  if (!grid.isWalkable(start.col, start.row)) {
    const nearest = findNearestWalkable(grid, start);
    if (!nearest) return null;
    actualStart = nearest;
  }

  // Already at goal
  if (actualStart.col === actualGoal.col && actualStart.row === actualGoal.row) {
    return [actualGoal];
  }

  const openList: AStarNode[] = [];
  const closedSet = new Set<string>();

  const startNode: AStarNode = {
    col: actualStart.col,
    row: actualStart.row,
    g: 0,
    f: heuristic(actualStart, actualGoal),
    parent: null,
  };

  openList.push(startNode);

  while (openList.length > 0) {
    // Find node with lowest f score (simple linear scan — fine for 475 cells)
    let bestIdx = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[bestIdx].f) {
        bestIdx = i;
      }
    }

    const current = openList[bestIdx];
    openList.splice(bestIdx, 1);

    // Reached the goal
    if (current.col === actualGoal.col && current.row === actualGoal.row) {
      const path: GridPoint[] = [];
      let node: AStarNode | null = current;
      while (node !== null) {
        path.push({ col: node.col, row: node.row });
        node = node.parent;
      }
      path.reverse();
      // Exclude start position
      return path.slice(1);
    }

    const currentKey = key(current.col, current.row);
    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);

    const neighbors = grid.getNeighbors(current.col, current.row);
    for (const neighbor of neighbors) {
      const nKey = key(neighbor.col, neighbor.row);
      if (closedSet.has(nKey)) continue;

      const isDiagonal = neighbor.col !== current.col && neighbor.row !== current.row;
      const moveCost = isDiagonal ? SQRT2 : 1;
      const tentativeG = current.g + moveCost;

      // Check if neighbor is already in open list with better g
      const existingIdx = openList.findIndex(
        (n) => n.col === neighbor.col && n.row === neighbor.row,
      );

      if (existingIdx !== -1) {
        if (tentativeG < openList[existingIdx].g) {
          openList[existingIdx].g = tentativeG;
          openList[existingIdx].f = tentativeG + heuristic(neighbor, actualGoal);
          openList[existingIdx].parent = current;
        }
      } else {
        openList.push({
          col: neighbor.col,
          row: neighbor.row,
          g: tentativeG,
          f: tentativeG + heuristic(neighbor, actualGoal),
          parent: current,
        });
      }
    }
  }

  // No path found
  return null;
}
