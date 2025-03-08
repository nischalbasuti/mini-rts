import { Sprite, track } from "kontra";
import { Player } from "../../Player";
import { Unit } from "./Unit";
import { GameState } from "../../GameState";

export class VillagerUnit extends Unit {
  static WIDTH = 10;
  static HEIGHT = 10;

  static BASE_SPEED = 1;
  static BASE_ATTACK = 1;
  static BASE_HP = 50;

  constructor(player: Player, x: number, y: number) {
    const gameObject = Sprite({
      color: player.color == "red" ? "pink" : "light" + player.color,
      x,
      y,
      width: VillagerUnit.WIDTH,
      height: VillagerUnit.HEIGHT,
      anchor: { x: 0.5, y: 0.5 },
      onDown: function (evt: MouseEvent) {
        console.log("clicked on villager unit", evt, self);
        GameState.getInstance().clearSelection();
        GameState.getInstance().selectUnit(self);
        self.isSelected = true;
      },
    });

    super(
      VillagerUnit.BASE_HP,
      VillagerUnit.BASE_SPEED,
      VillagerUnit.BASE_ATTACK,
      gameObject,
    );

    const self = this;
    track(gameObject);
  }
}
