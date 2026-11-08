import Phaser from 'phaser';
import { COLORS, GAME_WIDTH } from '@/config/game-config';
import { LevelsFile } from '@/data/types';
import { AudioManager } from '@/services/AudioManager';

/**
 * ResultScene — shown after completing a level or daily challenge.
 */
export class ResultScene extends Phaser.Scene {
  private levelId: string = '';
  private moveCount: number = 0;
  private isDaily: boolean = false;
  private streakInfo?: { newStreak: number; isNewMax: boolean };

  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data: {
    levelId: string;
    moveCount: number;
    isDaily?: boolean;
    streakInfo?: { newStreak: number; isNewMax: boolean };
  }): void {
    this.levelId = data.levelId;
    this.moveCount = data.moveCount;
    this.isDaily = !!data.isDaily;
    this.streakInfo = data.streakInfo;
  }

  create(): void {
    const levelsData = this.cache.json.get('levels') as LevelsFile;
    const currentLevel = levelsData ? levelsData.levels.find(l => l.id === this.levelId) : undefined;
    const levelName = this.isDaily
      ? 'Daily Challenge'
      : currentLevel ? (currentLevel.name || currentLevel.id) : '';

    // Success checkmark symbol
    this.add.text(GAME_WIDTH / 2, 260, '✓', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '100px',
      color: '#06d6a0',
    }).setOrigin(0.5);

    const titleText = this.isDaily ? 'Daily Cleared!' : 'Level Complete!';
    this.add.text(GAME_WIDTH / 2, 370, titleText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    if (levelName) {
      this.add.text(GAME_WIDTH / 2, 420, levelName, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#ffd166',
      }).setOrigin(0.5);
    }

    // Move stats
    this.add.text(GAME_WIDTH / 2, 475, `Moves: ${this.moveCount}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '26px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // If Daily Challenge, display streak badge
    if (this.isDaily && this.streakInfo) {
      const streakText = `🔥 Daily Streak: ${this.streakInfo.newStreak} day${this.streakInfo.newStreak > 1 ? 's' : ''}${this.streakInfo.isNewMax ? ' (New Best!)' : ''}`;
      this.add.text(GAME_WIDTH / 2, 520, streakText, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#ff9f1c',
      }).setOrigin(0.5);

      // Share button
      this.createResultButton(GAME_WIDTH / 2, 620, 'Share Result 📤', 0x533483, 0xffffff, () => {
        this.handleShare();
      });

      // Menu button
      this.createResultButton(GAME_WIDTH / 2, 720, '← Menu', COLORS.CELL_DEFAULT, 0xffffff, () => {
        AudioManager.getInstance().playTap();
        this.scene.start('MenuScene');
      });
    } else {
      // Normal level flow
      const nextLevel = this.getNextLevelId();
      if (nextLevel) {
        this.createResultButton(GAME_WIDTH / 2, 620, 'Next Level →', COLORS.SUCCESS, 0x1a1a2e, () => {
          AudioManager.getInstance().playTap();
          this.scene.start('GameScene', { levelId: nextLevel });
        });
      }

      // Replay button
      this.createResultButton(GAME_WIDTH / 2, 720, '↺ Replay', COLORS.CELL_DEFAULT, 0xffffff, () => {
        AudioManager.getInstance().playTap();
        this.scene.start('GameScene', { levelId: this.levelId });
      });

      // Menu button
      this.createResultButton(GAME_WIDTH / 2, 820, '← Menu', COLORS.CELL_DEFAULT, 0xffffff, () => {
        AudioManager.getInstance().playTap();
        this.scene.start('MenuScene');
      });
    }

    // Smooth fade in
    this.cameras.main.setAlpha(0);
    this.tweens.add({
      targets: this.cameras.main,
      alpha: 1,
      duration: 400,
      ease: 'Power2',
    });
  }

  private handleShare(): void {
    AudioManager.getInstance().playHint();
    const streak = this.streakInfo ? this.streakInfo.newStreak : 1;
    const shareText = `🎯 AROWGO Daily Challenge Cleared!\n⚡ Moves: ${this.moveCount}\n🔥 Streak: ${streak} day${streak > 1 ? 's' : ''}\nThink. Clear. Go.`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'AROWGO Daily Challenge',
        text: shareText,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        const toast = this.add.text(GAME_WIDTH / 2, 570, 'Copied to clipboard!', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '18px',
          color: '#06d6a0',
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => toast.destroy());
      }).catch(() => {});
    }
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
    if (!levelsData) return null;
    const levels = levelsData.levels;
    const currentIndex = levels.findIndex(l => l.id === this.levelId);

    if (currentIndex >= 0 && currentIndex < levels.length - 1) {
      return levels[currentIndex + 1].id;
    }
    return null;
  }
}
