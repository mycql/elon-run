import Phaser from "phaser";

import { half } from "../util";
import { PlayerEvent } from "../events/event-types";

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
    let health = 100;
    const faceSprite = scene.add.sprite(
      0,
      0,
      TextureKey.HEAD,
      TextureKey.HEAD_FOCUS,
    );
    let isHurting = false;
    const recover = () => {
      isHurting = false;
      faceSprite.setFrame(TextureKey.HEAD_FOCUS);
    };
    const hit = () => {
      if (isHurting) {
        return;
      }
      isHurting = true;
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
    // const { width: viewWidth, height: viewHeight } = scene.sys.game.config;
    const containerX = 10 + half(faceSprite.displayWidth); //half(Number(viewWidth));
    const containerY = 10 + half(faceSprite.displayHeight); //half(Number(viewHeight));
    const container = scene.add.container(containerX, containerY, [faceSprite]);

    scene.events.on(PlayerEvent.HIT_OBSTACLE, hit);

    return { health: () => health, gameRef: container };
  },
};

export default healthBarFactory;
