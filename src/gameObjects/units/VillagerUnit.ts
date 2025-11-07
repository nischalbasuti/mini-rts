import { Sprite, SpriteSheet, track } from "kontra";
import { Player } from "../../Player";
import { Unit } from "./Unit";
import { GameState } from "../../GameState";

export class VillagerUnit extends Unit {
  static WIDTH = 64;
  static HEIGHT = 64;

  static BASE_SPEED = 1;
  static BASE_ATTACK = 1;
  static BASE_HP = 50;
  static SPRITE_SHEET: SpriteSheet;

  constructor(player: Player, x: number, y: number) {
    const gameObject = Sprite({
      x,
      y,
      scaleX: VillagerUnit.WIDTH / 32,
      scaleY: VillagerUnit.HEIGHT / 32,
      anchor: { x: 0.5, y: 0.5 },
      animations: VillagerUnit.SPRITE_SHEET.animations,
      onDown: function (evt: MouseEvent) {
        console.log("clicked on villager unit", evt, self);
        GameState.getInstance().clearSelection();
        GameState.getInstance().selectUnit(self);
        self.isSelected = true;
      },
    });

    super(
      player,
      VillagerUnit.BASE_HP,
      VillagerUnit.BASE_SPEED,
      VillagerUnit.BASE_ATTACK,
      gameObject,
    );

    gameObject.playAnimation(Unit.AnimationStates.attacking);

    const self = this;
    track(gameObject);
  }
}
