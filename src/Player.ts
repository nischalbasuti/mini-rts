import { ProductionBuilding } from "./gameObjects/buildings/ProductionBuilding";
import type { Unit } from "./gameObjects/units/Unit";

export class Player {
  readonly name: string;
  readonly units: Unit[] = [];
  readonly buildings: ProductionBuilding[] = [];
  readonly color: string;

  wood: number = 0;
  gold: number = 0;

  constructor(name: string, color: string) {
    this.name = name;
    this.color = color;
  }
}
