import Phaser from 'phaser';
import { COLORS } from '@/config/game-config';

/**
 * A single grid cell on the board.
 * Visual-only — no game logic.
 */
export class GridCell extends Phaser.GameObjects.Rectangle {
  readonly gridX: number;
  readonly gridY: number;

  constructor(
    scene: Phaser.Scene,
    gridX: number,
    gridY: number,
    pixelX: number,
    pixelY: number,
    size: number,
  ) {
    super(scene, pixelX, pixelY, size, size, COLORS.CELL_DEFAULT);
    this.gridX = gridX;
    this.gridY = gridY;
    this.setOrigin(0.5, 0.5);
    scene.add.existing(this);
  }

  highlight(): void {
    this.setFillStyle(COLORS.CELL_HIGHLIGHT);
  }

  resetColor(): void {
    this.setFillStyle(COLORS.CELL_DEFAULT);
  }
}
