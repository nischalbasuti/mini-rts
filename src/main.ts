import kontra from "kontra";
import { GameState } from "./GameState";
import { Player } from "./Player";
import { Unit } from "./Unit";

let { init, Sprite, GameLoop } = kontra;

let { canvas } = init();

const gameState = GameState.getInstance(canvas);
const player1 = new Player("Player 1");
const player2 = new Player("Player 2");

const spriteConfig = {
      x: 100,
      y: canvas.height - 40 - 20,
      color: "red",
      width: 20,
      height: 40,
}
let sprite1 = Sprite(spriteConfig);
let sprite2 = Sprite({ ...spriteConfig, color: "blue", y: 20 });

let unit1 = new Unit(100, 10, 10, sprite1);
let unit2 = new Unit(100, 10, 10, sprite2);

player1.units.push(unit1)
player2.units.push(unit2)

gameState.players.push(player1);
gameState.players.push(player2);

let loop = GameLoop({
  update: function () {
    gameState.update();
  },
  render: function () {
    gameState.render();
  },
});

loop.start();
