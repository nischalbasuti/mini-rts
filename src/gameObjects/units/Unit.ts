import { GameObject, Sprite } from "kontra";

export abstract class Unit {
  baseHp: number;
  baseSpeed: number;
  baseAttack: number;
  gameObject: GameObject;

  currentHp: number;

  isSelected: boolean = false;

  wayPoint: GameObject;

  get speed() {
    return this.baseSpeed;
  }

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

    this.wayPoint = Sprite({
      color: "white",
      x: this.gameObject.x,
      y: this.gameObject.y,
      width: 5,
      height: 5,
      anchor: { x: 0.5, y: 0.5 },
    });
  }
}
