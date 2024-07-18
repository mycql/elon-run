import Phaser from "phaser";

import { half } from "../util";

export interface World {
  ground: Phaser.GameObjects.Shape;
  update(): void;
}

export interface WorldFactory {
  load(scene: Phaser.Scene): void;
  create(scene: Phaser.Scene): World;
}

export const worldFactory: WorldFactory = {
  load(scene) {
    scene.load.image("sky", "assets/image/background/sky.png");
    scene.load.image("clouds", "assets/image/background/clouds.png");
    scene.load.image("horizon", "assets/image/background/horizon.png");
    scene.load.image("meadow", "assets/image/background/meadow.png");
  },
  create(scene) {
    const gameWidth = scene.sys.game.config.width as number;
    const gameHeight = scene.sys.game.config.height as number;
    const centerX = half(gameWidth);
    const centerY = half(gameHeight);
    const worldWidth = gameWidth;
    const worldHeight = gameHeight;
    const worldX = centerX;
    const worldY = centerY;
    const sky = scene.add.tileSprite(
      worldX,
      worldY,
      worldWidth,
      worldHeight,
      "sky",
    );
    const horizon = scene.add.tileSprite(
      worldX,
      worldY,
      worldWidth,
      worldHeight,
      "horizon",
    );
    const meadow = scene.add.tileSprite(
      worldX,
      worldY,
      worldWidth,
      worldHeight,
      "meadow",
    );
    const groundX = meadow.x;
    const groundY = meadow.y + 110;
    const groundWidth = meadow.width - 20;
    const groundHeight = 10;
    const ground = scene.add.rectangle(
      groundX,
      groundY,
      groundWidth,
      groundHeight,
    );
    const update = (): void => {
      const skyVelocity = 1;
      const horizonVelocity = 1.6;
      const meadowVelocity = 2;
      sky.tilePositionX += skyVelocity;
      horizon.tilePositionX += horizonVelocity;
      meadow.tilePositionX += meadowVelocity;
    };
    return { ground, update };
  },
};

export default worldFactory;
