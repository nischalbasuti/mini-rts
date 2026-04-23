import { initPointer, load, Sprite, SpriteSheet, init, GameLoop } from "kontra";
import { GameState } from "./GameState";
import { Player } from "./Player";
import { InfantryUnit } from "./gameObjects/units/InfantryUnit";
import { VillagerUnit } from "./gameObjects/units/VillagerUnit";
import { ProductionBuilding } from "./gameObjects/buildings/ProductionBuilding";
import { Spawner } from "./Spawner";
import { Renderer } from "./Renderer";

import { Unit } from "./gameObjects/units/Unit";
import { TreeResource } from "./gameObjects/resources/TreeResource";
import { GoldResource } from "./gameObjects/resources/GoldResource";
import { CELL_SIZE, GRID_COLS, GRID_ROWS, pixelToGrid, gridToPixel, getFootprintCells, isAdjacentToFootprint, GridPoint } from "./pathing/Grid";
import { findPath } from "./pathing/AStar";
import { assignGroupDestinations, findAdjacentWalkableCells, assignClosestCells } from "./pathing/GroupMovement";

import swordsmanSpriteSheetPath from "./assets/swordsman.png";
import villagerSpriteSheetPath from "./assets/villager.png";
import castleSpriteSheetPath from "./assets/castle.png";

let { canvas } = init();

const gameState = GameState.getInstance(canvas);
const spawner = new Spawner(gameState);
const renderer = new Renderer(gameState);

// @ts-ignore
window.renderer = renderer;

/**
 * Handle scroll wheel for zoom.
 */
canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  let zoomDelta = event.deltaY * 0.001;
  let zoom = Math.max(0.25, Math.min(4, renderer.zoom - zoomDelta));
  renderer.applyZoom(zoom);
}, {
  passive: false,
});

initPointer();

/**
 * Camera offset for panning.
 */
let offsetX = 0;
let offsetY = 0;

/**
 * Handle arrow keys for camera panning.
 */
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    offsetX -= 5 * renderer.zoom;
    renderer.applyOffset(offsetX, offsetY);
  } else if (event.key === "ArrowRight") {
    offsetX += 5 * renderer.zoom;
    renderer.applyOffset(offsetX, offsetY);
  } else if (event.key === "ArrowUp") {
    offsetY -= 5 * renderer.zoom;
    renderer.applyOffset(offsetX, offsetY);
  } else if (event.key === "ArrowDown") {
    offsetY += 5 * renderer.zoom;
    renderer.applyOffset(offsetX, offsetY);
  }
});

/**
 * Handle window resize to keep canvas dimensions updated.
 */
window.addEventListener("resize", () => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
});

declare global {
  interface Window {
    gameState: GameState;
  }
}
window.gameState = gameState;

/**
 * Initialize the game.
 */
