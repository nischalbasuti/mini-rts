import { Player } from "./Player";

export class GameState {
  static instance: GameState;
  static getInstance(canvas?: HTMLCanvasElement) {
    if (!GameState.instance) {
      if (!canvas) {
        throw new Error("Canvas is required for first time GameState initialization");
      }
      GameState.instance = new GameState(canvas);
    }
    if (canvas) {
      GameState.instance.canvas = canvas;
    }
    return GameState.instance;
  }

  canvas: HTMLCanvasElement;
  players: Player[] = [];

  private constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  update() {
    for (let player of this.players) {
      for (let unit of player.units) {
        unit.gameObject.update();


        if (unit.gameObject.x > this.canvas.width) {
          unit.gameObject.x = 0;
        }
      }
    }
  }
  render() {
    for (let player of this.players) {
      for (let unit of player.units) {
        unit.gameObject.render();
      }
    }
  }
}
