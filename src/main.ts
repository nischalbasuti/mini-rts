import kontra, { initPointer } from "kontra";
import { GameState } from "./GameState";
import { Player } from "./Player";
import { InfantryUnit } from "./gameObjects/units/InfantryUnit";
import { VillagerUnit } from "./gameObjects/units/VillagerUnit";
import { TreeResource } from "./gameObjects/resources/TreeResource";
import { ProductionBuilding } from "./gameObjects/buildings/ProductionBuilding";
import { Spawner } from "./Spawner";
import { Renderer } from "./Renderer";

let { init, GameLoop } = kontra;

let { canvas } = init();

const gameState = GameState.getInstance(canvas);
const spawner = new Spawner(gameState);
const renderer = new Renderer(gameState);

initPointer();

declare global {
  interface Window {
    gameState: GameState;
  }
}
window.gameState = gameState;

const player1 = new Player("Player 1", "blue");
gameState.players.push(player1);
const player1Building = spawner.spawnProductionBuilding(
  player1,
  canvas.width - ProductionBuilding.WIDTH,
  canvas.height - ProductionBuilding.HEIGHT
);

const player2 = new Player("Player 2", "red");
gameState.players.push(player2);
const player2Building = spawner.spawnProductionBuilding(
  player2,
  ProductionBuilding.WIDTH,
  ProductionBuilding.HEIGHT
);
spawner.spawnUnit(
  player2,
  player2Building.gameObject.position.x + ProductionBuilding.WIDTH / 2 + 10,
  player2Building.gameObject.position.y,
  InfantryUnit
);
spawner.spawnUnit(
  player2,
  player2Building.gameObject.position.x - ProductionBuilding.WIDTH / 2 - 10,
  player2Building.gameObject.position.y,
  VillagerUnit
);

const NUMBER_OF_TREES = 50;
const HEIGHT_RATIO = 1 / 6;
spawner.spawnTreeLine(
  0,
  canvas.height / 2 - canvas.height * HEIGHT_RATIO,
  NUMBER_OF_TREES
);
spawner.spawnTreeLine(
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
    renderer.render();
  },
});

loop.start();

document.getElementById("createVillager")?.addEventListener("click", () => {
  console.log("Creating Villager");

  spawner.spawnUnit(
    player1,
    player1Building.gameObject.position.x + ProductionBuilding.WIDTH / 2 + 10,
    player1Building.gameObject.position.y,
    VillagerUnit
  );
});

document.getElementById("createInf")?.addEventListener("click", () => {
  console.log("Creating Infantry");
  spawner.spawnUnit(
    player1,
    player1Building.gameObject.position.x - ProductionBuilding.WIDTH / 2 - 10,
    player1Building.gameObject.position.y,
    InfantryUnit
  );
});

document.getElementById("createArch")?.addEventListener("click", () => {
  alert("Creating Archer: not implemented");
  console.log("Creating Archer");
});
