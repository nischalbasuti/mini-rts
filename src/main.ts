import { initPointer, load, Sprite, SpriteSheet, init, GameLoop } from "kontra";
import { GameState } from "./GameState";
import { Player } from "./Player";
import { InfantryUnit } from "./gameObjects/units/InfantryUnit";
import { VillagerUnit } from "./gameObjects/units/VillagerUnit";
import { TreeResource } from "./gameObjects/resources/TreeResource";
import { ProductionBuilding } from "./gameObjects/buildings/ProductionBuilding";
import { Spawner } from "./Spawner";
import { Renderer } from "./Renderer";

import type { Unit } from "./gameObjects/units/Unit";

import swordsmanSpriteSheetPath from "./assets/swordsman.png";
import villagerSpriteSheetPath from "./assets/swordsman.png";

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

function main() {
  const player1 = new Player("Player 1", "blue");
  gameState.players.push(player1);
  const player1Building = spawner.spawnProductionBuilding(
    player1,
    canvas.width - ProductionBuilding.WIDTH,
    canvas.height - ProductionBuilding.HEIGHT,
  );
  spawner.spawnUnit(
    player1,
    player1Building.gameObject.position.x + ProductionBuilding.WIDTH / 2 + 10,
    player1Building.gameObject.position.y,
    VillagerUnit,
  );
  spawner.spawnUnit(
    player1,
    player1Building.gameObject.position.x - ProductionBuilding.WIDTH / 2 - 10,
    player1Building.gameObject.position.y,
    InfantryUnit,
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
  const TREE_LINE_HEIGHT_RATIO = 1 / 6;

  const GOLD_MINE_HEIGHT_RATIO = 1 / 3;
  const GOLD_MINE_WIDTH_RATIO = 1 / 5;
  const NUMBER_OF_GOLD = 20;

  spawner.spawnTreeLine(
    0,
    canvas.height / 2 - canvas.height * TREE_LINE_HEIGHT_RATIO,
    NUMBER_OF_TREES,
  );

  spawner.spawnTreeLine(
    canvas.width - 50 * TreeResource.WIDTH,
    canvas.height / 2 + canvas.height * TREE_LINE_HEIGHT_RATIO,
    NUMBER_OF_TREES,
  );

  spawner.spawnGoldCluster(
    canvas.width / 2,
    canvas.height / 2,
    NUMBER_OF_GOLD * 2,
    3,
  ); // middle of map
  spawner.spawnGoldCluster(
    canvas.width / 2 - canvas.width * GOLD_MINE_WIDTH_RATIO,
    canvas.height / 2 - canvas.height * GOLD_MINE_HEIGHT_RATIO,
    NUMBER_OF_GOLD,
    2,
  ); // top of map
  spawner.spawnGoldCluster(
    canvas.width / 2 + canvas.width * GOLD_MINE_WIDTH_RATIO,
    canvas.height / 2 + canvas.height * GOLD_MINE_HEIGHT_RATIO,
    NUMBER_OF_GOLD,
    2,
  ); // bottom of map

  let loop = GameLoop({
    blur: true,
    update: function () {
      gameState.update();
    },
    render: function () {
      renderer.render();
      SelectionBox.getInstance().sprite.render();
    },
  });

  loop.start();

  document.getElementById("createVillager")?.addEventListener("click", () => {
    console.log("Creating Villager");

    const spawnedUnit = spawner.spawnUnit(
      player1,
      player1Building.gameObject.position.x,
      player1Building.gameObject.position.y,
      VillagerUnit,
    );

    spawnedUnit.wayPoint.position.set({
      x: player1Building.wayPoint.position.x,
      y: player1Building.wayPoint.position.y,
    });
  });

  document.getElementById("createInf")?.addEventListener("click", () => {
    console.log("Creating Infantry");
    const spawnedUnit = spawner.spawnUnit(
      player1,
      player1Building.gameObject.position.x,
      player1Building.gameObject.position.y,
      InfantryUnit,
    );

    spawnedUnit.wayPoint.position.set({
      x: player1Building.wayPoint.position.x,
      y: player1Building.wayPoint.position.y,
    });
  });

  document.getElementById("createArch")?.addEventListener("click", () => {
    alert("Creating Archer: not implemented");
    console.log("Creating Archer");
  });

  const LEFT_MOUSE_BUTTON = 0;
  const RIGHT_MOUSE_BUTTON = 2;

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  let isDragging = false;
  let startX: number;
  let startY: number;
  let currentX: number;
  let currentY: number;

  canvas.addEventListener("mousedown", (event) => {
    event.preventDefault();

    const bb = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - bb.left) / bb.width) * canvas.width);
    const y = Math.floor(
      ((event.clientY - bb.top) / bb.height) * canvas.height,
    );

    if (event.button === LEFT_MOUSE_BUTTON) {
      isDragging = true;
      startX = x;
      startY = y;
      currentX = x;
      currentY = y;
    }

    if (event.button === RIGHT_MOUSE_BUTTON) {
      handleRightClick(x, y);
    }
  });

  canvas.addEventListener("mousemove", (event) => {
    if (isDragging) {
      const bb = canvas.getBoundingClientRect();
      currentX = Math.floor(
        ((event.clientX - bb.left) / bb.width) * canvas.width,
      );
      currentY = Math.floor(
        ((event.clientY - bb.top) / bb.height) * canvas.height,
      );

      if (Math.abs(currentX - startX) > 5 && Math.abs(currentY - startY) > 5) {
        gameState.clearSelection();
      }

      const selectionBox = SelectionBox.getInstance();
      selectionBox.update(startX, startY, currentX, currentY);
    }
  });

  canvas.addEventListener("mouseup", (_event) => {
    if (isDragging) {
      isDragging = false;

      const selectionBox = SelectionBox.getInstance();

      const units = gameState.players.flatMap((player: Player) => player.units);

      for (const unit of units) {
        if (selectionBox.isIntersecting(unit)) {
          gameState.selectUnit(unit);
          unit.isSelected = true;
        }
      }

      selectionBox.dispose();
    }
  });

  class SelectionBox {
    private static instance: SelectionBox;

    static getInstance() {
      if (!SelectionBox.instance) {
        SelectionBox.instance = new SelectionBox();
      }
      return SelectionBox.instance;
    }

    sprite: Sprite;

    rectangle: {
      left: number;
      right: number;
      top: number;
      bottom: number;
      width: number;
      height: number;
    } | null;

    private constructor() {
      this.sprite = Sprite({
        color: "rgba(255, 255, 0, 0.5)",
        width: 0,
        height: 0,
        anchor: { x: 0, y: 0 },
      });
      this.rectangle = null;
    }

    update(x1: number, y1: number, x2: number, y2: number) {
      this.rectangle = {
        left: Math.min(x1, x2),
        right: Math.max(x1, x2),
        top: Math.min(y1, y2),
        bottom: Math.max(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      };

      this.sprite.x = this.rectangle.left;
      this.sprite.y = this.rectangle.top;
      this.sprite.width = this.rectangle.width;
      this.sprite.height = this.rectangle.height;
    }

    isIntersecting(unit: Unit | ProductionBuilding): boolean {
      if (!this.rectangle) return false;

      const unitRect = {
        left:
          unit.gameObject.x -
          (unit.gameObject.width / 2 || unit.gameObject.radius),
        right:
          unit.gameObject.x +
          (unit.gameObject.width / 2 || unit.gameObject.radius),
        top:
          unit.gameObject.y -
          (unit.gameObject.height / 2 || unit.gameObject.radius),
        bottom:
          unit.gameObject.y +
          (unit.gameObject.height / 2 || unit.gameObject.radius),
      };

      return (
        this.rectangle.left < unitRect.right &&
        this.rectangle.right > unitRect.left &&
        this.rectangle.top < unitRect.bottom &&
        this.rectangle.bottom > unitRect.top
      );
    }

    dispose() {
      this.sprite.width = 0;
      this.sprite.height = 0;
      this.rectangle = null;
    }
  }

  function handleRightClick(x: number, y: number) {
    console.log("Right click", { x, y });
    for (const unit of gameState.selection) {
      unit.wayPoint.position.set({ x, y });
    }
  }
}

load(swordsmanSpriteSheetPath, villagerSpriteSheetPath).then(() => {
  let swordsmanImage = new Image();
  swordsmanImage.src = swordsmanSpriteSheetPath;
  swordsmanImage.onload = function () {
    InfantryUnit.SPRITE_SHEET = SpriteSheet({
      image: swordsmanImage,
      frameWidth: 32,
      frameHeight: 32,
      animations: {
        idle: {
          frames: [0, 1, 3, 5, 7], // random shiz lol
          frameRate: 2,
        },
        moving: {
          frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
          frameRate: 20,
        },
        attacking: {
          frames: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 18, 20],
          frameRate: 20,
        },
      },
    });
  };

  let villagerImage = new Image();
  villagerImage.src = villagerSpriteSheetPath;
  villagerImage.onload = function () {
    VillagerUnit.SPRITE_SHEET = SpriteSheet({
      image: villagerImage,
      frameWidth: 32,
      frameHeight: 32,
      animations: {
        idle: {
          frames: [0, 1, 3, 5, 7], // random shiz lol
          frameRate: 2,
        },
        moving: {
          frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
          frameRate: 20,
        },
        attacking: {
          frames: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 18, 20],
          frameRate: 20,
        },
      },
    });

  main();
  };

});
