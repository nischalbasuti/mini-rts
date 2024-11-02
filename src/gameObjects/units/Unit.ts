import { GameObject } from "kontra";

export abstract class Unit {
  baseHp: number;
  baseSpeed: number;
  baseAttack: number;
  gameObject: GameObject;

  currentHp: number;

  constructor(
    baseHp: number,
    baseSpeed: number,
    baseAttack: number,
    gameObject: GameObject
  ) {
    this.baseHp = baseHp;
    this.baseSpeed = baseSpeed;
    this.baseAttack = baseAttack;
    this.gameObject = gameObject;

    this.currentHp = baseHp;
  }
}
