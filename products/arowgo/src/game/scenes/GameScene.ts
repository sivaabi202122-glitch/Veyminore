import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, GRID, ANIM } from '@/config/game-config';
import { LevelsFile, LevelDefinition } from '@/data/types';
import { BoardManager } from '@/game/systems/BoardManager';
import { GridCell } from '@/game/objects/GridCell';
import { ArrowTile } from '@/game/objects/ArrowTile';
import { AudioManager } from '@/services/AudioManager';
import { SaveManager } from '@/services/SaveManager';
import { AnalyticsManager } from '@/services/AnalyticsManager';

/**
 * GameScene — the core gameplay scene.
 * Renders the board, handles player input, animates moves, sound, and tutorials.
 */
export class GameScene extends Phaser.Scene {
  private boardManager!: BoardManager;
  private isDaily: boolean = false;
  private gridCells: GridCell[] = [];
  private arrowTiles: Map<string, ArrowTile> = new Map();
  private cellSize: number = 0;
  private boardOriginX: number = 0;
  private boardOriginY: number = 0;
  private isProcessing: boolean = false;

  // UI elements
  private levelText!: Phaser.GameObjects.Text;
  private moveCountText!: Phaser.GameObjects.Text;
  private remainingText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private tutorialBanner?: Phaser.GameObjects.Container;
  private soundButtonText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { levelId?: string; customLevel?: LevelDefinition }): void {
    let levelDef: LevelDefinition | undefined = data.customLevel;

    if (!levelDef && data.levelId) {
      const levelsData = this.cache.json.get('levels') as LevelsFile;
      levelDef = levelsData.levels.find(l => l.id === data.levelId);
    }

    if (!levelDef) {
      console.error(`Level not found!`, data);
      this.scene.start('MenuScene');
      return;
    }

    this.isDaily = levelDef.id.startsWith('daily_');
    this.boardManager = new BoardManager(levelDef);

    AnalyticsManager.getInstance().logEvent(
      this.isDaily ? 'daily_challenge_started' : 'level_started',
      { levelId: levelDef.id }
    );
  }

  create(): void {
    this.gridCells = [];
    this.arrowTiles = new Map();
    this.isProcessing = false;

    this.createUI();
    this.createBoard();
    this.showTutorialIfNeeded();
    this.updateUI();
  }

  /**
   * Create UI elements (header, status, buttons).
   */
  private createUI(): void {
    const level = this.boardManager.level;

    // Back to Menu button
    this.createButton(80, 60, '← Menu', () => {
      AudioManager.getInstance().playTap();
      this.scene.start('MenuScene');
    }, '18px');

    // Sound toggle button
    const settings = SaveManager.getInstance().getSettings();
    const soundContainer = this.add.container(GAME_WIDTH - 80, 60);
    const soundBg = this.add.rectangle(0, 0, 70, 44, COLORS.CELL_DEFAULT);
    soundBg.setInteractive({ useHandCursor: true });
    this.soundButtonText = this.add.text(0, 0, settings.soundEnabled ? '🔊' : '🔇', {
      fontSize: '22px',
    }).setOrigin(0.5);

    soundBg.on('pointerover', () => soundBg.setFillStyle(COLORS.CELL_HIGHLIGHT));
    soundBg.on('pointerout', () => soundBg.setFillStyle(COLORS.CELL_DEFAULT));
    soundBg.on('pointerdown', () => {
      const current = SaveManager.getInstance().getSettings();
      SaveManager.getInstance().updateSettings({ soundEnabled: !current.soundEnabled });
      this.soundButtonText.setText(!current.soundEnabled ? '🔊' : '🔇');
      if (!current.soundEnabled) {
        AudioManager.getInstance().playTap();
      }
    });
    soundContainer.add([soundBg, this.soundButtonText]);

    // Level title
    this.levelText = this.add.text(GAME_WIDTH / 2, 60, level.name || level.id, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Move counter
    this.moveCountText = this.add.text(GAME_WIDTH / 2, 105, 'Moves: 0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Remaining arrows
    this.remainingText = this.add.text(GAME_WIDTH / 2, 135, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#888888',
    }).setOrigin(0.5);

    // Message feedback text
    this.messageText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 170, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffd166',
    }).setOrigin(0.5);

    // Bottom action buttons
    const buttonY = GAME_HEIGHT - 90;

    // Restart button
    this.createButton(160, buttonY, '↺ Restart', () => this.handleRestart());

    // Undo button
    this.createButton(360, buttonY, '← Undo', () => this.handleUndo());

    // Hint button
    this.createButton(560, buttonY, '💡 Hint', () => this.handleHint());
  }

  /**
   * Display tutorial guidance if configured on the level.
   */
  private showTutorialIfNeeded(): void {
    const level = this.boardManager.level;
    if (!level.tutorial) return;

    const bannerY = 175;
    const bannerContainer = this.add.container(GAME_WIDTH / 2, bannerY);

    const bannerBg = this.add.rectangle(0, 0, GAME_WIDTH - 80, 56, 0x533483, 0.9);
    bannerBg.setStrokeStyle(1, 0xffd166, 0.8);

    const bannerText = this.add.text(0, 0, `💡 ${level.tutorial}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: GAME_WIDTH - 110 },
      align: 'center',
    }).setOrigin(0.5);

    bannerContainer.add([bannerBg, bannerText]);
    this.tutorialBanner = bannerContainer;

    // Gentle pulse animation
    this.tweens.add({
      targets: bannerContainer,
      alpha: 0.85,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  /**
   * Helper to create interactive UI buttons.
   */
  private createButton(
    x: number,
    y: number,
    label: string,
    callback: () => void,
    fontSize: string = '20px',
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize,
      color: '#ffffff',
    }).setOrigin(0.5);

    const padding = 16;
    const bg = this.add.rectangle(
      0, 0,
      text.width + padding * 2,
      text.height + padding,
      COLORS.CELL_DEFAULT,
    );
    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => bg.setFillStyle(COLORS.CELL_HIGHLIGHT));
    bg.on('pointerout', () => bg.setFillStyle(COLORS.CELL_DEFAULT));
    bg.on('pointerdown', callback);

    container.add([bg, text]);
    return container;
  }

  /**
   * Create the visual board and arrow tiles.
   */
  private createBoard(): void {
    const level = this.boardManager.level;
    const { width, height } = level;

    // Calculate cell size to fit the screen
    const availableWidth = GAME_WIDTH - GRID.BOARD_PADDING * 2;
    const availableHeight = GAME_HEIGHT - 380;
    const maxCellW = (availableWidth - GRID.CELL_GAP * (width - 1)) / width;
    const maxCellH = (availableHeight - GRID.CELL_GAP * (height - 1)) / height;
    this.cellSize = Math.min(
      Math.max(Math.min(maxCellW, maxCellH), GRID.MIN_CELL_SIZE),
      GRID.MAX_CELL_SIZE,
    );

    // Calculate board origin (centered)
    const boardWidth = width * this.cellSize + (width - 1) * GRID.CELL_GAP;
    const boardHeight = height * this.cellSize + (height - 1) * GRID.CELL_GAP;
    this.boardOriginX = (GAME_WIDTH - boardWidth) / 2;
    this.boardOriginY = 220 + (availableHeight - boardHeight) / 2;

    // Board backdrop
    const bgPadding = 16;
    this.add.rectangle(
      GAME_WIDTH / 2,
      this.boardOriginY + boardHeight / 2,
      boardWidth + bgPadding * 2,
      boardHeight + bgPadding * 2,
      COLORS.BOARD_BG,
      0.6,
    ).setOrigin(0.5);

    // Create grid background cells
    for (let gy = 0; gy < height; gy++) {
      for (let gx = 0; gx < width; gx++) {
        const { px, py } = this.gridToPixel(gx, gy);
        const cell = new GridCell(this, gx, gy, px, py, this.cellSize);
        this.gridCells.push(cell);
      }
    }

    // Create arrow tiles
    const boardState = this.boardManager.boardState;
    for (const arrowState of boardState.arrows) {
      const def = arrowState.definition;
      const { px, py } = this.gridToPixel(def.x, def.y);
      const tile = new ArrowTile(this, def, px, py, this.cellSize);

      tile.on(ArrowTile.EVENT_TAPPED, (arrowId: string) => {
        this.handleArrowTap(arrowId);
      });

      this.arrowTiles.set(def.id, tile);
    }
  }

  private gridToPixel(gx: number, gy: number): { px: number; py: number } {
    return {
      px: this.boardOriginX + gx * (this.cellSize + GRID.CELL_GAP) + this.cellSize / 2,
      py: this.boardOriginY + gy * (this.cellSize + GRID.CELL_GAP) + this.cellSize / 2,
    };
  }

  /**
   * Handle an arrow tap with audio, animation, and victory handling.
   */
  private async handleArrowTap(arrowId: string): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.clearMessage();

    AudioManager.getInstance().playTap();

    const result = this.boardManager.selectArrow(arrowId);
    const tile = this.arrowTiles.get(arrowId);

    if (result.valid && tile) {
      AudioManager.getInstance().playExit();
      await tile.playExitAnimation();

      if (this.boardManager.isComplete) {
        AudioManager.getInstance().playWin();
        const levelId = this.boardManager.level.id;

        let streakInfo: { newStreak: number; isNewMax: boolean } | undefined;
        if (this.isDaily) {
          const dateStr = levelId.replace('daily_', '');
          streakInfo = SaveManager.getInstance().completeDailyChallenge(dateStr);
          AnalyticsManager.getInstance().logEvent('daily_challenge_completed', {
            dateStr,
            moves: this.boardManager.moveCount,
            streak: streakInfo.newStreak,
          });
        } else {
          SaveManager.getInstance().completeLevel(levelId);
          AnalyticsManager.getInstance().logEvent('level_completed', {
            levelId,
            moves: this.boardManager.moveCount,
          });
        }

        this.time.delayedCall(ANIM.RESULT_DELAY, () => {
          this.scene.start('ResultScene', {
            levelId: this.boardManager.level.id,
            moveCount: this.boardManager.moveCount,
            isDaily: this.isDaily,
            streakInfo,
          });
        });
      }
    } else if (tile) {
      AudioManager.getInstance().playBlocked();
      await tile.playBlockedAnimation();

      if (result.blockers && result.blockers.length > 0) {
        this.showMessage(`Blocked by ${result.blockers.length} arrow${result.blockers.length > 1 ? 's' : ''}!`);
        for (const blockerId of result.blockers) {
          const blockerTile = this.arrowTiles.get(blockerId);
          if (blockerTile) {
            this.tweens.add({
              targets: blockerTile,
              alpha: 0.35,
              duration: 180,
              yoyo: true,
              repeat: 1,
            });
          }
        }
      } else {
        this.showMessage(result.reason || 'Arrow cannot exit!');
      }
    }

    this.updateUI();
    this.isProcessing = false;
  }

  private handleUndo(): void {
    if (this.isProcessing) return;

    const success = this.boardManager.undo();
    if (success) {
      AudioManager.getInstance().playHint();
      AnalyticsManager.getInstance().logEvent('undo_used', { levelId: this.boardManager.level.id });
      this.rebuildArrows();
      this.updateUI();
      this.clearMessage();
    } else {
      this.showMessage('Nothing to undo.');
    }
  }

  private handleRestart(): void {
    if (this.isProcessing) return;
    AudioManager.getInstance().playTap();
    this.boardManager.restart();
    this.rebuildArrows();
    this.updateUI();
    this.clearMessage();
  }

  private handleHint(): void {
    if (this.isProcessing) return;

    const hint = this.boardManager.getHint();
    if (hint.available && hint.arrowId) {
      AudioManager.getInstance().playHint();
      AnalyticsManager.getInstance().logEvent('hint_used', { levelId: this.boardManager.level.id });
      const tile = this.arrowTiles.get(hint.arrowId);
      if (tile) {
        tile.highlightForHint();
      }
      this.showMessage(hint.message);
    } else {
      AudioManager.getInstance().playBlocked();
      this.showMessage(hint.message);
    }
  }

  private rebuildArrows(): void {
    for (const tile of this.arrowTiles.values()) {
      tile.destroy();
    }
    this.arrowTiles.clear();

    const boardState = this.boardManager.boardState;
    for (const arrowState of boardState.arrows) {
      if (!arrowState.active) continue;

      const def = arrowState.definition;
      const { px, py } = this.gridToPixel(def.x, def.y);
      const tile = new ArrowTile(this, def, px, py, this.cellSize);

      tile.on(ArrowTile.EVENT_TAPPED, (arrowId: string) => {
        this.handleArrowTap(arrowId);
      });

      this.arrowTiles.set(def.id, tile);
    }
  }

  private updateUI(): void {
    this.moveCountText.setText(`Moves: ${this.boardManager.moveCount}`);
    this.remainingText.setText(`Remaining: ${this.boardManager.getRemainingCount()}`);
  }

  private showMessage(text: string): void {
    this.messageText.setText(text);
    this.time.delayedCall(3000, () => {
      if (this.messageText.text === text) {
        this.messageText.setText('');
      }
    });
  }

  private clearMessage(): void {
    this.messageText.setText('');
  }
}
