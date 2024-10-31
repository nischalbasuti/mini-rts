import kontra from "kontra";
import { GameState } from "./GameState";
import { Player } from "./Player";
import { InfantryUnit } from "./InfantryUnit";

let { init, GameLoop } = kontra;

let { canvas } = init();

const gameState = GameState.getInstance(canvas);

//@ts-ignore
window.gameState = gameState;

const player1 = new Player("Player 1", "blue");
const infantry1 = new InfantryUnit(player1, 100, canvas.height - 40 - 20);
player1.units.push(infantry1)
gameState.players.push(player1);

const player2 = new Player("Player 2", "red");
let infantry2 = new InfantryUnit(player2, 100, 40 + 10);
player2.units.push(infantry2)
gameState.players.push(player2);

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
