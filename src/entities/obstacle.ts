import Phaser from "phaser";

import { half } from "../util";

export interface Obstacles {
  gameRef: Phaser.Physics.Arcade.Group;
}

export interface ObstacleFactory {
  load(scene: Phaser.Scene): void;
  create(scene: Phaser.Scene, ground: Phaser.GameObjects.Shape): Obstacles;
}

const obstacleKeys = Array.from({ length: 8 }, (_, index) => `${index + 1}`);

export const obstacleFactory: ObstacleFactory = {
  load(scene) {
    obstacleKeys.forEach((obstacleKey) => {
      scene.load.image(
        `obstacle-${obstacleKey}`,
        `assets/image/obstacle/${obstacleKey}.png`,
      );
    });
  },
  create(scene, ground) {
    const {
      x: groundX,
      y: groundY,
      width: groundWidth,
      height: groundHeight,
    } = ground;
    const group = scene.physics.add.group();
    const generateObstacle = (obstacleTextureKey: string): void => {
      const obstacle = scene.physics.add.sprite(0, 0, obstacleTextureKey);
      obstacle.setY(
        groundY - half(groundHeight) - half(obstacle.displayHeight),
      );
      scene.tweens.add({
        targets: obstacle,
        x: { from: groundWidth, to: -100 },
        duration: 6000,
        onComplete: () => {
          obstacle.destroy();
        },
      });
      obstacle.setX(groundX);
      group.add(obstacle);
    };
    const generateRandomObstacle = (): void => {
      scene.time.delayedCall(Phaser.Math.Between(2000, 6000), () => {
        const obstacleKey = Phaser.Math.Between(1, obstacleKeys.length);
        generateObstacle(`obstacle-${obstacleKey}`);
        generateRandomObstacle();
      });
    };
    generateRandomObstacle();

    return { gameRef: group };
  },
};

export default obstacleFactory;
