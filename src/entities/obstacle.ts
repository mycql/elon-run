import Phaser from "phaser";

import { half } from "../util";

export interface Obstacles {
  gameRef: Phaser.Physics.Arcade.Group;
}

export interface ObstacleFactory {
  load(scene: Phaser.Scene): void;
  create(scene: Phaser.Scene, ground: Phaser.GameObjects.Shape): Obstacles;
}

export const obstacleFactory: ObstacleFactory = {
  load(scene) {
    [1].forEach((value) => {
      scene.load.image(`obstacle-${1}`, `assets/image/obstacle/${value}.png`);
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
    [1].forEach((value) => {
      const generateObstacle = () => {
        const obstacle = scene.physics.add.sprite(0, 0, `obstacle-${value}`);
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

        scene.time.delayedCall(Phaser.Math.Between(2000, 6000), () =>
          generateObstacle(),
        );
      };
      generateObstacle();
    });
    return { gameRef: group };
  },
};
