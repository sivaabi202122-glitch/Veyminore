import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, GRID, ANIM } from '@/config/game-config';
import { LevelsFile, LevelDefinition } from '@/data/types';
import { BoardManager } from '@/game/systems/BoardManager';
import { GridCell } from '@/game/objects/GridCell';
import { ArrowTile } from '@/game/objects/ArrowTile';

/**
 * GameScene — the core gameplay scene.
 * Renders the board, handles player input, animates moves.
 */
export class GameScene extends Phaser.Scene {
  private boardManager!: BoardManager;
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

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { levelId: string }): void {
    const levelsData = this.cache.json.get('levels') as LevelsFile;
    const levelDef = levelsData.levels.find(l => l.id === data.levelId);

    if (!levelDef) {
      console.error(`Level "${data.levelId}" not found!`);
      this.scene.start('MenuScene');
      return;
    }

    this.boardManager = new BoardManager(levelDef);
  }

  create(): void {
    this.gridCells = [];
    this.arrowTiles = new Map();
    this.isProcessing = false;

    this.createUI();
    this.createBoard();
    this.updateUI();
  }

  /**
   * Create UI elements (header, buttons).
   */
  private createUI(): void {
    const level = this.boardManager.level;

    // Level title
    this.levelText = this.add.text(GAME_WIDTH / 2, 60, level.name || level.id, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Move counter
    this.moveCountText = this.add.text(GAME_WIDTH / 2, 100, 'Moves: 0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Remaining arrows
    this.remainingText = this.add.text(GAME_WIDTH / 2, 130, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#888888',
    }).setOrigin(0.5);

    // Message text (for feedback)
    this.messageText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 200, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#e94560',
    }).setOrigin(0.5);

    // Bottom buttons
    const buttonY = GAME_HEIGHT - 100;
    const buttonStyle = { fontFamily: 'Arial, sans-serif', fontSize: '20px', color: '#ffffff' };

    // Restart button
    const restartBtn = this.createButton(160, buttonY, '↺ Restart', () => this.handleRestart());

    // Undo button
    const undoBtn = this.createButton(360, buttonY, '← Undo', () => this.handleUndo());

    // Hint button
    const hintBtn = this.createButton(560, buttonY, '💡 Hint', () => this.handleHint());

    // Back button
    this.createButton(80, 60, '← Menu', () => {
      this.scene.start('MenuScene');
    }, '18px');
  }

  /**
   * Create a text button with background.
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
    const availableHeight = GAME_HEIGHT - 300; // Leave space for UI
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
    this.boardOriginY = 200 + (availableHeight - boardHeight) / 2;

    // Board background
    const bgPadding = 16;
    this.add.rectangle(
      GAME_WIDTH / 2,
      this.boardOriginY + boardHeight / 2,
      boardWidth + bgPadding * 2,
      boardHeight + bgPadding * 2,
      COLORS.BOARD_BG,
      0.5,
    ).setOrigin(0.5);

    // Create grid cells
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

  /**
   * Convert grid coordinates to pixel coordinates (center of cell).
   */
  private gridToPixel(gx: number, gy: number): { px: number; py: number } {
    return {
      px: this.boardOriginX + gx * (this.cellSize + GRID.CELL_GAP) + this.cellSize / 2,
      py: this.boardOriginY + gy * (this.cellSize + GRID.CELL_GAP) + this.cellSize / 2,
    };
  }

  /**
   * Handle an arrow being tapped.
   */
  private async handleArrowTap(arrowId: string): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.clearMessage();

    const result = this.boardManager.selectArrow(arrowId);
    const tile = this.arrowTiles.get(arrowId);

    if (result.valid && tile) {
      // Play exit animation
      await tile.playExitAnimation();

      // Check for level complete
      if (this.boardManager.isComplete) {
        this.time.delayedCall(ANIM.RESULT_DELAY, () => {
          this.scene.start('ResultScene', {
            levelId: this.boardManager.level.id,
            moveCount: this.boardManager.moveCount,
          });
        });
      }
    } else if (tile) {
      // Play blocked animation
      await tile.playBlockedAnimation();

      // Show feedback
      if (result.blockers && result.blockers.length > 0) {
        this.showMessage(`Blocked by ${result.blockers.length} arrow${result.blockers.length > 1 ? 's' : ''}!`);
        // Briefly highlight blockers
        for (const blockerId of result.blockers) {
          const blockerTile = this.arrowTiles.get(blockerId);
          if (blockerTile) {
            this.tweens.add({
              targets: blockerTile,
              alpha: 0.4,
              duration: 200,
              yoyo: true,
              repeat: 1,
            });
          }
        }
      } else {
        this.showMessage(result.reason || 'Invalid move!');
      }
    }

    this.updateUI();
    this.isProcessing = false;
  }

  /**
   * Handle undo button.
   */
  private handleUndo(): void {
    if (this.isProcessing) return;

    const success = this.boardManager.undo();
    if (success) {
      // Re-render the board (simple approach: rebuild)
      this.rebuildArrows();
      this.updateUI();
      this.clearMessage();
    } else {
      this.showMessage('Nothing to undo.');
    }
  }

  /**
   * Handle restart button.
   */
  private handleRestart(): void {
    if (this.isProcessing) return;
    this.boardManager.restart();
    this.rebuildArrows();
    this.updateUI();
    this.clearMessage();
  }

  /**
   * Handle hint button.
   */
  private handleHint(): void {
    if (this.isProcessing) return;

    const hint = this.boardManager.getHint();
    if (hint.available && hint.arrowId) {
      const tile = this.arrowTiles.get(hint.arrowId);
      if (tile) {
        tile.highlightForHint();
      }
      this.showMessage(hint.message);
    } else {
      this.showMessage(hint.message);
    }
  }

  /**
   * Rebuild arrow visuals from current board state.
   * Used after undo/restart.
   */
  private rebuildArrows(): void {
    // Remove existing arrow tiles
    for (const tile of this.arrowTiles.values()) {
      tile.destroy();
    }
    this.arrowTiles.clear();

    // Recreate from board state
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

  /**
   * Update UI text elements.
   */
  private updateUI(): void {
    this.moveCountText.setText(`Moves: ${this.boardManager.moveCount}`);
    this.remainingText.setText(`Remaining: ${this.boardManager.getRemainingCount()}`);
  }

  /**
   * Show a temporary message to the player.
   */
  private showMessage(text: string): void {
    this.messageText.setText(text);
    // Auto-clear after 3 seconds
    this.time.delayedCall(3000, () => {
      if (this.messageText.text === text) {
        this.messageText.setText('');
      }
    });
  }

  /**
   * Clear the message text.
   */
  private clearMessage(): void {
    this.messageText.setText('');
  }
}
