import { ProductionBuilding } from "./gameObjects/buildings/ProductionBuilding";
import { GoldResource } from "./gameObjects/resources/GoldResource";
import { TreeResource } from "./gameObjects/resources/TreeResource";

import type { InfantryUnit } from "./gameObjects/units/InfantryUnit";
import type { VillagerUnit } from "./gameObjects/units/VillagerUnit";
import type { GameState } from "./GameState";
import type { Player } from "./Player";

export class Spawner {
  readonly gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  spawnTree(x: number, y: number) {
    const tree = new TreeResource(x, y);
    this.gameState.trees.push(tree);
  }

  spawnTreeLine(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.spawnTreeCluster(x + i * 10, y, 10, 5);
    }
  }

  spawnTreeCluster(x: number, y: number, count: number, ratio: number = 1) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = Math.random() * ratio * i; // would be spiral if just linearly increase along with i
      const treeX = x + Math.cos(angle) * radius;
      const treeY = y + Math.sin(angle) * radius;
      this.spawnTree(treeX, treeY);
    }
  }

  spawnGold(x: number, y: number) {
    const gold = new GoldResource(x, y);
    this.gameState.gold.push(gold);
  }

  spawnGoldCluster(x: number, y: number, count: number, ratio: number = 1) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = Math.random() * ratio * i; // would be spiral if just linearly increase along with i
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
    return building;
  }
}
