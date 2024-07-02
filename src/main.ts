import Phaser from "phaser";

import Player from "./entities/player";

const physics: Phaser.Types.Core.PhysicsConfig = {
  default: "arcade",
  arcade: {
    gravity: {
      y: 300,
    },
    debug: true,
  },
};

class GameScene extends Phaser.Scene {
  private _sky!: Phaser.GameObjects.TileSprite;
  private _horizon!: Phaser.GameObjects.TileSprite;
  private _meadow!: Phaser.GameObjects.TileSprite;
  private _player!: Player;
  private _spaceKey?: Phaser.Input.Keyboard.Key;

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("clouds", "assets/clouds.png");
    this.load.image("horizon", "assets/horizon.png");
    this.load.image("meadow", "assets/meadow.png");
    this.load.spritesheet("player", "assets/player.png", {
      frameWidth: 21,
      frameHeight: 33,
    });
  }

  create() {
    const gameWidth = this.sys.game.config.width as number;
    const gameHeight = this.sys.game.config.height as number;
    const centerX = gameWidth / 2;
    const centerY = gameHeight / 2;
    const worldWidth = 600;
    const worldHeight = 300;
    const sky = this.add.tileSprite(
      centerX,
      centerY,
      worldWidth,
      worldHeight,
      "sky",
    );
    this._sky = sky;
    const horizon = this.add.tileSprite(
      centerX,
      centerY,
      worldWidth,
      worldHeight,
      "horizon",
    );
    this._horizon = horizon;
    const meadow = this.add.tileSprite(
      centerX,
      centerY,
      worldWidth,
      worldHeight,
      "meadow",
    );
    this._meadow = meadow;
    const groundX = meadow.x;
    const groundY = meadow.y + 110;
    const groundWidth = meadow.width - 20;
    const groundHeight = 10;
    const ground = this.add.rectangle(
      groundX,
      groundY,
      groundWidth,
      groundHeight,
    );
    const player = new Player(this, 100, 0);
    player.run();
    this._player = player;

    const groundStatic = this.physics.add.staticGroup();
    groundStatic.add(ground);
    this.physics.add.collider(player, groundStatic, () => {
      player.resume();
    });

    const spaceKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
    this._spaceKey = spaceKey;
  }

  update() {
    this._animateWorld();
    const spaceKey = this._spaceKey;
    if (spaceKey) {
      if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        this._player.jump();
      }
    }
  }

  private _animateWorld() {
    this._sky.tilePositionX += 1;
    this._horizon.tilePositionX += 1.5;
    this._meadow.tilePositionX += 2;
  }
}

const scene = new GameScene();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 600,
  height: 300,
  parent: "app",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene,
  physics,
};

new Phaser.Game(config);
