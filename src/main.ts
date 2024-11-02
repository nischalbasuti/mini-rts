import kontra, { initPointer } from "kontra";
import { GameState } from "./GameState";
import { Player } from "./Player";
import { InfantryUnit } from "./gameObjects/units/InfantryUnit";
import { VillagerUnit } from "./gameObjects/units/VillagerUnit";
import { TreeResource } from "./gameObjects/resources/TreeResource";
import { ProductionBuilding } from "./gameObjects/buildings/ProductionBuilding";

let { init, GameLoop } = kontra;

let { canvas } = init();

const gameState = GameState.getInstance(canvas);
initPointer();

declare global {
  interface Window {
    gameState: GameState;
  }
}
window.gameState = gameState;

const player1 = new Player("Player 1", "blue");
gameState.players.push(player1);
gameState.spawnProductionBuilding(
  player1,
  canvas.width - ProductionBuilding.WIDTH,
  canvas.height - ProductionBuilding.HEIGHT
);

const player2 = new Player("Player 2", "red");
gameState.players.push(player2);
gameState.spawnUnit(player2, 100, 40 + 10, InfantryUnit);
gameState.spawnProductionBuilding(
  player2,
  ProductionBuilding.WIDTH,
  ProductionBuilding.HEIGHT
);

const NUMBER_OF_TREES = 50;
const HEIGHT_RATIO = 1 / 6;
gameState.spawnTreeLine(
  0,
  canvas.height / 2 - canvas.height * HEIGHT_RATIO,
  NUMBER_OF_TREES
);
gameState.spawnTreeLine(
  canvas.width - 50 * TreeResource.WIDTH,
  canvas.height / 2 + canvas.height * HEIGHT_RATIO,
  NUMBER_OF_TREES
);

let loop = GameLoop({
  blur: true,
  update: function () {
    gameState.update();
  },
  render: function () {
    gameState.render();
  },
});

loop.start();

document.getElementById("createVillager")?.addEventListener("click", () => {
  console.log("Creating Villager");
  gameState.spawnUnit(
    player1,
    canvas.width / 2,
    canvas.height - 40 - 20,
    VillagerUnit
  );
});

document.getElementById("createInf")?.addEventListener("click", () => {
  console.log("Creating Infantry");
  gameState.spawnUnit(
    player1,
    canvas.width - 20,
    canvas.height - 40 - 20,
    InfantryUnit
  );
});

document.getElementById("createArch")?.addEventListener("click", () => {
  console.log("Creating Archer");
});
