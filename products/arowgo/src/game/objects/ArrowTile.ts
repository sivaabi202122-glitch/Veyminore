import Phaser from 'phaser';
import { Direction, ArrowDefinition } from '@/data/types';
import { COLORS, ANIM, GRID } from '@/config/game-config';

/** Map direction to a color */
const DIRECTION_COLORS: Record<Direction, number> = {
  up: COLORS.ARROW_UP,
  down: COLORS.ARROW_DOWN,
  left: COLORS.ARROW_LEFT,
  right: COLORS.ARROW_RIGHT,
};

/**
 * Visual arrow tile on the game board.
 * Handles rendering, input, and animations.
 */
export class ArrowTile extends Phaser.GameObjects.Container {
  readonly arrowId: string;
  readonly direction: Direction;
  private arrowGraphics: Phaser.GameObjects.Graphics;
  private cellSize: number;
  private _isAnimating: boolean = false;

  /** Event emitter key for when this arrow is tapped */
  static readonly EVENT_TAPPED = 'arrow-tapped';

  constructor(
    scene: Phaser.Scene,
    definition: ArrowDefinition,
    pixelX: number,
    pixelY: number,
    cellSize: number,
  ) {
    super(scene, pixelX, pixelY);

    this.arrowId = definition.id;
    this.direction = definition.direction;
    this.cellSize = cellSize;

    // Create arrow graphic
    this.arrowGraphics = scene.add.graphics();
    this.add(this.arrowGraphics);
    this.drawArrow();

    // Set up interactive hit area
    const hitSize = cellSize * (1 - GRID.ARROW_INSET * 2);
    this.setSize(hitSize, hitSize);
    this.setInteractive({ useHandCursor: true });

    this.on('pointerdown', () => {
      if (!this._isAnimating) {
        this.emit(ArrowTile.EVENT_TAPPED, this.arrowId);
      }
    });

    scene.add.existing(this);
  }

  get isAnimating(): boolean {
    return this._isAnimating;
  }

  /**
   * Draw the arrow shape based on direction.
   */
  private drawArrow(): void {
    const g = this.arrowGraphics;
    g.clear();

    const color = DIRECTION_COLORS[this.direction];
    const inset = this.cellSize * GRID.ARROW_INSET;
    const size = this.cellSize - inset * 2;
    const half = size / 2;

    g.fillStyle(color, 1);
    g.lineStyle(2, 0xffffff, 0.3);

    // Draw arrow pointing in direction
    // Arrow is drawn centered at (0,0)
    const points = this.getArrowPoints(half);
    g.fillPoints(points, true);
    g.strokePoints(points, true);
  }

  /**
   * Get arrow polygon points for the given direction.
   */
  private getArrowPoints(half: number): Phaser.Geom.Point[] {
    const tip = half * 0.9;
    const base = half * 0.5;
    const shaft = half * 0.3;

    switch (this.direction) {
      case 'right':
        return [
          new Phaser.Geom.Point(tip, 0),
          new Phaser.Geom.Point(-base, -half * 0.6),
          new Phaser.Geom.Point(-shaft, -shaft),
          new Phaser.Geom.Point(-shaft, shaft),
          new Phaser.Geom.Point(-base, half * 0.6),
        ];
      case 'left':
        return [
          new Phaser.Geom.Point(-tip, 0),
          new Phaser.Geom.Point(base, -half * 0.6),
          new Phaser.Geom.Point(shaft, -shaft),
          new Phaser.Geom.Point(shaft, shaft),
          new Phaser.Geom.Point(base, half * 0.6),
        ];
      case 'up':
        return [
          new Phaser.Geom.Point(0, -tip),
          new Phaser.Geom.Point(-half * 0.6, base),
          new Phaser.Geom.Point(-shaft, shaft),
          new Phaser.Geom.Point(shaft, shaft),
          new Phaser.Geom.Point(half * 0.6, base),
        ];
      case 'down':
        return [
          new Phaser.Geom.Point(0, tip),
          new Phaser.Geom.Point(-half * 0.6, -base),
          new Phaser.Geom.Point(-shaft, -shaft),
          new Phaser.Geom.Point(shaft, -shaft),
          new Phaser.Geom.Point(half * 0.6, -base),
        ];
    }
  }

  /**
   * Play the exit animation — arrow slides off the board in its direction.
   * Returns a promise that resolves when complete.
   */
  playExitAnimation(): Promise<void> {
    this._isAnimating = true;
    this.disableInteractive();

    const distance = this.cellSize * 3;
    let targetX = this.x;
    let targetY = this.y;

    switch (this.direction) {
      case 'right': targetX += distance; break;
      case 'left': targetX -= distance; break;
      case 'down': targetY += distance; break;
      case 'up': targetY -= distance; break;
    }

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.5,
        duration: ANIM.ARROW_EXIT,
        ease: 'Power2',
        onComplete: () => {
          this._isAnimating = false;
          this.setVisible(false);
          resolve();
        },
      });
    });
  }

  /**
   * Play the blocked animation — a shake effect.
   * Returns a promise that resolves when complete.
   */
  playBlockedAnimation(): Promise<void> {
    this._isAnimating = true;

    const originalX = this.x;

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this,
        x: { value: originalX + 8, duration: 50, yoyo: true, repeat: 2 },
        duration: ANIM.ARROW_BLOCKED_SHAKE,
        ease: 'Sine.inOut',
        onComplete: () => {
          this.x = originalX;
          this._isAnimating = false;
          resolve();
        },
      });
    });
  }

  /**
   * Highlight this arrow (e.g., for hint).
   */
  highlightForHint(): void {
    this.scene.tweens.add({
      targets: this,
      scale: 1.15,
      duration: 400,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.inOut',
    });
  }
}
