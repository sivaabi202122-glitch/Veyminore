import Phaser from 'phaser';
import { COLORS, GAME_WIDTH } from '@/config/game-config';
import { LevelsFile } from '@/data/types';
import { AudioManager } from '@/services/AudioManager';

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
    const levelsData = this.cache.json.get('levels') as LevelsFile;
    const currentLevel = levelsData.levels.find(l => l.id === this.levelId);
    const levelName = currentLevel ? (currentLevel.name || currentLevel.id) : '';

    // Success checkmark symbol
    this.add.text(GAME_WIDTH / 2, 280, '✓', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '110px',
      color: '#06d6a0',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 400, 'Level Complete!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    if (levelName) {
      this.add.text(GAME_WIDTH / 2, 450, levelName, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#ffd166',
      }).setOrigin(0.5);
    }

    // Stats
    this.add.text(GAME_WIDTH / 2, 510, `Moves: ${this.moveCount}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '26px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Next level button
    const nextLevel = this.getNextLevelId();
    if (nextLevel) {
      this.createResultButton(GAME_WIDTH / 2, 640, 'Next Level →', COLORS.SUCCESS, 0x1a1a2e, () => {
        AudioManager.getInstance().playTap();
        this.scene.start('GameScene', { levelId: nextLevel });
      });
    }

    // Replay button
    this.createResultButton(GAME_WIDTH / 2, 740, '↺ Replay', COLORS.CELL_DEFAULT, 0xffffff, () => {
      AudioManager.getInstance().playTap();
      this.scene.start('GameScene', { levelId: this.levelId });
    });

    // Menu button
    this.createResultButton(GAME_WIDTH / 2, 840, '← Menu', COLORS.CELL_DEFAULT, 0xffffff, () => {
      AudioManager.getInstance().playTap();
      this.scene.start('MenuScene');
    });

    // Smooth fade in
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
    textColor: number,
    callback: () => void,
  ): void {
    const bg = this.add.rectangle(x, y, 400, 68, bgColor);
    bg.setInteractive({ useHandCursor: true });

    this.add.text(x, y, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: textColor === 0x1a1a2e ? '#1a1a2e' : '#ffffff',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(COLORS.CELL_HIGHLIGHT));
    bg.on('pointerout', () => bg.setFillStyle(bgColor));
    bg.on('pointerdown', callback);
  }

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
