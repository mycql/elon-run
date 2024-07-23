import Phaser from "phaser";

export interface AssetManager {
  load(scene: Phaser.Scene): void;
}

export enum UITextureKey {
  UI = "ui",
  STAR = "star",
  START_OUTLINE = "star_outline",
}
