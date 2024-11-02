import { GameObject, Sprite } from "kontra";

export class TreeResource {
  static WIDTH = 10;
  static HEIGHT = 10;

  baseQuantity: number = 100;
  currentQuantity: number = 100;
  gameObject: GameObject;

  constructor(x: number, y: number) {
    this.gameObject = Sprite({
      color: "green",
      x,
      y,
      width: TreeResource.WIDTH,
      height: TreeResource.HEIGHT,
      anchor: { x: 0.5, y: 0.5 },
      onDown: function (evt: MouseEvent) {
        console.log("clicked on tree", evt, self);
      }
    });
  }
}
