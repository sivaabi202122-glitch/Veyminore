import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '@/config/game-config';
import { LevelsFile, LevelDefinition } from '@/data/types';
import { SaveManager } from '@/services/SaveManager';
import { AudioManager } from '@/services/AudioManager';
import { generateDailyChallenge } from '@/game/systems/DailyChallengeGenerator';

/**
 * MenuScene — main menu with hero play button, daily challenge launcher,
 * paginated level grid, completion checkmarks, and sound settings.
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
    this.add.text(GAME_WIDTH / 2, 100, 'AROWGO', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '60px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Tagline
    this.add.text(GAME_WIDTH / 2, 150, 'Think. Clear. Go.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffd166',
    }).setOrigin(0.5);

    // Sound toggle in top right
    const settings = saveManager.getSettings();
    const soundBtn = this.add.container(GAME_WIDTH - 60, 45);
    const soundBg = this.add.rectangle(0, 0, 56, 40, COLORS.CELL_DEFAULT);
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

    // Quick Play & Daily Challenge section
    const allIds = this.levels.map(l => l.id);
    const firstUnfinished = this.levels.find(l => !saveManager.isLevelCompleted(l.id)) || this.levels[0];

    // "Quick Play" Button
    const playBtnContainer = this.add.container(GAME_WIDTH / 2, 220);
    const playBtnBg = this.add.rectangle(0, 0, 420, 56, COLORS.SUCCESS);
    playBtnBg.setInteractive({ useHandCursor: true });
    const playBtnText = this.add.text(0, 0, `▶ Resume Level ${allIds.indexOf(firstUnfinished.id) + 1}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
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

    // "Daily Challenge" Button
    const todayStr = new Date().toISOString().slice(0, 10);
    const isDailyDone = saveManager.isDailyCompleted(todayStr);
    const streak = saveManager.getDailyStreak();

    const dailyBtnContainer = this.add.container(GAME_WIDTH / 2, 290);
    const dailyBtnBg = this.add.rectangle(0, 0, 420, 52, isDailyDone ? 0x2a2a40 : 0x533483);
    dailyBtnBg.setStrokeStyle(1, 0xffd166, 0.7);
    dailyBtnBg.setInteractive({ useHandCursor: true });

    const dailyStatus = isDailyDone ? '✓ Completed' : '⚡ Play Today';
    const streakBadge = streak.currentStreak > 0 ? ` • 🔥 ${streak.currentStreak}` : '';
    const dailyBtnText = this.add.text(0, 0, `📅 Daily Challenge${streakBadge} (${dailyStatus})`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    dailyBtnBg.on('pointerover', () => dailyBtnBg.setFillStyle(0x6b44a8));
    dailyBtnBg.on('pointerout', () => dailyBtnBg.setFillStyle(isDailyDone ? 0x2a2a40 : 0x533483));
    dailyBtnBg.on('pointerdown', () => {
      AudioManager.getInstance().playTap();
      const dailyLevel = generateDailyChallenge(todayStr);
      this.scene.start('GameScene', { customLevel: dailyLevel });
    });
    dailyBtnContainer.add([dailyBtnBg, dailyBtnText]);

    // Section title
    this.add.text(GAME_WIDTH / 2, 355, 'LEVELS', {
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
    const cardHeight = 115;
    const gapX = 24;
    const gapY = 18;
    const startX = (GAME_WIDTH - (cols * cardWidth + (cols - 1) * gapX)) / 2 + cardWidth / 2;
    const startY = 445;

    this.levels.forEach((level, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + gapX);
      const y = startY + row * (cardHeight + gapY);

      const isUnlocked = saveManager.isLevelUnlocked(level.id, allIds);
      const isCompleted = saveManager.isLevelCompleted(level.id);

      const container = this.add.container(x, y);

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

        const numText = this.add.text(-cardWidth / 2 + 16, -cardHeight / 2 + 16, `${index + 1}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '22px',
          fontStyle: 'bold',
          color: '#ffffff',
        });

        if (isCompleted) {
          const check = this.add.text(cardWidth / 2 - 20, -cardHeight / 2 + 16, '✓', {
            fontSize: '20px',
            color: '#06d6a0',
          }).setOrigin(0.5);
          container.add(check);
        }

        const nameText = this.add.text(0, 6, level.name || `Level ${index + 1}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
        }).setOrigin(0.5);

        const infoText = this.add.text(0, 32, `${level.arrows.length} arrows • ${level.width}×${level.height}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          color: '#aaaaaa',
        }).setOrigin(0.5);

        container.add([numText, nameText, infoText]);
      } else {
        const lockIcon = this.add.text(0, -10, '🔒', {
          fontSize: '26px',
        }).setOrigin(0.5);

        const lockLabel = this.add.text(0, 24, `Level ${index + 1}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '15px',
          color: '#666677',
        }).setOrigin(0.5);

        container.add([lockIcon, lockLabel]);
      }
    });
  }
}
