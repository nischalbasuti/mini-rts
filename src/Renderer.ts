import { GameState } from "./GameState";

export class Renderer {
  readonly gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }
  
  render() {
    for (let tree of this.gameState.trees) {
      tree.gameObject.render();
    }

    for (let player of this.gameState.players) {
      for (let building of player.buildings) {
        building.gameObject.render();
        if (building.isSelected) {
          building.wayPoint.render();
        }
      }

      for (let unit of player.units) {
        unit.gameObject.render();
      }
    }
  }
}
