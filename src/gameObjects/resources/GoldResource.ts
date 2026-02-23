import { GameObject, Sprite, track } from "kontra";
import { GameState } from "../../GameState";

export class GoldResource {
  static WIDTH = 32;
  static HEIGHT = 32;

  baseQuantity: number = 100;
  currentQuantity: number = 100;
  gameObject: GameObject;
  isSelected: boolean = false;

  constructor(x: number, y: number) {
    const self = this;
    this.gameObject = Sprite({
      color: "gold",
      x,
      y,
      width: GoldResource.WIDTH,
      height: GoldResource.HEIGHT,
      anchor: { x: 0.5, y: 0.5 },
      onDown: function (evt: MouseEvent) {
        if (evt.button !== 0) return;
        GameState.getInstance().clearSelection();
        self.isSelected = true;
        GameState.getInstance().select(self);
      }
    });

    track(this.gameObject);
  }
}
