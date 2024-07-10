import Phaser from "phaser";

import PlayScene from "./scenes/play";

const physics: Phaser.Types.Core.PhysicsConfig = {
  default: "arcade",
  arcade: {
    gravity: {
      y: 300,
      x: 0,
    },
    debug: true,
  },
};

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 600,
  height: 300,
  parent: "app",
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PlayScene],
  physics,
};

new Phaser.Game(config);
