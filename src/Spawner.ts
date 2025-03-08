import { ProductionBuilding } from "./gameObjects/buildings/ProductionBuilding";
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
      this.spawnTree(x + i * 10, y);
    }
  }

  spawnUnit(
    player: Player,
    x: number,
    y: number,
    unitType: typeof InfantryUnit | typeof VillagerUnit
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
