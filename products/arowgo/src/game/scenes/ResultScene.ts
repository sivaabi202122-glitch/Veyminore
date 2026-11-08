import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '@/config/game-config';
import { LevelsFile } from '@/data/types';

/**
 * ResultScene — shown after completing a level.
 */
export class ResultScene extends Phaser.Scene {
  private levelId: string = '';
  private moveCount: number = 0;

  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data: { levelId: string; moveCount: number }): void {
    this.levelId = data.levelId;
    this.moveCount = data.moveCount;
  }

  create(): void {
    // Success header
    this.add.text(GAME_WIDTH / 2, 300, '✓', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '120px',
      color: '#06d6a0',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 440, 'Level Complete!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Stats
    this.add.text(GAME_WIDTH / 2, 520, `Moves: ${this.moveCount}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Next level button
    const nextLevel = this.getNextLevelId();
    if (nextLevel) {
      this.createResultButton(GAME_WIDTH / 2, 660, 'Next Level →', COLORS.SUCCESS, () => {
        this.scene.start('GameScene', { levelId: nextLevel });
      });
    }

    // Replay button
    this.createResultButton(GAME_WIDTH / 2, 760, '↺ Replay', COLORS.CELL_DEFAULT, () => {
      this.scene.start('GameScene', { levelId: this.levelId });
    });

    // Menu button
    this.createResultButton(GAME_WIDTH / 2, 860, '← Menu', COLORS.CELL_DEFAULT, () => {
      this.scene.start('MenuScene');
    });

    // Entry animation
    this.cameras.main.setAlpha(0);
    this.tweens.add({
      targets: this.cameras.main,
      alpha: 1,
      duration: 400,
      ease: 'Power2',
    });
  }

  private createResultButton(
    x: number,
    y: number,
    label: string,
    bgColor: number,
    callback: () => void,
  ): void {
    const bg = this.add.rectangle(x, y, 400, 70, bgColor);
    bg.setInteractive({ useHandCursor: true });

    this.add.text(x, y, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(COLORS.CELL_HIGHLIGHT));
    bg.on('pointerout', () => bg.setFillStyle(bgColor));
    bg.on('pointerdown', callback);
  }

  /**
   * Find the next level ID after the current one.
   */
  private getNextLevelId(): string | null {
    const levelsData = this.cache.json.get('levels') as LevelsFile;
    const levels = levelsData.levels;
    const currentIndex = levels.findIndex(l => l.id === this.levelId);

    if (currentIndex >= 0 && currentIndex < levels.length - 1) {
      return levels[currentIndex + 1].id;
    }
    return null;
  }
}
