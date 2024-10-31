import { GameObjectClass } from "kontra";
import { Player } from "./Player";
import { Unit } from "./Unit";

export class InfantryUnit extends Unit {
  constructor(player: Player, x: number, y: number) {
    const gameObject = new Triangle({
      color: player.color,
      x,
      y,
      width: 20,
      height:40,
      anchor: { x: 0.5, y: 0.5 },
    });
    super(100, 10, 10, gameObject);
  }
}

class Triangle extends GameObjectClass {
  constructor(properties: any) {
    super(properties);
  }

  draw() {
    this.context.fillStyle = this.color;
    this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.lineTo(this.width, 0);
    this.context.lineTo(this.width / 2, this.height);
    this.context.fill();
  }
}
