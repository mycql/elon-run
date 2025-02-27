import Phaser from "phaser";

import { PlayerEvent } from "../shared/events";
import { IMAGE_ASSET_PATH } from "../shared";

enum TextureKey {
  PLAYER = "player",
  IDLE = "idle",
  JUMP = "jump",
  RUN = "run",
  LAND = "land",
  HEAD = "head",
}

enum AnimationKey {
  RUN = "run",
}

enum AudioKey {
  OUCH = "ouch",
}

export interface Player {
  gameRef: Phaser.Physics.Arcade.Sprite;
  run(): void;
  pause(): void;
  jump(): void;
  hit(): void;
  resume(): void;
  update(): void;
}

export interface PlayerFactory {
  load(scene: Phaser.Scene): void;
  create(scene: Phaser.Scene, ground: Phaser.GameObjects.Shape): Player;
}

export const playerFactory: PlayerFactory = {
  load(scene) {
    scene.load.audio(AudioKey.OUCH, "assets/audio/ouchy.mp3");
    scene.load.atlas(
      TextureKey.HEAD,
      `${IMAGE_ASSET_PATH}/player/head.png`,
      `${IMAGE_ASSET_PATH}/player/head.json`,
    );
    scene.load.atlas(
      TextureKey.PLAYER,
      `${IMAGE_ASSET_PATH}/player/player.png`,
      `${IMAGE_ASSET_PATH}/player/player.json`,
    );
  },
  create(scene, ground) {
    let health = 5;
    const sprite = scene.physics.add
      .sprite(0, 0, TextureKey.PLAYER, TextureKey.IDLE)
      .setScale(0.7)
      .setBounce(0.2)
      .setCollideWorldBounds(true);
    const {
      x: groundX,
      y: groundY,
      halfWidth: halfGroundWidth,
      halfHeight: halfGroundHeight,
    } = ground.body as Phaser.Physics.Arcade.Body;
    const { halfWidth: halfPlayerWidth, halfHeight: halfPlayerHeight } =
      sprite.body as Phaser.Physics.Arcade.Body;
    const playerX = groundX - halfGroundWidth + halfPlayerWidth;
    const playerY = groundY - halfGroundHeight - halfPlayerHeight;
    sprite.setX(playerX);
    sprite.setY(playerY);

    const headSprite = scene.add
      .sprite(0, 0, TextureKey.HEAD, TextureKey.HEAD)
      .setScale(0.85);

    const ouch = scene.sound.add(AudioKey.OUCH);
    const running = sprite.anims.create({
      key: AnimationKey.RUN,
      frameRate: 8,
      frames: sprite.anims.generateFrameNames(TextureKey.PLAYER, {
        prefix: TextureKey.RUN,
        start: 0,
        end: 2,
      }),
      repeat: -1,
    }) as Phaser.Animations.Animation;

    const isJumping = (): boolean => {
      return sprite.frame.name === TextureKey.JUMP;
    };

    const isRunning = (): boolean => {
      return !running.paused;
    };

    const run = (): void => {
      sprite.setFrame(TextureKey.IDLE);
      sprite.play(AnimationKey.RUN);
    };
    const pause = (): void => {
      running.pause();
    };
    const resume = (): void => {
      running.resume();
    };
    const jump = (): void => {
      if (isJumping()) {
        return;
      }
      pause();
      sprite.setFrame(TextureKey.JUMP);
      sprite.setVelocityY(-200);
    };
    const healthChanged = (): void => {
      scene.events.emit(PlayerEvent.HEALTH_CHANGED, health);
    };
    const hit = (): void => {
      health--;
      healthChanged();
      ouch.play();
    };
    const update = (): void => {
      headSprite.setY(sprite.y - 12);
      if (isJumping()) {
        const isGoingToLand =
          sprite.body.deltaY() > 0 &&
          sprite.body.facing === Phaser.Physics.Arcade.FACING_DOWN;
        if (isGoingToLand) {
          headSprite.setY(sprite.y);
          headSprite.setX(sprite.x + 2);
          headSprite.setAngle(5);
          sprite.setFrame(TextureKey.LAND);
        } else {
          headSprite.setY(sprite.y - 18);
          headSprite.setX(sprite.x - 2);
          headSprite.setAngle(-10);
        }
      } else if (isRunning()) {
        headSprite.setX(sprite.x + 6);
        headSprite.setAngle(10);
      }
    };

    scene.input.on("pointerdown", () => {
      jump();
    });
    scene.events.on(PlayerEvent.JUMP, () => {
      jump();
    });
    scene.events.on(PlayerEvent.HIT_GROUND, () => {
      resume();
    });
    scene.events.on(PlayerEvent.HIT_OBSTACLE, () => {
      hit();
    });

    healthChanged();
    run();

    return {
      gameRef: sprite,
      run,
      jump,
      pause,
      resume,
      hit,
      update,
    };
  },
};

export default playerFactory;
