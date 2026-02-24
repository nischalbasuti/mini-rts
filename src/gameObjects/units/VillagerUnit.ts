import { Sprite, SpriteSheet, track } from "kontra";
import { Player } from "../../Player";
import { Unit } from "./Unit";
import { GameState } from "../../GameState";
import { TreeResource } from "../resources/TreeResource";
import { GoldResource } from "../resources/GoldResource";
import { pixelToGrid, CELL_SIZE } from "../../pathing/Grid";
import { findPath } from "../../pathing/AStar";

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

  private findNextResource(
    depletedResource: TreeResource | GoldResource,
  ): TreeResource | GoldResource | null {
    const gameState = GameState.getInstance();
    const resourceList =
      depletedResource instanceof TreeResource ? gameState.trees : gameState.gold;

    // Filter resources with remaining quantity within 3 tiles (3 * CELL_SIZE = 128 pixels)
    const maxDistance = 3 * CELL_SIZE;
    const candidates = resourceList.filter(
      (res) => res.currentQuantity > 0 && res !== depletedResource,
    );

    if (candidates.length === 0) return null;

    // Find closest by Euclidean distance
    let closest = candidates[0];
    let closestDistance = Math.hypot(
      closest.gameObject.x - this.gameObject.x,
      closest.gameObject.y - this.gameObject.y,
    );

    for (const res of candidates) {
      const distance = Math.hypot(
        res.gameObject.x - this.gameObject.x,
        res.gameObject.y - this.gameObject.y,
      );
      if (distance < closestDistance && distance <= maxDistance) {
        closest = res;
        closestDistance = distance;
      }
    }

    // Check if closest is within 2 tiles
    if (closestDistance <= maxDistance) {
      return closest;
    }

    return null;
  }

  protected executeGather(target: TreeResource | GoldResource) {
    this.faceTarget(target.gameObject);

    if (target.currentQuantity <= 0) {
      // Resource depleted — find next closest resource of same type within 2 tiles
      const nextResource = this.findNextResource(target);
      if (nextResource) {
        const grid = GameState.getInstance().grid;
        const from = pixelToGrid(this.gameObject.x, this.gameObject.y);
        const to = pixelToGrid(nextResource.gameObject.x, nextResource.gameObject.y);
        const path = findPath(grid, from, to);
        if (path && path.length > 0) {
          this.setAction({ type: "gather", target: nextResource }, path);
        } else {
          this.currentAction = null;
        }
      } else {
        this.currentAction = null;
      }
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
