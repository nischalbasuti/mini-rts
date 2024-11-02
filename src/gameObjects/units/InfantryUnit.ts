import { Sprite, track } from "kontra";
import { Player } from "../../Player";
import { Unit } from "./Unit";
import { GameState } from "../../GameState";

export class InfantryUnit extends Unit {
  static WIDTH = 10;
  static HEIGHT = 10;

  constructor(player: Player, x: number, y: number) {
    const gameObject = Sprite({
      color: player.color,
      x,
      y,
      width: InfantryUnit.WIDTH,
      height: InfantryUnit.HEIGHT,
      anchor: { x: 0.5, y: 0.5 },
      onDown: function (evt: MouseEvent) {
        console.log("clicked on infantry unit", evt, self);
        GameState.getInstance().selectUnit(self);
        self.isSelected = true;
      },
    });

    super(100, 10, 10, gameObject);

    const self = this;
    track(gameObject);
  }
}
