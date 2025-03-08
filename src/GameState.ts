import { ProductionBuilding } from "./gameObjects/buildings/ProductionBuilding";
import { TreeResource } from "./gameObjects/resources/TreeResource";
import { Unit } from "./gameObjects/units/Unit";
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
