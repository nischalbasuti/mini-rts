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
    const unit = new unitType(player, x, y);
    player.units.push(unit);
    return unit;
  }

  spawnProductionBuilding(player: Player, x: number, y: number) {
    const building = new ProductionBuilding(player, x, y);
    player.buildings.push(building);
    return building;
  }

  update() {
    for (let player of this.players) {
      for (let unit of player.units) {
        unit.gameObject.update();
      }

      for (let building of player.buildings) {
        building.gameObject.update();
        if (building.isSelected) {
          building.wayPoint.update();
        }
      }
    }

    for (let tree of this.trees) {
      tree.gameObject.update();
    }
  }
  render() {
    for (let tree of this.trees) {
      tree.gameObject.render();
    }

    for (let player of this.players) {
      for (let building of player.buildings) {
        building.gameObject.render();
        if (building.isSelected) {
          building.wayPoint.render();
        }
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
    for (let selectedUnit of this.selection) {
      if (selectedUnit !== unit) selectedUnit.isSelected = false;
    }
    this.selection.push(unit);
  }
}
