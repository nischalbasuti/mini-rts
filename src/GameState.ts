import { ProductionBuilding } from "./gameObjects/buildings/ProductionBuilding";
import { GoldResource } from "./gameObjects/resources/GoldResource";
import { TreeResource } from "./gameObjects/resources/TreeResource";
import { Unit } from "./gameObjects/units/Unit";
import { Player } from "./Player";
import { Grid, GRID_COLS, GRID_ROWS } from "./pathing/Grid";

export type Selectable = Unit | ProductionBuilding | TreeResource | GoldResource;

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
  grid: Grid = new Grid(GRID_COLS, GRID_ROWS);
  debugMode: boolean = false;

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

    // Dispose dead/depleted entities
    for (let player of this.players) {
      for (let i = player.units.length - 1; i >= 0; i--) {
        if (player.units[i].currentHp <= 0) {
          player.units[i].dispose(this);
          player.units.splice(i, 1);
        }
      }
      for (let i = player.buildings.length - 1; i >= 0; i--) {
        if (player.buildings[i].currentHp <= 0) {
          player.buildings[i].dispose(this);
          player.buildings.splice(i, 1);
        }
      }
    }
    for (let i = this.trees.length - 1; i >= 0; i--) {
      if (this.trees[i].currentQuantity <= 0) {
        this.trees[i].dispose(this);
        this.trees.splice(i, 1);
      }
    }
    for (let i = this.gold.length - 1; i >= 0; i--) {
      if (this.gold[i].currentQuantity <= 0) {
        this.gold[i].dispose(this);
        this.gold.splice(i, 1);
      }
    }
  }

  readonly selection: Set<Selectable> = new Set();
  clearSelection() {
    for (let selected of this.selection) {
      selected.isSelected = false;
    }
    this.selection.clear();
  }

  select(entity: Selectable) {
    this.selection.add(entity);
  }
}
