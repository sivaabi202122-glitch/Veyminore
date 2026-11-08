import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '@/config/game-config';
import { LevelsFile, LevelDefinition } from '@/data/types';

/**
 * MenuScene — main menu with Play button and level selection.
 */
export class MenuScene extends Phaser.Scene {
  private levels: LevelDefinition[] = [];

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const levelsData = this.cache.json.get('levels') as LevelsFile;
    this.levels = levelsData.levels;

    // Title
    this.add.text(GAME_WIDTH / 2, 200, 'AROWGO', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '72px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Tagline
    this.add.text(GAME_WIDTH / 2, 280, 'Think. Clear. Go.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Level buttons
    this.createLevelButtons();
  }

  private createLevelButtons(): void {
    const startY = 420;
    const buttonWidth = 500;
    const buttonHeight = 80;
    const gap = 20;

    this.levels.forEach((level, index) => {
      const y = startY + index * (buttonHeight + gap);

      // Button background
      const button = this.add.rectangle(
        GAME_WIDTH / 2,
        y,
        buttonWidth,
        buttonHeight,
        COLORS.CELL_DEFAULT,
      );
      button.setInteractive({ useHandCursor: true });

      // Level name
      const displayName = level.name || `Level ${index + 1}`;
      const difficulty = level.difficulty || '';

      this.add.text(GAME_WIDTH / 2 - buttonWidth / 2 + 30, y - 12, displayName, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff',
      }).setOrigin(0, 0.5);

      if (difficulty) {
        this.add.text(GAME_WIDTH / 2 + buttonWidth / 2 - 30, y - 12, difficulty.toUpperCase(), {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          color: '#aaaaaa',
        }).setOrigin(1, 0.5);
      }

      // Board size info
      this.add.text(GAME_WIDTH / 2 - buttonWidth / 2 + 30, y + 14, `${level.width}×${level.height} • ${level.arrows.length} arrows`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: '#888888',
      }).setOrigin(0, 0.5);

      // Hover effects
      button.on('pointerover', () => button.setFillStyle(COLORS.CELL_HIGHLIGHT));
      button.on('pointerout', () => button.setFillStyle(COLORS.CELL_DEFAULT));

      button.on('pointerdown', () => {
        this.scene.start('GameScene', { levelId: level.id });
      });
    });
  }
}
