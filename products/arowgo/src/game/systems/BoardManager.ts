import { LevelDefinition, BoardState, MoveResult, HintResult } from '@/data/types';
import { createBoardState, resolveMove, undoMove, isBoardComplete, restartBoard } from './MoveResolver';
import { checkPath, getMovableArrows } from './PathChecker';
import { getHint } from './HintResolver';

/**
 * BoardManager — orchestrates game logic for a single level.
 * Pure logic, no Phaser dependency.
 */
export class BoardManager {
  private _boardState: BoardState;
  private _isComplete: boolean = false;

  constructor(level: LevelDefinition) {
    this._boardState = createBoardState(level);
  }

  /** Current board state (read-only reference) */
  get boardState(): BoardState {
    return this._boardState;
  }

  /** Whether the level is complete */
  get isComplete(): boolean {
    return this._isComplete;
  }

  /** Number of moves made */
  get moveCount(): number {
    return this._boardState.moveCount;
  }

  /** Level definition */
  get level(): LevelDefinition {
    return this._boardState.level;
  }

  /**
   * Attempt to select and clear an arrow.
   */
  selectArrow(arrowId: string): MoveResult {
    if (this._isComplete) {
      return { valid: false, reason: 'Level is already complete.' };
    }

    const result = resolveMove(this._boardState, arrowId);

    if (result.valid && result.boardState) {
      this._boardState = result.boardState;
      this._isComplete = isBoardComplete(this._boardState);
    }

    return result;
  }

  /**
   * Undo the last move.
   * Returns true if undo was performed.
   */
  undo(): boolean {
    if (this._isComplete) {
      // Allow undo from complete state
      this._isComplete = false;
    }

    const previous = undoMove(this._boardState);
    if (previous) {
      this._boardState = previous;
      return true;
    }
    return false;
  }

  /**
   * Restart the level.
   */
  restart(): void {
    this._boardState = restartBoard(this._boardState);
    this._isComplete = false;
  }

  /**
   * Get a hint for the next move.
   */
  getHint(): HintResult {
    return getHint(this._boardState);
  }

  /**
   * Get IDs of all currently movable arrows.
   */
  getMovableArrows(): string[] {
    return getMovableArrows(this._boardState);
  }

  /**
   * Check if a specific arrow's path is clear.
   */
  checkArrowPath(arrowId: string) {
    return checkPath(this._boardState, arrowId);
  }

  /**
   * Check if the player is stuck (no movable arrows but board not complete).
   */
  isStuck(): boolean {
    return !this._isComplete && getMovableArrows(this._boardState).length === 0;
  }

  /**
   * Get the number of remaining active arrows.
   */
  getRemainingCount(): number {
    return this._boardState.arrows.filter(a => a.active).length;
  }
}
