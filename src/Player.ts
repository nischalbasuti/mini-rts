import type { Unit } from "./Unit";

export class Player {
  readonly name: string;
  readonly units: Unit[] = [];

  constructor(name: string) {
    this.name = name;
  }
}
