import { GameObject, Sprite } from "kontra";
import { Player } from "../../Player";

export abstract class Unit {
  baseHp: number;
  baseSpeed: number;
  baseAttack: number;
  currentHp: number;
  player: Player;

  gameObject: Sprite;
  wayPoint: GameObject;
  selectionBox: Sprite;

  static AnimationStates = {
    idle: "idle",
    moving: "moving",
    attacking: "attacking",
  } as const;

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

  isMoving() {
    const wayPointDistance = this.gameObject.position.distance(
      this.wayPoint.position,
    );

    return wayPointDistance > 1;
  }

  attacking: boolean = false; // temp for testing

  isAttacking() {
    return this.attacking;
  }

  constructor(
    player: Player,
    baseHp: number,
    baseSpeed: number,
    baseAttack: number,
    gameObject: Sprite,
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

    if (this.isMoving()) {
      this.gameObject.velocity = this.wayPoint.position
        .subtract(this.gameObject.position)
        .normalize()
        .scale(this.speed);

      let dx = this.gameObject.x - this.wayPoint.x;
      let dy = this.gameObject.y - this.wayPoint.y;
      this.gameObject.rotation = Math.atan2(dy, dx) - 3.14 / 2;

      this.gameObject.playAnimation(Unit.AnimationStates.moving);
      return;
    }

    if (this.isAttacking()) {
      this.gameObject.velocity.set({ x: 0, y: 0 });
      this.gameObject.playAnimation(Unit.AnimationStates.attacking);

      return;
    }

    this.gameObject.velocity.set({ x: 0, y: 0 });
    this.gameObject.playAnimation(Unit.AnimationStates.idle);
  }

  public render() {
    if (this.isSelected) {
      this.wayPoint.render();
      this.selectionBox.render();
    }

    this.gameObject.render();
  }
}
