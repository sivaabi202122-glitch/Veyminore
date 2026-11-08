/**
 * AROWGO — Phaser Game Configuration
 */
import Phaser from 'phaser';

/** Design dimensions (logical resolution) */
export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

/** Grid rendering constants */
export const GRID = {
  /** Padding from screen edges to the board */
  BOARD_PADDING: 40,
  /** Gap between cells */
  CELL_GAP: 4,
  /** Minimum cell size in pixels */
  MIN_CELL_SIZE: 48,
  /** Maximum cell size in pixels */
  MAX_CELL_SIZE: 120,
  /** Arrow inset from cell edge (fraction of cell size) */
  ARROW_INSET: 0.15,
} as const;

/** Color palette */
export const COLORS = {
  BACKGROUND: 0x1a1a2e,
  BOARD_BG: 0x16213e,
  CELL_DEFAULT: 0x0f3460,
  CELL_HIGHLIGHT: 0x533483,
  ARROW_UP: 0xe94560,
  ARROW_DOWN: 0x00b4d8,
  ARROW_LEFT: 0x06d6a0,
  ARROW_RIGHT: 0xffd166,
  ARROW_BLOCKED: 0x666666,
  TEXT_PRIMARY: 0xffffff,
  TEXT_SECONDARY: 0xaaaaaa,
  SUCCESS: 0x06d6a0,
  ERROR: 0xe94560,
} as const;

/** Animation durations in ms */
export const ANIM = {
  ARROW_EXIT: 300,
  ARROW_BLOCKED_SHAKE: 200,
  CELL_HIGHLIGHT: 150,
  SCENE_TRANSITION: 400,
  RESULT_DELAY: 500,
} as const;

/** Phaser configuration factory */
export function createGameConfig(scenes: Phaser.Types.Scenes.SceneType[]): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: COLORS.BACKGROUND,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: scenes,
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    render: {
      pixelArt: false,
      antialias: true,
      antialiasGL: true,
    },
    input: {
      activePointers: 1,
    },
  };
}
