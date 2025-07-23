import { Sprite, SpriteSheet, track } from "kontra";
import { Player } from "../../Player";
import { Unit } from "./Unit";
import { GameState } from "../../GameState";

export class InfantryUnit extends Unit {
  static WIDTH = 64;
  static HEIGHT = 64;

  static BASE_SPEED = 1;
  static BASE_ATTACK = 1;
  static BASE_HP = 100;

  static SPRITE_SHEET: SpriteSheet;

  constructor(player: Player, x: number, y: number) {
    const gameObject = Sprite({
      x,
      y,
      scaleX: InfantryUnit.WIDTH / 32,
      scaleY: InfantryUnit.HEIGHT / 32,
      anchor: { x: 0.5, y: 0.5 },
      animations: InfantryUnit.SPRITE_SHEET.animations,
      onDown: function (evt: MouseEvent) {
        console.log("clicked on infantry unit", evt, self);
        GameState.getInstance().clearSelection();
        GameState.getInstance().selectUnit(self);
        self.isSelected = true;
      },
    });

    super(
      player,
      InfantryUnit.BASE_HP,
      InfantryUnit.BASE_SPEED,
      InfantryUnit.BASE_ATTACK,
      gameObject,
    );

    gameObject.playAnimation(Unit.AnimationStates.idle);

    const self = this;
    track(gameObject);
  }
}