function main() {
  const player1 = new Player("Player 1", "blue");
  gameState.players.push(player1);
  const player1Building = spawner.spawnProductionBuilding(
    player1,
    (GRID_COLS - 2) * CELL_SIZE,
    (GRID_ROWS - 2) * CELL_SIZE,
  );
  player1Building.wayPoint.position.set({x: 600, y: 550})
  spawnUnitFromBuilding(player1Building, player1, VillagerUnit);
  spawnUnitFromBuilding(player1Building, player1, InfantryUnit);

  const player2 = new Player("Player 2", "red");
  gameState.players.push(player2);
  const player2Building = spawner.spawnProductionBuilding(
    player2,
    2 * CELL_SIZE,
    2 * CELL_SIZE,
  );
  player2Building.wayPoint.position.set({x: 230, y: 70})
  spawnUnitFromBuilding(player2Building, player2, InfantryUnit);
  spawnUnitFromBuilding(player2Building, player2, VillagerUnit);

  // Tree lines — left side and right side barriers
  spawner.spawnTreeLine(
    canvas.width * 0.05,
    canvas.height * 0.35,
    5,
  );

  spawner.spawnTreeLine(
    canvas.width - 4 * 1.5 * 32,
    canvas.height * 0.65,
    5,
  );

  // Gold clusters — symmetric for both players + larger middle
  spawner.spawnGoldCluster(
    canvas.width * 0.2,
    canvas.height * 0.2,
    4,
    3,
  ); // top-left near player 2
  spawner.spawnGoldCluster(
    canvas.width * 0.8,
    canvas.height * 0.8,
    4,
    3,
  ); // bottom-right near player 1
  spawner.spawnGoldCluster(
    canvas.width / 2,
    canvas.height / 2,
    6,
    3,
  ); // middle of map, larger

  let loop = GameLoop({
    blur: true,
    update: function () {
      gameState.update();
    },
    render: function () {
      renderer.render();
      const selectionBox = SelectionBox.getInstance();
      if (selectionBox.rectangle) {
        selectionBox.sprite.render();
      }
      updateSelectionPanel();
      updateResourceDisplay();
    },
  });

  const woodCountEl = document.getElementById("woodCount")!;
  const goldCountEl = document.getElementById("goldCount")!;

  function updateResourceDisplay() {
    const player = gameState.players[0];
    if (!player) return;
    woodCountEl.textContent = `Wood: ${player.wood}`;
    goldCountEl.textContent = `Gold: ${player.gold}`;
  }

  loop.start();

  // Debug mode toggle
  document.addEventListener("keydown", (event) => {
    if (event.key === "g") {
      gameState.debugMode = !gameState.debugMode;
    }
  });

  /**
 * Spawn a unit from a production building and move it to the building's way point.
 */
function spawnUnitFromBuilding(
    building: ProductionBuilding,
    player: Player,
    unitType: typeof InfantryUnit | typeof VillagerUnit,
  ) {
    const spawnedUnit = spawner.spawnUnit(
      player,
      building.gameObject.position.x,
      building.gameObject.position.y,
      unitType,
    );

    const start = pixelToGrid(spawnedUnit.gameObject.x, spawnedUnit.gameObject.y);
    const goal = pixelToGrid(building.wayPoint.x, building.wayPoint.y);
    const path = findPath(gameState.grid, start, goal);
    if (path && path.length > 0) {
      spawnedUnit.setPath(path);
    }

    return spawnedUnit;
  }

  document.getElementById("createVillager")?.addEventListener("click", () => {
    console.log("Creating Villager");
    spawnUnitFromBuilding(player1Building, player1, VillagerUnit);
  });

  document.getElementById("createInf")?.addEventListener("click", () => {
    console.log("Creating Infantry");
    spawnUnitFromBuilding(player1Building, player1, InfantryUnit);
  });

  document.getElementById("createArch")?.addEventListener("click", () => {
    alert("Creating Archer: not implemented");
    console.log("Creating Archer");
  });

  /**
   * Finds an entity at the given point.
   */
  function entityAtPoint<T extends { gameObject: { x: number; y: number; width: number; height: number; radius: number } }>(entities: T[], x: number, y: number): T | null {
    for (const entity of entities) {
      const go = entity.gameObject;
      const hw = (go.width || go.radius * 2) / 2;
      const hh = (go.height || go.radius * 2) / 2;
      if (x >= go.x - hw && x <= go.x + hw && y >= go.y - hh && y <= go.y + hh) {
        return entity;
      }
    }
    return null;
  }

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
    const x = Math.floor(((event.clientX - bb.left) / bb.width) * canvas.width / renderer.zoom + offsetX);
    const y = Math.floor(
      ((event.clientY - bb.top) / bb.height) * canvas.height / renderer.zoom + offsetY,
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
        ((event.clientX - bb.left) / bb.width) * canvas.width / renderer.zoom + offsetX,
      );
      currentY = Math.floor(
        ((event.clientY - bb.top) / bb.height) * canvas.height / renderer.zoom + offsetY,
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
      const isClick = Math.abs(currentX - startX) <= 5 && Math.abs(currentY - startY) <= 5;

      if (isClick) {
        // Click (not drag): clear selection if clicking blank space
        const buildings = gameState.players.flatMap((player: Player) => player.buildings);
        if (!entityAtPoint(units, currentX, currentY) && !entityAtPoint(buildings, currentX, currentY)) {
          gameState.clearSelection();
        }
      } else {
        // Drag: marquee select
        for (const unit of units) {
          if (selectionBox.isIntersecting(unit)) {
            gameState.select(unit);
            unit.isSelected = true;
          }
        }
      }

      selectionBox.dispose();
    }
  });

  canvas.addEventListener("dblclick", (event) => {
    const bb = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - bb.left) / bb.width) * canvas.width / renderer.zoom + offsetX);
    const y = Math.floor(((event.clientY - bb.top) / bb.height) * canvas.height / renderer.zoom + offsetY);

    const allUnits = gameState.players.flatMap((player: Player) => player.units);
    const clicked = entityAtPoint(allUnits, x, y);
    if (!clicked) return;

    gameState.clearSelection();
    const sameTypeUnits = clicked.player.units.filter(
      (u) => u.constructor === clicked.constructor
    );
    for (const unit of sameTypeUnits) {
      gameState.select(unit);
      unit.isSelected = true;
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

  const selectionDetailsEl = document.getElementById("selectionDetails")!;

  function updateSelectionPanel() {
    if (gameState.selection.size === 0) {
      selectionDetailsEl.innerHTML = "";
      return;
    }

    if (gameState.selection.size === 1) {
      const entity = gameState.selection.values().next().value!;

      if (entity instanceof Unit) {
        const name = entity instanceof VillagerUnit ? "Villager" : "Infantry";
        let lines = [
          `<b>${name}</b>`,
          `Player: ${entity.player.name}`,
          `HP: ${entity.currentHp} / ${entity.baseHp}`,
          `Speed: ${entity.baseSpeed}`,
          `Attack: ${entity.baseAttack}`,
          `Range: ${entity.baseRange}`,
          `Action: ${entity.currentAction?.type ?? "idle"}`,
        ];
        if (entity instanceof VillagerUnit && entity.carriedResource) {
          lines.push(`Carried: ${entity.carriedResource.amount} ${entity.carriedResource.type}`);
        }
        selectionDetailsEl.innerHTML = lines.join("<br>");
      } else if (entity instanceof ProductionBuilding) {
        selectionDetailsEl.innerHTML = [
          `<b>Barracks</b>`,
          `Player: ${entity.player.name}`,
          `HP: ${entity.currentHp} / ${entity.baseHp}`,
        ].join("<br>");
      } else if (entity instanceof TreeResource) {
        selectionDetailsEl.innerHTML = [
          `<b>Tree</b>`,
          `Quantity: ${entity.currentQuantity} / ${entity.baseQuantity}`,
        ].join("<br>");
      } else if (entity instanceof GoldResource) {
        selectionDetailsEl.innerHTML = [
          `<b>Gold</b>`,
          `Quantity: ${entity.currentQuantity} / ${entity.baseQuantity}`,
        ].join("<br>");
      }
      return;
    }

    // Multi-selection
    let unitCount = 0;
    let buildingCount = 0;
    for (const entity of gameState.selection) {
      if (entity instanceof Unit) unitCount++;
      else if (entity instanceof ProductionBuilding) buildingCount++;
    }
    const parts: string[] = [];
    if (unitCount > 0) parts.push(`${unitCount} unit${unitCount > 1 ? "s" : ""}`);
    if (buildingCount > 0) parts.push(`${buildingCount} building${buildingCount > 1 ? "s" : ""}`);
    selectionDetailsEl.innerHTML = `<b>${parts.join(", ")} selected</b>`;
  }

  /**
   * Handle right-click events for actions like deselect or movement cancel.
   */
  function handleRightClick(x: number, y: number) {
    console.log("Right click", { x, y });

    const units: Unit[] = [];
    for (const selected of gameState.selection) {
      if (selected instanceof Unit) {
        units.push(selected);
      } else if (selected instanceof ProductionBuilding) {
        selected.wayPoint.position.set({ x, y });
      }
    }

    if (units.length === 0) return;

    const grid = gameState.grid;
    const clickCell = pixelToGrid(x, y);
    const cell = grid.getCell(clickCell.col, clickCell.row);
    const occupant = cell?.getOccupying()
      ?? grid.getReservedCells().get(`${clickCell.col},${clickCell.row}`);

    if (occupant instanceof TreeResource || occupant instanceof GoldResource) {
      handleResourceClick(units, occupant);
    } else if (occupant instanceof Unit && occupant.player !== units[0].player) {
      handleEnemyClick(units, occupant);
    } else if (occupant instanceof ProductionBuilding && occupant.player !== units[0].player) {
      handleEnemyBuildingClick(units, occupant);
    } else {
      handleMoveClick(units, x, y);
    }
  }

  /**
   * Handle move click (drag/drop) to move selected units to a destination.
   */
  function handleMoveClick(units: Unit[], x: number, y: number) {
    const grid = gameState.grid;
    const destinations = assignGroupDestinations(grid, x, y, units.length);

    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const unitGridPos = pixelToGrid(unit.gameObject.x, unit.gameObject.y);
      const dest = destinations[i];
      if (!dest) continue;

      const path = findPath(grid, unitGridPos, dest);
      if (path && path.length > 0) {
        unit.setAction({ type: "move" }, path);
      }
    }
  }

  /**
   * Handle resource click (gathering or destroying).
   */
  function handleResourceClick(units: Unit[], target: TreeResource | GoldResource) {
    const grid = gameState.grid;
    const go = target.gameObject;
    const w = "WIDTH" in (target.constructor as any) ? (target.constructor as any).WIDTH : 32;
    const h = "HEIGHT" in (target.constructor as any) ? (target.constructor as any).HEIGHT : 32;
    const footprint = getFootprintCells(go.x, go.y, w, h);
    const allCandidates = findAdjacentWalkableCells(grid, go.x, go.y, w, h);
    const unitPositions = units.map(u => pixelToGrid(u.gameObject.x, u.gameObject.y));
    const assigned = assignClosestCells(allCandidates, unitPositions);

    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const unitGridPos = unitPositions[i];
      const dest = assigned[i];

      if (isAdjacentToFootprint(unitGridPos, footprint) && unit.canGather()) {
        unit.faceTarget(go);
        unit.setAction({ type: "gather", target });
        continue;
      }

      if (!dest) continue;
      const path = findPath(grid, unitGridPos, dest);
      if (path && path.length > 0) {
        if (unit.canGather()) {
          unit.setAction({ type: "gather", target }, path);
        } else {
          unit.setAction({ type: "move" }, path);
        }
      }
    }
  }

  /**
   * Handle enemy unit click (attack).
   */
  function handleEnemyClick(units: Unit[], target: Unit) {
    const grid = gameState.grid;
    const targetCell = pixelToGrid(target.gameObject.x, target.gameObject.y);
    const targetCenter = gridToPixel(targetCell.col, targetCell.row);
    const footprint: GridPoint[] = [targetCell];
    const allCandidates = findAdjacentWalkableCells(grid, targetCenter.x, targetCenter.y, CELL_SIZE, CELL_SIZE);
    const unitPositions = units.map(u => pixelToGrid(u.gameObject.x, u.gameObject.y));
    const assigned = assignClosestCells(allCandidates, unitPositions);

    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const unitGridPos = unitPositions[i];
      const dest = assigned[i];

      if (isAdjacentToFootprint(unitGridPos, footprint)) {
        unit.faceTarget(target.gameObject);
        unit.setAction({ type: "attack", target });
        continue;
      }

      if (!dest) continue;
      const path = findPath(grid, unitGridPos, dest);
      if (path && path.length > 0) {
        unit.setAction({ type: "attack", target }, path);
      }
    }
  }

  /**
   * Handle enemy building click (attack).
   */
  function handleEnemyBuildingClick(units: Unit[], target: ProductionBuilding) {
    const grid = gameState.grid;
    const go = target.gameObject;
    const footprint = getFootprintCells(go.x, go.y, ProductionBuilding.WIDTH, ProductionBuilding.HEIGHT);
    const allCandidates = findAdjacentWalkableCells(grid, go.x, go.y, ProductionBuilding.WIDTH, ProductionBuilding.HEIGHT);
    const unitPositions = units.map(u => pixelToGrid(u.gameObject.x, u.gameObject.y));
    const assigned = assignClosestCells(allCandidates, unitPositions);

    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const unitGridPos = unitPositions[i];
      const dest = assigned[i];

      if (isAdjacentToFootprint(unitGridPos, footprint)) {
        unit.faceTarget(go);
        unit.setAction({ type: "attack", target });
        continue;
      }

      if (!dest) continue;
      const path = findPath(grid, unitGridPos, dest);
      if (path && path.length > 0) {
        unit.setAction({ type: "attack", target }, path);
      }
    }
  }
}

/**
 * Load sprite sheets and start the game loop.
 */
load(swordsmanSpriteSheetPath, villagerSpriteSheetPath, castleSpriteSheetPath).then(() => {
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
        gathering: {
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
          frames: [9, 10, 11, 12, 13, 14],
          frameRate: 10,
        },
        gathering: {
          frames: [9, 10, 11, 12, 13, 14],
          frameRate: 6,
        },
      },
    });
  };

  let castleImage = new Image();
  castleImage.src = castleSpriteSheetPath;
  castleImage.onload = function () {
    ProductionBuilding.SPRITE_SHEET = SpriteSheet({
      image: castleImage,
      frameWidth: 64,
      frameHeight: 64,
      animations: {
        idle: {
          frames: [0],
          frameRate: 1,
        },
      },
    });

    main();
  };

});
