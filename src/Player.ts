import { ProductionBuilding } from "./gameObjects/buildings/ProductionBuilding";
import type { Unit } from "./gameObjects/units/Unit";

export class Player {
  readonly name: string;
  readonly units: Unit[] = [];
  readonly buildings: ProductionBuilding[] = [];
  readonly color: string;

  constructor(name: string, color: string) {
    this.name = name;
    this.color = color;
  }
}
