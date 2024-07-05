import Phaser from "phaser";

import { Player, playerFactory as PlayerFactory } from "./entities/player";
import { obstacleFactory as ObstacleFactory } from "./entities/obstacle";
import { World, worldFactory as WorldFactory } from "./entities/world";

const physics: Phaser.Types.Core.PhysicsConfig = {
  default: "arcade",
  arcade: {
    gravity: {
      y: 300,
      x: 0,
    },
    debug: true,
  },
};

class GameScene extends Phaser.Scene {
  private _world!: World;
  private _player!: Player;
  private _spaceKey?: Phaser.Input.Keyboard.Key;

  preload() {
    PlayerFactory.load(this);
    ObstacleFactory.load(this);
    WorldFactory.load(this);
  }

  create() {
    const world = WorldFactory.create(this);
    const { ground } = world;
    this._world = world;

    const player = PlayerFactory.create(this, ground);
    player.run();
    this._player = player;

    const groundStatic = this.physics.add.staticGroup();
    groundStatic.add(ground);
    this.physics.add.collider(player.gameRef, groundStatic, () => {
      player.resume();
    });

    const obstacles = ObstacleFactory.create(scene, ground);

    this.physics.add.collider(obstacles.gameRef, groundStatic);
    this.physics.add.collider(player.gameRef, obstacles.gameRef, () => {
      this._player.hit();
    });

    const spaceKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
    this._spaceKey = spaceKey;
  }

  update() {
    this._world.update();
    const spaceKey = this._spaceKey;
    if (spaceKey) {
      if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        this._player.jump();
      }
    }
  }
}

const scene = new GameScene();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 600,
  height: 300,
  parent: "app",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene,
  physics,
};

new Phaser.Game(config);
