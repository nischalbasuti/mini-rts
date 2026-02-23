import { GameObject, Sprite } from "kontra";
import { Player } from "../../Player";
import { CELL_SIZE, GridPoint, gridToPixel, pixelToGrid } from "../../pathing/Grid";
import { GameState } from "../../GameState";
import { UnitAction, Attackable } from "./UnitAction";

export abstract class Unit {
  baseHp: number;
  baseSpeed: number;
  baseAttack: number;
  baseRange: number;
  currentHp: number;
  player: Player;

  gameObject: Sprite;
  wayPoint: GameObject;
  selectionBox: Sprite;

  static AnimationStates = {
    idle: "idle",
    moving: "moving",
    attacking: "attacking",
    gathering: "gathering",
  } as const;

  static ACTION_TICK_INTERVAL = 60;

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

  private _pathQueue: GridPoint[] = [];
  get pathQueue(): readonly GridPoint[] {
    return this._pathQueue;
  }

  currentAction: UnitAction | null = null;
  protected _actionTickTimer: number = 0;

  canGather(): boolean {
    return false;
  }

  constructor(
    player: Player,
    baseHp: number,
    baseSpeed: number,
    baseAttack: number,
    baseRange: number,
    gameObject: Sprite,
  ) {
    this.baseHp = baseHp;
    this.baseSpeed = baseSpeed;
    this.baseAttack = baseAttack;
    this.baseRange = baseRange;
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

    // Reserve spawn cell so other units won't path here
    const grid = GameState.getInstance().grid;
    const spawnCell = pixelToGrid(this.gameObject.x, this.gameObject.y);
    grid.reserveCell(spawnCell.col, spawnCell.row, this);
  }

  public setAction(action: UnitAction, path?: GridPoint[]) {
    this.currentAction = action;
    this._actionTickTimer = 0;
    if (path) {
      this.setPath(path);
    }
  }

  public setPath(path: GridPoint[]) {
    // Clear old reservation
    const grid = GameState.getInstance().grid;
    grid.unreserveCellsForUnit(this);

    this._pathQueue = path;

    // Reserve the final destination cell
    if (path.length > 0) {
      const dest = path[path.length - 1];
      grid.reserveCell(dest.col, dest.row, this);
    }

    this.advanceToNextPathPoint();
  }

  private advanceToNextPathPoint() {
    if (this._pathQueue.length === 0) return;
    const next = this._pathQueue.shift()!;
    const pixel = gridToPixel(next.col, next.row);
    this.wayPoint.position.set({ x: pixel.x, y: pixel.y });
  }

  isTargetInRange(target: { x: number; y: number }): boolean {
    const dx = target.x - this.gameObject.x;
    const dy = target.y - this.gameObject.y;
    const distance = Math.hypot(dx, dy);
    const rangeInPixels = this.baseRange * CELL_SIZE;
    return distance <= rangeInPixels;
  }

  faceTarget(target: { x: number; y: number }) {
    const dx = this.gameObject.x - target.x;
    const dy = this.gameObject.y - target.y;
    this.gameObject.rotation = Math.atan2(dy, dx) - Math.PI / 2;
  }

  protected executeAttack(target: Attackable) {
    this.faceTarget(target.gameObject);

    if (target.currentHp <= 0) {
      this.currentAction = null;
      return;
    }

    if (!this.isTargetInRange(target.gameObject)) {
      this.currentAction = null;
      return;
    }

    this.gameObject.playAnimation(Unit.AnimationStates.attacking);

    this._actionTickTimer++;
    if (this._actionTickTimer >= Unit.ACTION_TICK_INTERVAL) {
      this._actionTickTimer = 0;
      target.currentHp -= this.baseAttack;
    }
  }

  protected executeGather(_target: unknown) {
    // Base class does nothing — override in VillagerUnit
    this.currentAction = null;
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
      this.gameObject.rotation = Math.atan2(dy, dx) - Math.PI / 2;

      this.gameObject.playAnimation(Unit.AnimationStates.moving);
      return;
    }

    // Reached current waypoint — advance to next path point if available
    if (this._pathQueue.length > 0) {
      this.advanceToNextPathPoint();
      return;
    }

    // Path done — execute action if any
    this.gameObject.velocity.set({ x: 0, y: 0 });

    if (this.currentAction) {
      switch (this.currentAction.type) {
        case "attack":
          this.executeAttack(this.currentAction.target);
          return;
        case "gather":
          this.executeGather(this.currentAction.target);
          return;
        case "move":
          this.currentAction = null;
          break;
      }
    }

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
