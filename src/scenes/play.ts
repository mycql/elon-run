import Phaser from "phaser";

import PlayerFactory, { Player } from "../entities/player";
import WorldFactory, { World } from "../entities/world";
import ObstacleFactory from "../entities/obstacle";
import HealthBarFactory from "../entities/healthbar";

import { PlayerEvent } from "../events/event-types";

class PlayScene extends Phaser.Scene {
  private _world!: World;
  private _player!: Player;
  private _spaceKey?: Phaser.Input.Keyboard.Key;

  preload() {
    PlayerFactory.load(this);
    ObstacleFactory.load(this);
    WorldFactory.load(this);
    HealthBarFactory.load(this);
  }

  create() {
    const self = this;
    const world = WorldFactory.create(this);
    const { ground } = world;
    self._world = world;

    HealthBarFactory.create(scene);

    const player = PlayerFactory.create(this, ground);
    self._player = player;

    const groundStatic = self.physics.add.staticGroup();
    groundStatic.add(ground);
    self.physics.add.collider(player.gameRef, groundStatic, () => {
      self.events.emit(PlayerEvent.HIT_GROUND);
    });

    const obstacles = ObstacleFactory.create(scene, ground);

    self.physics.add.collider(obstacles.gameRef, groundStatic);
    self.physics.add.collider(player.gameRef, obstacles.gameRef, () => {
      self.events.emit(PlayerEvent.HIT_OBSTACLE);
    });
    const spaceKey = self.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
    self._spaceKey = spaceKey;
  }

  update() {
    const self = this;
    self._world.update();
    self._player.update();
    const spaceKey = self._spaceKey;
    if (spaceKey) {
      if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        self.events.emit(PlayerEvent.JUMP);
      }
    }
  }
}

const scene = new PlayScene();

export default scene;
