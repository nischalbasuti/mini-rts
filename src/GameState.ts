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
        unit.sprite.update();


        if (unit.sprite.x > this.canvas.width) {
          unit.sprite.x = 0;
        }
      }
    }
  }
  render() {
    for (let player of this.players) {
      for (let unit of player.units) {
        unit.sprite.render();
      }
    }
  }
}
