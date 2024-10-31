import type { Unit } from "./Unit";

export class Player {
  readonly name: string;
  readonly units: Unit[] = [];
  readonly color: string;

  constructor(name: string, color: string) {
    this.name = name;
    this.color = color;
  }
}
