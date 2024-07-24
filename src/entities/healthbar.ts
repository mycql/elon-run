import Phaser from "phaser";

import { half, range } from "../util";
import { UITextureKey } from "../shared/types";
import { PlayerEvent } from "../shared/events";

enum TextureKey {
  HEAD = "head",
  HEAD_FOCUS = "headFocus",
  HEAD_SHOCK = "headShock",
}

interface HealthBar {
  health(): void;
  gameRef: Phaser.GameObjects.Container;
}

interface HealthBarFactory {
  load(scene: Phaser.Scene): void;
  create(scene: Phaser.Scene): HealthBar;
}

const healthBarFactory: HealthBarFactory = {
  load(scene) {
    // do nothing
  },
  create(scene) {
    const componentGap = 5;
    let health = 5;
    const faceSprite = scene.add.sprite(
      0,
      0,
      TextureKey.HEAD,
      TextureKey.HEAD_FOCUS,
    );
    const { displayWidth: faceWidth, displayHeight: faceHeight } = faceSprite;
    const [halfFaceWidth, halfFaceHeight] = [faceWidth, faceHeight].map(half);

    const containerX = 10 + halfFaceWidth;
    const containerY = 10 + halfFaceHeight;
    const container = scene.add.container(containerX, containerY, [faceSprite]);

    let starSprites: Phaser.GameObjects.Sprite[] | undefined;
    scene.events.once(PlayerEvent.HEALTH_CHANGED, (initialHealth: number) => {
      health = initialHealth;
      starSprites = range(initialHealth).map((_, index) => {
        const starSprite = scene.add.sprite(
          0,
          0,
          UITextureKey.UI,
          UITextureKey.STAR,
        );
        const starWidth = starSprite.displayWidth;
        const halfStarWidth = half(starWidth);
        starSprite.setX(
          halfFaceWidth + halfStarWidth * (index + 1) + componentGap * index,
        );
        starSprite.setScale(0.5);
        return starSprite;
      });
      container.add(starSprites);
    });
    scene.events.on(PlayerEvent.HEALTH_CHANGED, (newHealth: number) => {
      if (health === newHealth) {
        return;
      }
      health = newHealth;
      if (starSprites) {
        const starSprite = starSprites[health];
        if (starSprite) {
          starSprite.setFrame(UITextureKey.START_OUTLINE);
          scene.tweens.add({
            targets: starSprite,
            scale: { from: 0.7, to: 0.5 },
            duration: 500,
          });
        }
      }
    });

    const recover = () => {
      faceSprite.setFrame(TextureKey.HEAD_FOCUS);
    };
    const hit = () => {
      faceSprite.setFrame(TextureKey.HEAD_SHOCK);
      scene.time.delayedCall(500, recover);
      scene.tweens.add({
        targets: faceSprite,
        angle: { from: -12, to: 12 },
        ease: "Bounce",
        delay: 0,
        duration: 500,
        onComplete: () => {
          recover();
          faceSprite.setAngle(0);
        },
      });
    };

    scene.events.on(PlayerEvent.HIT_OBSTACLE, hit);

    return { health: () => health, gameRef: container };
  },
};

export default healthBarFactory;
