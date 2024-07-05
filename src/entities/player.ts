import Phaser from "phaser";

import { half } from "../util";

export interface Player {
  gameRef: Phaser.Physics.Arcade.Sprite;
  run(): void;
  pause(): void;
  jump(): void;
  hit(): void;
  resume(): void;
}

export interface PlayerFactory {
  load(scene: Phaser.Scene): void;
  create(scene: Phaser.Scene, ground: Phaser.GameObjects.Shape): Player;
}

export const playerFactory: PlayerFactory = {
  load(scene) {
    scene.load.spritesheet("player", "assets/image/player.png", {
      frameWidth: 21,
      frameHeight: 33,
    });
    scene.load.audio("ouch", "assets/audio/ouchy.mp3");
  },
  create(scene, ground) {
    let jumping = false;
    const sprite = scene.physics.add.sprite(0, 0, "player");
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
    const ouch = scene.sound.add("ouch");
    const animation = scene.anims.create({
      key: "run",
      frameRate: 10,
      frames: scene.anims.generateFrameNumbers("player", { start: 0, end: 7 }),
      repeat: -1,
    }) as Phaser.Animations.Animation;

    const run = (): void => {
      jumping = true;
      sprite.play("run");
    };
    const pause = (): void => {
      animation.pause();
    };
    const resume = (): void => {
      jumping = false;
      animation.resume();
    };
    const jump = (): void => {
      if (jumping) {
        return;
      }
      jumping = true;
      pause();
      sprite.setVelocityY(-300);
    };
    const hit = (): void => {
      ouch.play();
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
    };
  },
};
