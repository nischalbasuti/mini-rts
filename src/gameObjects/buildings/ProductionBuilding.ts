import { GameObject, Sprite, track } from "kontra";
import { GameState } from "../../GameState";
import { Player } from "../../Player";

export class ProductionBuilding {
  static WIDTH = 50;
  static HEIGHT = 50;

  baseHp: number = 100;
  gameObject: GameObject;

  currentHp: number;

  constructor(
    player: Player,
    x: number,
    y: number
  ) {
    this.currentHp = this.baseHp;

    const self = this;
    this.gameObject = Sprite({
      color: "dark"+player.color,
      x,
      y,
      width: ProductionBuilding.WIDTH,
      height: ProductionBuilding.HEIGHT,
      anchor: { x: 0.5, y: 0.5 },
      onDown: function (evt: MouseEvent) {
        console.log("clicked on ProductionBuilding", evt, self);
        GameState.getInstance().selectUnit(self);
      }
    });

    track(this.gameObject)
  }
}
