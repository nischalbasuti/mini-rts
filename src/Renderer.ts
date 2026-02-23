import { GameState } from "./GameState";
import { CELL_SIZE, GRID_COLS, GRID_ROWS, gridToPixel } from "./pathing/Grid";

export class Renderer {
  readonly gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  render() {
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

      for (let unit of player.units) {
        unit.render();
      }
    }

    if (this.gameState.debugMode) {
      this.renderDebugOverlay();
    }
  }

  private renderDebugOverlay() {
    const ctx = this.gameState.canvas.getContext("2d");
    if (!ctx) return;

    const grid = this.gameState.grid;

    // Grid lines
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

    // Unit path queues
    for (let pi = 0; pi < this.gameState.players.length; pi++) {
      const player = this.gameState.players[pi];
      const color = pi === 0 ? "rgba(0,100,255,0.8)" : "rgba(255,50,50,0.8)";

      for (const unit of player.units) {
        const queue = unit.pathQueue;
        if (queue.length === 0) continue;

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
  }
}
