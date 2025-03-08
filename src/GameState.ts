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

  private constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  update() {
    for (let player of this.players) {
      for (let unit of player.units) {
        unit.gameObject.update();

        if (unit.isSelected) {
          unit.wayPoint.update();
        }

        const wayPointDistance = unit.gameObject.position.distance(
          unit.wayPoint.position,
        );
        if (wayPointDistance > 1) {
          unit.gameObject.velocity = unit.wayPoint.position
            .subtract(unit.gameObject.position)
            .normalize()
            .scale(unit.speed);

        } else {
          unit.gameObject.velocity.set({ x: 0, y: 0 });
        }
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

  readonly selection: (Unit | ProductionBuilding)[] = [];
  clearSelection() {
    this.selection.length = 0;
  }

  selectUnit(unit: Unit | ProductionBuilding) {
    for (let selectedUnit of this.selection) {
      if (selectedUnit !== unit) selectedUnit.isSelected = false;
    }
    this.selection.push(unit);
  }

  getSelectedUnits() {
    return this.selection.filter((unit) => unit instanceof Unit) as Unit[];
  }

  getSelectedBuildings() {
    return this.selection.filter(
      (unit) => unit instanceof ProductionBuilding,
    ) as ProductionBuilding[];
  }
}
