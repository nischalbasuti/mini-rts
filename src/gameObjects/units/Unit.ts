import { GameObject, Sprite } from "kontra";
import { Player } from "../../Player";

export abstract class Unit {
  baseHp: number;
  baseSpeed: number;
  baseAttack: number;
  currentHp: number;
  player: Player;

  gameObject: GameObject;
  wayPoint: GameObject;
  selectionBox: Sprite;

  private _isSelected: boolean = false;
  get isSelected() {
    return this._isSelected;
  }

  set isSelected(selected: boolean) {
    this._isSelected = selected;
  }

  get speed() {
    return this.baseSpeed;
  }

  constructor(
    player: Player,
    baseHp: number,
    baseSpeed: number,
    baseAttack: number,
    gameObject: GameObject,
  ) {
    this.baseHp = baseHp;
    this.baseSpeed = baseSpeed;
    this.baseAttack = baseAttack;
    this.gameObject = gameObject;
    this.player = player;

    this.currentHp = baseHp;

    this.wayPoint = Sprite({
      color: "white",
      x: this.gameObject.x,
      y: this.gameObject.y,
      width: 5,
      height: 5,
      anchor: { x: 0.5, y: 0.5 },
    });

    this.selectionBox = Sprite({
      color: "yellow",
      x: 0,
      y: 0,
      radius: (this.gameObject.width / 2 || this.gameObject.radius) + 3,
      anchor: { x: 0.5, y: 0.5 },
      opacity: 1,
    });
  }

  public update() {
    this.selectionBox.position = this.gameObject.position;

    this.gameObject.update();
    this.wayPoint.update();
    this.selectionBox.update();

    const wayPointDistance = this.gameObject.position.distance(
      this.wayPoint.position,
    );
    if (wayPointDistance > 1) {
      this.gameObject.velocity = this.wayPoint.position
        .subtract(this.gameObject.position)
        .normalize()
        .scale(this.speed);
    } else {
      this.gameObject.velocity.set({ x: 0, y: 0 });
    }
  }

  public render() {
    if (this.isSelected) {
      this.wayPoint.render();
      this.selectionBox.render();
    }

    this.gameObject.render();
  }
}
