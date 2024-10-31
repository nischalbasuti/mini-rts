import { Sprite } from "kontra";

export class Unit {
  baseHp: number;
  baseSpeed: number;
  baseAttack: number;
  sprite: Sprite;

  currentHp: number;

  constructor(
    baseHp: number,
    baseSpeed: number,
    baseAttack: number,
    sprite: Sprite
  ) {
    this.baseHp = baseHp;
    this.baseSpeed = baseSpeed;
    this.baseAttack = baseAttack;
    this.sprite = sprite;

    this.currentHp = baseHp;
  }
}
