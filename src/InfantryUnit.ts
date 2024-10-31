import { Sprite, track } from "kontra";
import { Player } from "./Player";
import { Unit } from "./Unit";

export class InfantryUnit extends Unit {
  constructor(player: Player, x: number, y: number) {
    const gameObject = Sprite({
      color: player.color,
      x,
      y,
      width: 20,
      height:40,
      anchor: { x: 0.5, y: 0.5 },
      onDown: function (evt: any) {
        console.log("clicked on infantry unit", evt, self);
      }
    });

    super(100, 10, 10, gameObject);

    const self = this;
    track(gameObject)
  }
}
