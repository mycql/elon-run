import Phaser, { Physics } from "phaser";

import PlayerFactory, { Player } from "../entities/player";
import WorldFactory, { World } from "../entities/world";
import ObstacleFactory from "../entities/obstacle";
import HealthBarFactory from "../entities/healthbar";

import { PlayerEvent } from "../shared/events";

import { AssetManager, UITextureKey, IMAGE_ASSET_PATH } from "../shared";

const SceneAssetManager: AssetManager = {
  load(scene) {
    scene.load.atlas(
      UITextureKey.UI,
      `${IMAGE_ASSET_PATH}/ui/ui.png`,
      `${IMAGE_ASSET_PATH}/ui/ui.json`,
    );
  },
};

class PlayScene extends Phaser.Scene {
  private _world!: World;
  private _player!: Player;
  private _spaceKey?: Phaser.Input.Keyboard.Key;

  preload() {
    SceneAssetManager.load(this);
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

    self.physics.add.collider(player.gameRef, ground, () => {
      self.events.emit(PlayerEvent.HIT_GROUND);
    });

    let lastCollideObjectId: string | undefined | null;
    type ColliderParams = Parameters<typeof self.physics.add.collider>;
    const broadcastObstacleCollision: ColliderParams[2] = (_, obstacle) => {
      const obstacleId = (
        obstacle as Phaser.Types.Physics.Arcade.GameObjectWithBody
      )?.name;
      lastCollideObjectId = obstacleId;
      self.events.emit(PlayerEvent.HIT_OBSTACLE);
    };
    const shouldBroadcastObstacleCollision: ColliderParams[3] = (
      _,
      obstacle,
    ) => {
      const obstacleId = (
        obstacle as Phaser.Types.Physics.Arcade.GameObjectWithBody
      )?.name;
      return obstacleId !== lastCollideObjectId;
    };

    const obstacles = ObstacleFactory.create(scene, ground);
    self.physics.add.collider(obstacles.gameRef, ground);
    self.physics.add.collider(
      player.gameRef,
      obstacles.gameRef,
      broadcastObstacleCollision,
      shouldBroadcastObstacleCollision,
    );
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
