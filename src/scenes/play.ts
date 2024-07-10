import Phaser from "phaser";

import { Player, playerFactory as PlayerFactory } from "../entities/player";
import { obstacleFactory as ObstacleFactory } from "../entities/obstacle";
import { World, worldFactory as WorldFactory } from "../entities/world";

class PlayScene extends Phaser.Scene {
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
    this._player.update();
    const spaceKey = this._spaceKey;
    if (spaceKey) {
      if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        this._player.jump();
      }
    }
  }
}

const scene = new PlayScene();

export default scene;
