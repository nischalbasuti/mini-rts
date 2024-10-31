import { GameObjectClass } from "kontra";
import { Player } from "./Player";
import { Unit } from "./Unit";

export class ArcherUnit extends Unit {
  constructor(player: Player) {
    const gameObject = new Triangle({ color: player.color });
    super(100, 10, 10, gameObject);
  }
}

class Triangle extends GameObjectClass {
  constructor(properties: { color: string }) {
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
