import { GameObject, Sprite, track, untrack } from "kontra";
import { GameState } from "../../GameState";
import { Player } from "../../Player";

export class ProductionBuilding {
  static WIDTH = 64;
  static HEIGHT = 64;

  baseHp: number = 100;
  gameObject: GameObject;
  player: Player;

  currentHp: number;

  wayPoint: GameObject;

  isSelected: boolean = false;

  constructor(player: Player, x: number, y: number) {
    this.player = player;
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
        if (evt.button !== 0) return;
        console.log("clicked on ProductionBuilding", evt, self);
        GameState.getInstance().clearSelection();

        self.isSelected = true;
        GameState.getInstance().select(self);
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

    track(this.gameObject);
  }

  public dispose(gameState: GameState) {
    untrack(this.gameObject);
    gameState.grid.removeObstacle(
      this.gameObject.x,
      this.gameObject.y,
      ProductionBuilding.WIDTH,
      ProductionBuilding.HEIGHT,
    );
    gameState.selection.delete(this);
  }

  public update() {
    this.gameObject.update();
    this.wayPoint.update();
  }

  private renderSelectionRing() {
    const ctx = GameState.getInstance().canvas.getContext("2d");
    if (!ctx) return;

    const x = this.gameObject.x;
    const y = this.gameObject.y + ProductionBuilding.HEIGHT / 3;
    const radiusX = ProductionBuilding.WIDTH / 2 + 4;
    const radiusY = radiusX * 0.35;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.strokeStyle = this.player.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.restore();
  }

  public render() {
    if (this.isSelected) {
      this.renderSelectionRing();
      this.wayPoint.render();
    }

    this.gameObject.render();
  }
}
