import { GameObject, Sprite } from "kontra";

export class GoldResource {
  static WIDTH = 10;
  static HEIGHT = 10;

  baseQuantity: number = 100;
  currentQuantity: number = 100;
  gameObject: GameObject;

  constructor(x: number, y: number) {
    this.gameObject = Sprite({
      color: "gold",
      x,
      y,
      width: GoldResource.WIDTH,
      height: GoldResource.HEIGHT,
      anchor: { x: 0.5, y: 0.5 },
      onDown: function (evt: MouseEvent) {
        console.log("clicked on gold", evt, self);
      }
    });
  }
}
