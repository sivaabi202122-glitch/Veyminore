import { BoardState, MoveResult } from '@/data/types';
import { checkPath } from './PathChecker';

/**
 * Creates the initial board state from a level definition.
 */
export function createBoardState(level: import('@/data/types').LevelDefinition): BoardState {
  return {
    level,
    arrows: level.arrows.map(def => ({
      definition: def,
      active: true,
    })),
    moveCount: 0,
    moveHistory: [],
  };
}

/**
 * Attempts to resolve a move: select and remove an arrow if its path is clear.
 * Returns a new BoardState on success (immutable).
 * Does NOT mutate the input board state.
 */
export function resolveMove(boardState: BoardState, arrowId: string): MoveResult {
  // Find the arrow
  const arrowState = boardState.arrows.find(a => a.definition.id === arrowId);

  if (!arrowState) {
    return {
      valid: false,
      reason: `Arrow "${arrowId}" not found on the board.`,
    };
  }

  if (!arrowState.active) {
    return {
      valid: false,
      reason: `Arrow "${arrowId}" has already been cleared.`,
    };
  }

  // Check the path
  const pathResult = checkPath(boardState, arrowId);

  if (!pathResult.clear) {
    return {
      valid: false,
      reason: `Arrow "${arrowId}" is blocked.`,
      blockers: pathResult.blockers,
    };
  }

  // Execute the move — create a new board state (immutable)
  const newArrows = boardState.arrows.map(a => {
    if (a.definition.id === arrowId) {
      return { ...a, active: false };
    }
    return a;
  });

  const newBoardState: BoardState = {
    ...boardState,
    arrows: newArrows,
    moveCount: boardState.moveCount + 1,
    moveHistory: [...boardState.moveHistory, arrowId],
  };

  return {
    valid: true,
    boardState: newBoardState,
  };
}

/**
 * Undoes the last move, returning the arrow to active state.
 * Returns null if there are no moves to undo.
 */
export function undoMove(boardState: BoardState): BoardState | null {
  if (boardState.moveHistory.length === 0) {
    return null;
  }

  const lastArrowId = boardState.moveHistory[boardState.moveHistory.length - 1];

  const newArrows = boardState.arrows.map(a => {
    if (a.definition.id === lastArrowId) {
      return { ...a, active: true };
    }
    return a;
  });

  return {
    ...boardState,
    arrows: newArrows,
    moveCount: boardState.moveCount - 1,
    moveHistory: boardState.moveHistory.slice(0, -1),
  };
}

/**
 * Checks if the board is complete (all arrows cleared).
 */
export function isBoardComplete(boardState: BoardState): boolean {
  return boardState.arrows.every(a => !a.active);
}

/**
 * Restarts the board to its initial state.
 */
export function restartBoard(boardState: BoardState): BoardState {
  return createBoardState(boardState.level);
}
