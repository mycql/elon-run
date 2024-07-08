import Phaser from "phaser";

import { half } from "../util";

enum TextureKey {
  JUMP = "jump",
  RUN = "run",
  LAND = "land",
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
    const frameWidth = 21;
    const frameHeight = 33;
    scene.load.spritesheet(TextureKey.RUN, "assets/image/player/run.png", {
      frameWidth,
      frameHeight,
    });
    scene.load.image(TextureKey.JUMP, "assets/image/player/jump.png");
    scene.load.image(TextureKey.LAND, "assets/image/player/land.png");
    scene.load.audio(AudioKey.OUCH, "assets/audio/ouchy.mp3");
  },
  create(scene, ground) {
    const sprite = scene.physics.add.sprite(0, 0, TextureKey.RUN);
    sprite.setScale(2).refreshBody();
    sprite.setBounce(0.2);
    sprite.setCollideWorldBounds(true);
    const {
      x: groundX,
      y: groundY,
      width: groundWidth,
      height: groundHeight,
    } = ground;
    const { displayWidth: playerWidth, displayHeight: playerHeight } = sprite;
    const playerX = groundX - half(groundWidth) + half(playerWidth);
    const playerY = groundY - half(groundHeight) - half(playerHeight);
    sprite.setX(playerX);
    sprite.setY(playerY);
    const ouch = scene.sound.add(AudioKey.OUCH);
    const running = scene.anims.create({
      key: AnimationKey.RUN,
      frameRate: 10,
      frames: scene.anims.generateFrameNumbers(TextureKey.RUN, {
        start: 0,
        end: 7,
      }),
      repeat: -1,
    }) as Phaser.Animations.Animation;

    const isJumping = (): boolean => {
      return sprite.texture.key === TextureKey.JUMP;
    };

    const run = (): void => {
      sprite.play(AnimationKey.RUN);
      sprite.setTexture(TextureKey.RUN);
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
      sprite.setTexture(TextureKey.JUMP);
      sprite.setVelocityY(-300);
    };
    const hit = (): void => {
      ouch.play();
    };
    const update = (): void => {
      if (isJumping()) {
        const isGoingToLand =
          sprite.body.deltaY() > 0 &&
          sprite.body.facing === Phaser.Physics.Arcade.FACING_DOWN;
        if (isGoingToLand) {
          sprite.setTexture(TextureKey.LAND);
        }
      }
    };

    scene.input.on("pointerdown", () => {
      jump();
    });
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
