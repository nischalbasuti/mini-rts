import { GameObject, Sprite, track } from "kontra";
import { GameState } from "../../GameState";
import { Player } from "../../Player";

export class ProductionBuilding {
  static WIDTH = 50;
  static HEIGHT = 50;

  baseHp: number = 100;
  gameObject: GameObject;

  currentHp: number;

  wayPoint: GameObject;

  isSelected: boolean = false;
  selectionBox: Sprite;

  constructor(player: Player, x: number, y: number) {
    this.currentHp = this.baseHp;

    const self = this;
    this.gameObject = Sprite({
      color: "dark" + player.color,
      x,
      y,
      width: ProductionBuilding.WIDTH,
      height: ProductionBuilding.HEIGHT,
      anchor: { x: 0.5, y: 0.5 },
      onDown: function (evt: MouseEvent) {
        console.log("clicked on ProductionBuilding", evt, self);
        GameState.getInstance().clearSelection();

        self.isSelected = true;
        GameState.getInstance().selectUnit(self);
      },
    });

    this.wayPoint = Sprite({
      color: "white",
      x: this.gameObject.x - ProductionBuilding.WIDTH / 2 - 10,
      y: this.gameObject.y - ProductionBuilding.HEIGHT / 2 - 10,
      width: 5,
      height: 5,
      anchor: { x: 0.5, y: 0.5 },
    });

    this.selectionBox = Sprite({
      color: "yellow",
      x: 0,
      y: 0,
      width: this.gameObject.width + 3,
      height: this.gameObject.height + 3,
      anchor: { x: 0.5, y: 0.5 },
      opacity: 1,
    });
    this.selectionBox.position = this.gameObject.position;

    track(this.gameObject);
  }

  public update() {
    this.selectionBox.position = this.gameObject.position;

    this.gameObject.update();
    this.wayPoint.update();
    this.selectionBox.update();
  }

  public render() {
    if (this.isSelected) {
      this.wayPoint.render();
      this.selectionBox.render();
    }

    this.gameObject.render();
  }
}
