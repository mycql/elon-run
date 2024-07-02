import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  static JUMP_UP = "jump_up";

  _animation!: Phaser.Animations.Animation;
  _jumping = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(2);
    this.setBounce(0.2);
    this.setCollideWorldBounds(true);

    const animation = scene.anims.create({
      key: "run",
      frameRate: 10,
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 7 }),
      repeat: -1,
    }) as Phaser.Animations.Animation;

    this._animation = animation;

    this.on(Player.JUMP_UP, () => {
      this.jump();
    });
  }

  run(): void {
    this._jumping = true;
    this.play("run");
  }

  pause(): void {
    this._animation.pause();
  }

  resume(): void {
    this._jumping = false;
    this._animation.resume();
  }

  jump(): void {
    if (this._jumping) {
      return;
    }
    this._jumping = true;
    this.pause();
    this.setVelocityY(-300);
  }
}
