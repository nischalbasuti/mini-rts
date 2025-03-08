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
  canvas.height - ProductionBuilding.HEIGHT,
);

const player2 = new Player("Player 2", "red");
gameState.players.push(player2);
const player2Building = spawner.spawnProductionBuilding(
  player2,
  ProductionBuilding.WIDTH,
  ProductionBuilding.HEIGHT,
);
spawner.spawnUnit(
  player2,
  player2Building.gameObject.position.x + ProductionBuilding.WIDTH / 2 + 10,
  player2Building.gameObject.position.y,
  InfantryUnit,
);
spawner.spawnUnit(
  player2,
  player2Building.gameObject.position.x - ProductionBuilding.WIDTH / 2 - 10,
  player2Building.gameObject.position.y,
  VillagerUnit,
);

const NUMBER_OF_TREES = 50;
const HEIGHT_RATIO = 1 / 6;
spawner.spawnTreeLine(
  0,
  canvas.height / 2 - canvas.height * HEIGHT_RATIO,
  NUMBER_OF_TREES,
);
spawner.spawnTreeLine(
  canvas.width - 50 * TreeResource.WIDTH,
  canvas.height / 2 + canvas.height * HEIGHT_RATIO,
  NUMBER_OF_TREES,
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
    VillagerUnit,
  );
});

document.getElementById("createInf")?.addEventListener("click", () => {
  console.log("Creating Infantry");
  spawner.spawnUnit(
    player1,
    player1Building.gameObject.position.x - ProductionBuilding.WIDTH / 2 - 10,
    player1Building.gameObject.position.y,
    InfantryUnit,
  );
});

document.getElementById("createArch")?.addEventListener("click", () => {
  alert("Creating Archer: not implemented");
  console.log("Creating Archer");
});

const LEFT_MOUSE_BUTTON = 0;
const RIGHT_MOUSE_BUTTON = 2;
const MIDDLE_MOUSE_BUTTON = 1;

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

canvas.addEventListener("mousedown", (event) => {
  event.preventDefault();

  const bb = canvas.getBoundingClientRect();
  const x = Math.floor(((event.clientX - bb.left) / bb.width) * canvas.width);
  const y = Math.floor(((event.clientY - bb.top) / bb.height) * canvas.height);

  if (event.button === RIGHT_MOUSE_BUTTON) {
    handleRightClick(x, y);
  }

  if (event.button === LEFT_MOUSE_BUTTON) {
    handleLeftClick(x, y);
  }
});

function handleLeftClick(x: number, y: number) {
  console.log("Left click", { x, y });
}

function handleRightClick(x: number, y: number) {
  console.log("Right click", { x, y });
  for (const unit of gameState.selection) {
    unit.wayPoint.position.set({ x, y });
  }
}
