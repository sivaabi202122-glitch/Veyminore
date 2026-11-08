/**
 * AROWGO — Core Data Types
 *
 * All game data types. Level definitions are data-driven (JSON).
 * Game logic depends only on these types, not on Phaser.
 */

/** Cardinal directions an arrow can face */
export type Direction = 'up' | 'down' | 'left' | 'right';

/** Grid coordinate */
export interface GridPosition {
  x: number;
  y: number;
}

/** A single arrow tile definition in a level */
export interface ArrowDefinition {
  /** Unique identifier within the level (e.g. "a1") */
  id: string;
  /** Column position (0-based, left to right) */
  x: number;
  /** Row position (0-based, top to bottom) */
  y: number;
  /** Direction the arrow faces */
  direction: Direction;
}

/** A complete level definition as stored in levels.json */
export interface LevelDefinition {
  /** Unique level identifier (e.g. "level_001") */
  id: string;
  /** Board width in cells */
  width: number;
  /** Board height in cells */
  height: number;
  /** Arrow tiles on the board */
  arrows: ArrowDefinition[];
  /** Optional: known solution order (arrow IDs) for hinting */
  solution?: string[];
  /** Optional: difficulty category */
  difficulty?: 'tutorial' | 'easy' | 'medium' | 'hard' | 'advanced';
  /** Optional: human-readable name */
  name?: string;
}

/** Levels file schema — the root of levels.json */
export interface LevelsFile {
  version: string;
  levels: LevelDefinition[];
}

/** Runtime state of an arrow on the board */
export interface ArrowState {
  /** Reference to the definition */
  definition: ArrowDefinition;
  /** Whether this arrow is still active (not yet cleared) */
  active: boolean;
}

/** Full runtime state of the board */
export interface BoardState {
  /** Level definition this board was created from */
  level: LevelDefinition;
  /** Current arrow states */
  arrows: ArrowState[];
  /** Number of moves made */
  moveCount: number;
  /** History of removed arrow IDs for undo */
  moveHistory: string[];
}

/** Result of a path check */
export interface PathCheckResult {
  /** Whether the arrow's exit path is clear */
  clear: boolean;
  /** If blocked, the IDs of blocking arrows */
  blockers: string[];
}

/** Result of attempting a move */
export interface MoveResult {
  /** Whether the move was valid and executed */
  valid: boolean;
  /** Updated board state (only if valid) */
  boardState?: BoardState;
  /** If invalid, info about why */
  reason?: string;
  /** IDs of blocking arrows (if blocked) */
  blockers?: string[];
}

/** Result of level validation */
export interface ValidationResult {
  /** Whether the level is structurally valid */
  valid: boolean;
  /** Whether a solution exists */
  solvable: boolean;
  /** Errors found during validation */
  errors: string[];
  /** Warnings (non-blocking issues) */
  warnings: string[];
  /** A solution sequence if solvable */
  solution?: string[];
}

/** Result of a hint request */
export interface HintResult {
  /** Whether a valid hint was found */
  available: boolean;
  /** The arrow ID to move next */
  arrowId?: string;
  /** Human-readable hint message */
  message: string;
}

/** Game save data stored locally */
export interface SaveData {
  /** Current level ID */
  currentLevelId: string;
  /** Set of completed level IDs */
  completedLevels: string[];
  /** Board state for the current in-progress level, if any */
  inProgressBoard?: BoardState;
  /** Settings */
  settings: GameSettings;
  /** Save timestamp */
  savedAt: string;
}

/** Player-configurable settings */
export interface GameSettings {
  /** Sound effects enabled */
  soundEnabled: boolean;
  /** Music enabled */
  musicEnabled: boolean;
  /** Haptic feedback enabled */
  hapticsEnabled: boolean;
  /** Master volume 0–1 */
  volume: number;
}

/** Default settings */
export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
  volume: 0.8,
};
