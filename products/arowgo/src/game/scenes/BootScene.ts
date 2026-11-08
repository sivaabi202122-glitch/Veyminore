import Phaser from 'phaser';

/**
 * BootScene — initializes the game, loads minimal assets, transitions to Menu.
 * Kept intentionally lightweight for fast startup.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Show a simple loading indicator
    const { width, height } = this.scale;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'AROWGO', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xe94560, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load levels data
    this.load.json('levels', 'levels/levels.json');
  }

  create(): void {
    // Small delay for the splash, then go to menu
    this.time.delayedCall(300, () => {
      this.scene.start('MenuScene');
    });
  }
}
