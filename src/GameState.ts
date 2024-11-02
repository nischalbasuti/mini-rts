import { ProductionBuilding } from "./gameObjects/buildings/ProductionBuilding";
import { TreeResource } from "./gameObjects/resources/TreeResource";
import { InfantryUnit } from "./gameObjects/units/InfantryUnit";
import { Unit } from "./gameObjects/units/Unit";
import { VillagerUnit } from "./gameObjects/units/VillagerUnit";
import { Player } from "./Player";

export class GameState {
  static instance: GameState;
  static getInstance(canvas?: HTMLCanvasElement) {
    if (!GameState.instance) {
      if (!canvas) {
        throw new Error(
          "Canvas is required for first time GameState initialization"
        );
      }
      GameState.instance = new GameState(canvas);
    }
    if (canvas) {
      GameState.instance.canvas = canvas;
    }
    return GameState.instance;
  }

  canvas: HTMLCanvasElement;
  players: Player[] = [];
  trees: TreeResource[] = [];

  private constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  spawnTree(x: number, y: number) {
    const tree = new TreeResource(x, y);
    this.trees.push(tree);
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
    player.units.push(new unitType(player, x, y));
  }

  spawnProductionBuilding(player: Player, x: number, y: number) {
    player.buildings.push(new ProductionBuilding(player, x, y));
  }

  update() {
    for (let player of this.players) {
      for (let unit of player.units) {
        unit.gameObject.update();
      }

      for (let building of player.buildings) {
        building.gameObject.update();
      }
    }


    for (let tree of this.trees) {
      tree.gameObject.render();
    }
  }
  render() {
    for (let tree of this.trees) {
      tree.gameObject.render();
    }

    for (let player of this.players) {
      for (let building of player.buildings) {
        building.gameObject.render();
      }

      for (let unit of player.units) {
        unit.gameObject.render();
      }
    }
  }

  selection: (Unit | ProductionBuilding)[] = [];
  clearSelection() {
    this.selection.length = 0;
  }

  selectUnit(unit: Unit | ProductionBuilding) {
    this.selection.push(unit);
  }
}
