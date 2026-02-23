import { ProductionBuilding } from "./gameObjects/buildings/ProductionBuilding";
import { GoldResource } from "./gameObjects/resources/GoldResource";
import { TreeResource } from "./gameObjects/resources/TreeResource";

import type { InfantryUnit } from "./gameObjects/units/InfantryUnit";
import type { VillagerUnit } from "./gameObjects/units/VillagerUnit";
import type { GameState } from "./GameState";
import type { Player } from "./Player";
import { CELL_SIZE, pixelToGrid, gridToPixel, GridPoint } from "./pathing/Grid";

function snapToNearestFreeCell(gameState: GameState, x: number, y: number): { x: number; y: number } | null {
  const origin = pixelToGrid(x, y);
  const grid = gameState.grid;
  const visited = new Set<string>();
  const queue: GridPoint[] = [origin];
  visited.add(`${origin.col},${origin.row}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (grid.isWalkable(current.col, current.row)) {
      return gridToPixel(current.col, current.row);
    }
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
  return null;
}

export class Spawner {
  readonly gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  spawnTree(x: number, y: number) {
    const snapped = snapToNearestFreeCell(this.gameState, x, y);
    if (!snapped) return;
    const tree = new TreeResource(snapped.x, snapped.y);
    this.gameState.trees.push(tree);
    this.gameState.grid.registerObstacle(tree, snapped.x, snapped.y, TreeResource.WIDTH, TreeResource.HEIGHT);
  }

  spawnTreeLine(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.spawnTreeCluster(x + i * CELL_SIZE * 1.5, y, 3, 2);
    }
  }

  spawnTreeCluster(x: number, y: number, count: number, ratio: number = 1) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = Math.random() * ratio * i;
      const treeX = x + Math.cos(angle) * radius;
      const treeY = y + Math.sin(angle) * radius;
      this.spawnTree(treeX, treeY);
    }
  }

  spawnGold(x: number, y: number) {
    const snapped = snapToNearestFreeCell(this.gameState, x, y);
    if (!snapped) return;
    const gold = new GoldResource(snapped.x, snapped.y);
    this.gameState.gold.push(gold);
    this.gameState.grid.registerObstacle(gold, snapped.x, snapped.y, GoldResource.WIDTH, GoldResource.HEIGHT);
  }

  spawnGoldCluster(x: number, y: number, count: number, ratio: number = 1) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = Math.random() * ratio * i;
      const goldX = x + Math.cos(angle) * radius;
      const goldY = y + Math.sin(angle) * radius;
      this.spawnGold(goldX, goldY);
    }
  }

  spawnUnit(
    player: Player,
    x: number,
    y: number,
    unitType: typeof InfantryUnit | typeof VillagerUnit,
  ) {
    const unit = new unitType(player, x, y);
    player.units.push(unit);
    return unit;
  }

  spawnProductionBuilding(player: Player, x: number, y: number) {
    const building = new ProductionBuilding(player, x, y);
    player.buildings.push(building);
    this.gameState.grid.registerObstacle(building, x, y, ProductionBuilding.WIDTH, ProductionBuilding.HEIGHT);
    return building;
  }
}
