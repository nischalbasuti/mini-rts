import { Sprite, SpriteSheet, track } from "kontra";
import { Player } from "../../Player";
import { Unit } from "./Unit";
import { GameState } from "../../GameState";
import { TreeResource } from "../resources/TreeResource";
import { GoldResource } from "../resources/GoldResource";

export class VillagerUnit extends Unit {
  static WIDTH = 32;
  static HEIGHT = 32;

  static BASE_SPEED = 1;
  static BASE_ATTACK = 10;
  static BASE_HP = 50;
  static BASE_RANGE = 1.5;

  static SPRITE_SHEET: SpriteSheet;

  static GATHER_RATE = 20;
  static CARRY_CAPACITY = 10;

  carriedResource: { type: "wood" | "gold"; amount: number } | null = null;

  constructor(player: Player, x: number, y: number) {
    const gameObject = Sprite({
      x,
      y,
      scaleX: VillagerUnit.WIDTH / 32,
      scaleY: VillagerUnit.HEIGHT / 32,
      anchor: { x: 0.5, y: 0.5 },
      animations: VillagerUnit.SPRITE_SHEET.animations,
      onDown: function (evt: MouseEvent) {
        if (evt.button !== 0) return;
        console.log("clicked on villager unit", evt, self);
        GameState.getInstance().clearSelection();
        GameState.getInstance().select(self);
        self.isSelected = true;
      },
    });

    super(
      player,
      VillagerUnit.BASE_HP,
      VillagerUnit.BASE_SPEED,
      VillagerUnit.BASE_ATTACK,
      VillagerUnit.BASE_RANGE,
      gameObject,
    );

    gameObject.playAnimation(Unit.AnimationStates.idle);

    const self = this;
    track(gameObject);
  }

  canGather(): boolean {
    return true;
  }

  protected executeGather(target: TreeResource | GoldResource) {
    this.faceTarget(target.gameObject);

    if (target.currentQuantity <= 0) {
      this.currentAction = null;
      return;
    }

    if (!this.isTargetInRange(target.gameObject)) {
      this.currentAction = null;
      return;
    }

    this.gameObject.playAnimation(Unit.AnimationStates.gathering);

    const resType = target instanceof TreeResource ? "wood" : "gold";

    if (!this.carriedResource || this.carriedResource.type !== resType) {
      this.carriedResource = { type: resType as "wood" | "gold", amount: 0 };
    }

    this._actionTickTimer++;
    if (this._actionTickTimer >= Unit.ACTION_TICK_INTERVAL) {
      this._actionTickTimer = 0;
      const gathered = Math.min(
        VillagerUnit.GATHER_RATE,
        target.currentQuantity,
        // VillagerUnit.CARRY_CAPACITY - this.carriedResource.amount,
      );
      target.currentQuantity -= gathered;
      this.carriedResource.amount += gathered;
      this.player[resType] += gathered;
    }
  }
}
