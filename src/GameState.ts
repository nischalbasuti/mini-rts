import { ProductionBuilding } from "./gameObjects/buildings/ProductionBuilding";
import { GoldResource } from "./gameObjects/resources/GoldResource";
import { TreeResource } from "./gameObjects/resources/TreeResource";
import { Unit } from "./gameObjects/units/Unit";
import { Player } from "./Player";

export class GameState {
  static instance: GameState;
  static getInstance(canvas?: HTMLCanvasElement) {
    if (!GameState.instance) {
      if (!canvas) {
        throw new Error(
          "Canvas is required for first time GameState initialization",
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
  gold: GoldResource[] = [];

  private constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  update() {
    for (let player of this.players) {
      for (let unit of player.units) {
        unit.update();
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

    for (let gold of this.gold) {
      gold.gameObject.update();
    }
  }

  readonly selection: Set<Unit | ProductionBuilding> = new Set();
  clearSelection() {
    for (let selectedUnit of this.selection) {
      selectedUnit.isSelected = false;
    }
    this.selection.clear();
  }

  selectUnit(unit: Unit | ProductionBuilding) {
    this.selection.add(unit);
  }
}
