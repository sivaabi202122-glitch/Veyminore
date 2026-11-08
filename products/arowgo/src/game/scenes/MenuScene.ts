import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '@/config/game-config';
import { LevelsFile, LevelDefinition } from '@/data/types';
import { SaveManager } from '@/services/SaveManager';
import { AudioManager } from '@/services/AudioManager';

/**
 * MenuScene — main menu with hero play button, paginated level grid,
 * completion checkmarks, and sound settings.
 */
export class MenuScene extends Phaser.Scene {
  private levels: LevelDefinition[] = [];
  private soundText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const levelsData = this.cache.json.get('levels') as LevelsFile;
    this.levels = levelsData.levels;
    const saveManager = SaveManager.getInstance();

    // Game Title
    this.add.text(GAME_WIDTH / 2, 120, 'AROWGO', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Tagline
    this.add.text(GAME_WIDTH / 2, 180, 'Think. Clear. Go.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#ffd166',
    }).setOrigin(0.5);

    // Sound toggle in top right
    const settings = saveManager.getSettings();
    const soundBtn = this.add.container(GAME_WIDTH - 60, 50);
    const soundBg = this.add.rectangle(0, 0, 60, 44, COLORS.CELL_DEFAULT);
    soundBg.setInteractive({ useHandCursor: true });
    this.soundText = this.add.text(0, 0, settings.soundEnabled ? '🔊' : '🔇', {
      fontSize: '20px',
    }).setOrigin(0.5);

    soundBg.on('pointerdown', () => {
      const cur = saveManager.getSettings();
      saveManager.updateSettings({ soundEnabled: !cur.soundEnabled });
      this.soundText.setText(!cur.soundEnabled ? '🔊' : '🔇');
      if (!cur.soundEnabled) {
        AudioManager.getInstance().playTap();
      }
    });
    soundBtn.add([soundBg, this.soundText]);

    // Determine current level to resume
    const allIds = this.levels.map(l => l.id);
    const firstUnfinished = this.levels.find(l => !saveManager.isLevelCompleted(l.id)) || this.levels[0];

    // "Quick Play" Hero Button
    const playBtnContainer = this.add.container(GAME_WIDTH / 2, 260);
    const playBtnBg = this.add.rectangle(0, 0, 400, 64, COLORS.SUCCESS);
    playBtnBg.setInteractive({ useHandCursor: true });
    const playBtnText = this.add.text(0, 0, `▶ Play Level ${allIds.indexOf(firstUnfinished.id) + 1}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#1a1a2e',
    }).setOrigin(0.5);

    playBtnBg.on('pointerover', () => playBtnBg.setFillStyle(0x05b888));
    playBtnBg.on('pointerout', () => playBtnBg.setFillStyle(COLORS.SUCCESS));
    playBtnBg.on('pointerdown', () => {
      AudioManager.getInstance().playTap();
      this.scene.start('GameScene', { levelId: firstUnfinished.id });
    });
    playBtnContainer.add([playBtnBg, playBtnText]);

    // Section title
    this.add.text(GAME_WIDTH / 2, 340, 'SELECT LEVEL', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Level Badges Grid (3 columns)
    this.createLevelGrid(allIds);
  }

  private createLevelGrid(allIds: string[]): void {
    const saveManager = SaveManager.getInstance();
    const cols = 3;
    const cardWidth = 190;
    const cardHeight = 120;
    const gapX = 24;
    const gapY = 20;
    const startX = (GAME_WIDTH - (cols * cardWidth + (cols - 1) * gapX)) / 2 + cardWidth / 2;
    const startY = 440;

    this.levels.forEach((level, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + gapX);
      const y = startY + row * (cardHeight + gapY);

      const isUnlocked = saveManager.isLevelUnlocked(level.id, allIds);
      const isCompleted = saveManager.isLevelCompleted(level.id);

      const container = this.add.container(x, y);

      // Card background
      const bgColor = isCompleted ? 0x164e63 : isUnlocked ? COLORS.CELL_DEFAULT : 0x22223b;
      const cardBg = this.add.rectangle(0, 0, cardWidth, cardHeight, bgColor);
      cardBg.setStrokeStyle(isUnlocked ? 2 : 1, isCompleted ? COLORS.SUCCESS : 0x3d405b);

      container.add(cardBg);

      if (isUnlocked) {
        cardBg.setInteractive({ useHandCursor: true });
        cardBg.on('pointerover', () => cardBg.setFillStyle(COLORS.CELL_HIGHLIGHT));
        cardBg.on('pointerout', () => cardBg.setFillStyle(bgColor));
        cardBg.on('pointerdown', () => {
          AudioManager.getInstance().playTap();
          this.scene.start('GameScene', { levelId: level.id });
        });

        // Level number
        const numText = this.add.text(-cardWidth / 2 + 18, -cardHeight / 2 + 18, `${index + 1}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '24px',
          fontStyle: 'bold',
          color: '#ffffff',
        });

        // Completed Checkmark
        if (isCompleted) {
          const check = this.add.text(cardWidth / 2 - 24, -cardHeight / 2 + 18, '✓', {
            fontSize: '22px',
            color: '#06d6a0',
          }).setOrigin(0.5);
          container.add(check);
        }

        // Level name
        const nameText = this.add.text(0, 8, level.name || `Level ${index + 1}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
        }).setOrigin(0.5);

        // Arrows count & difficulty
        const infoText = this.add.text(0, 36, `${level.arrows.length} arrows • ${level.width}×${level.height}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
          color: '#aaaaaa',
        }).setOrigin(0.5);

        container.add([numText, nameText, infoText]);
      } else {
        // Locked card
        const lockIcon = this.add.text(0, -10, '🔒', {
          fontSize: '28px',
        }).setOrigin(0.5);

        const lockLabel = this.add.text(0, 26, `Level ${index + 1}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          color: '#666677',
        }).setOrigin(0.5);

        container.add([lockIcon, lockLabel]);
      }
    });
  }
}
