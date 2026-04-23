import { Unit } from "./gameObjects/units/Unit";
import { GameState } from "./GameState";
import { CELL_SIZE, GRID_COLS, GRID_ROWS, gridToPixel } from "./pathing/Grid";
import { Player } from "./Player";

export class Renderer {
  readonly gameState: GameState;
  zoom: number = 1;
  offsetX: number = 0;
  offsetY: number = 0;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  applyZoom(z: number) {
    this.zoom = z;
  }

  applyOffset(x: number, y: number) {
    this.offsetX = x;
    this.offsetY = y;
  }

  render() {
    const ctx = this.gameState.canvas.getContext("2d");
    if (!ctx) return;

    const width = this.gameState.canvas.width;
    const height = this.gameState.canvas.height;

    // Clear canvas before rendering
    ctx.clearRect(0, 0, width, height);

    // Apply zoom and offset in a single transform
    ctx.setTransform(this.zoom, 0, 0, this.zoom, -this.offsetX, -this.offsetY);

    for (let tree of this.gameState.trees) {
      tree.gameObject.render();
    }

    for (let gold of this.gameState.gold) {
      gold.gameObject.render();
    }

    for (let player of this.gameState.players) {
      for (let building of player.buildings) {
        building.render();
      }

      this.renderUnits(player);
    }

    if (this.gameState.debugMode) {
      this.renderDebugOverlay();
    }

    this.renderGridLines();
  }

  private renderGridLines() {
    const ctx = this.gameState.canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "rgba(200,200,200,0.4)";
    ctx.lineWidth = 1;
    for (let col = 0; col <= GRID_COLS; col++) {
      const x = col * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GRID_ROWS * CELL_SIZE);
      ctx.stroke();
    }
    for (let row = 0; row <= GRID_ROWS; row++) {
      const y = row * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GRID_COLS * CELL_SIZE, y);
      ctx.stroke();
    }
  }

  private renderUnits(player: Player) {
    const ctx = this.gameState.canvas.getContext("2d");
    if (!ctx) return;

    const playerIndex = this.gameState.players.indexOf(player);
    const playerColor = playerIndex === 0 ? "rgba(0,100,255,0.8)" : "rgba(255,50,50,0.8)";

    for (const unit of player.units) {
      // Render unit sprite and selection ring
      unit.render();

      if (unit.isSelected || this.gameState.debugMode) {
        this.renderActionState(unit, ctx);
        this.renderPathQueue(unit, ctx, playerColor);
      }
    }
  }

  private renderPathQueue(unit: Unit, ctx: CanvasRenderingContext2D, color: string) {
      const queue = unit.pathQueue;
      if (queue.length > 0) {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;

        // Draw line from unit position through path points
        ctx.beginPath();
        ctx.moveTo(unit.gameObject.x, unit.gameObject.y);

        // Line to current waypoint
        ctx.lineTo(unit.wayPoint.x, unit.wayPoint.y);

        // Lines through remaining queue
        for (const point of queue) {
          const pixel = gridToPixel(point.col, point.row);
          ctx.lineTo(pixel.x, pixel.y);
        }
        ctx.stroke();

        // Dots at each path point
        for (const point of queue) {
          const pixel = gridToPixel(point.col, point.row);
          ctx.beginPath();
          ctx.arc(pixel.x, pixel.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
  }

  private renderActionState(unit: Unit, ctx: CanvasRenderingContext2D) {
    // Draw action state label and vector to target
    const action = unit.currentAction;
    if (action && (action.type === "attack" || action.type === "gather")) {
      const target = action.target;
      const ux = unit.gameObject.x;
      const uy = unit.gameObject.y;
      const tx = target.gameObject.x;
      const ty = target.gameObject.y;

      // Vector line from unit to target
      const actionColor = action.type === "attack" ? "rgba(255,0,0,0.8)" : "rgba(0,200,0,0.8)";
      ctx.strokeStyle = actionColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ux, uy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead at target end
      const dx = tx - ux;
      const dy = ty - uy;
      const dist = Math.hypot(dx, dy);
      if (dist > 0) {
        const ndx = dx / dist;
        const ndy = dy / dist;
        const arrowLen = 8;
        ctx.fillStyle = actionColor;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - arrowLen * ndx - arrowLen * 0.5 * ndy, ty - arrowLen * ndy + arrowLen * 0.5 * ndx);
        ctx.lineTo(tx - arrowLen * ndx + arrowLen * 0.5 * ndy, ty - arrowLen * ndy - arrowLen * 0.5 * ndx);
        ctx.closePath();
        ctx.fill();
      }

      // Action state label above unit
      const label = action.type === "attack" ? "ATK" : "GTH";
      ctx.font = "bold 10px monospace";
      ctx.fillStyle = actionColor;
      ctx.textAlign = "center";
      ctx.fillText(label, ux, uy - unit.gameObject.height / 2 - 4);
    } else if (action && action.type === "move") {
      ctx.font = "bold 10px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.textAlign = "center";
      ctx.fillText("MOV", unit.gameObject.x, unit.gameObject.y - unit.gameObject.height / 2 - 4);
    }
  }

  private renderDebugOverlay() {
    const ctx = this.gameState.canvas.getContext("2d");
    if (!ctx) return;

    const grid = this.gameState.grid;

    // Unwalkable cells (red tint)
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const cell = grid.getCell(col, row);
        if (cell && !cell.walkable) {
          ctx.fillStyle = "rgba(255,0,0,0.25)";
          ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Reserved cells (yellow tint)
    const reserved = grid.getReservedCells();
    for (const key of reserved.keys()) {
      const [colStr, rowStr] = key.split(",");
      const col = parseInt(colStr);
      const row = parseInt(rowStr);
      ctx.fillStyle = "rgba(255,255,0,0.3)";
      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

  }
}
