import { describe, it, expect } from 'vitest';
import {
  createBoardState,
  resolveMove,
  undoMove,
  isBoardComplete,
  restartBoard,
} from '../src/game/systems/MoveResolver';
import { LevelDefinition, BoardState } from '../src/data/types';

// ───── Helper level definitions ─────

/** Simple 3×3 level with two arrows that can be solved: a1 exits right, then a2 exits left. */
const simpleSolvableLevel: LevelDefinition = {
  id: 'simple-solvable',
  width: 3,
  height: 3,
  arrows: [
    { id: 'a1', x: 0, y: 1, direction: 'right' },
    { id: 'a2', x: 2, y: 0, direction: 'left' },
  ],
};

/** Single-arrow level for trivial tests. */
const singleArrowLevel: LevelDefinition = {
  id: 'single-arrow',
  width: 3,
  height: 3,
  arrows: [
    { id: 'only', x: 1, y: 1, direction: 'up' },
  ],
};

/** Level where a1 is blocked by a2 (same row, a1 faces right toward a2). */
const blockedLevel: LevelDefinition = {
  id: 'blocked',
  width: 4,
  height: 4,
  arrows: [
    { id: 'a1', x: 0, y: 2, direction: 'right' },
    { id: 'a2', x: 2, y: 2, direction: 'up' },
  ],
};

describe('createBoardState', () => {
  it('creates a board with all arrows active', () => {
    const board = createBoardState(simpleSolvableLevel);
    expect(board.arrows).toHaveLength(2);
    expect(board.arrows.every(a => a.active)).toBe(true);
  });

  it('initialises moveCount to 0 and moveHistory to empty', () => {
    const board = createBoardState(simpleSolvableLevel);
    expect(board.moveCount).toBe(0);
    expect(board.moveHistory).toEqual([]);
  });

  it('preserves the level reference', () => {
    const board = createBoardState(simpleSolvableLevel);
    expect(board.level).toBe(simpleSolvableLevel);
  });

  it('maps arrow definitions correctly', () => {
    const board = createBoardState(simpleSolvableLevel);
    const defs = board.arrows.map(a => a.definition);
    expect(defs).toEqual(simpleSolvableLevel.arrows);
  });
});

describe('resolveMove', () => {
  it('returns a new board state with the arrow set to inactive on a valid move', () => {
    const board = createBoardState(singleArrowLevel);
    const result = resolveMove(board, 'only');
    expect(result.valid).toBe(true);
    expect(result.boardState).toBeDefined();
    expect(result.boardState!.arrows[0].active).toBe(false);
  });

  it('does not mutate the original board state', () => {
    const board = createBoardState(singleArrowLevel);
    resolveMove(board, 'only');
    // Original should still have active arrow
    expect(board.arrows[0].active).toBe(true);
    expect(board.moveCount).toBe(0);
    expect(board.moveHistory).toEqual([]);
  });

  it('increments moveCount on a valid move', () => {
    const board = createBoardState(singleArrowLevel);
    const result = resolveMove(board, 'only');
    expect(result.boardState!.moveCount).toBe(1);
  });

  it('adds arrowId to moveHistory on a valid move', () => {
    const board = createBoardState(singleArrowLevel);
    const result = resolveMove(board, 'only');
    expect(result.boardState!.moveHistory).toEqual(['only']);
  });

  it('accumulates moveHistory across multiple moves', () => {
    // a2 is clear (faces left, nothing to its left at row 0)
    // after clearing a2, a1 faces right and row 2 is clear → can clear a1
    const board = createBoardState(blockedLevel);
    const r1 = resolveMove(board, 'a2'); // a2 faces up, top is clear
    expect(r1.valid).toBe(true);
    const r2 = resolveMove(r1.boardState!, 'a1');
    expect(r2.valid).toBe(true);
    expect(r2.boardState!.moveCount).toBe(2);
    expect(r2.boardState!.moveHistory).toEqual(['a2', 'a1']);
  });

  it('returns invalid with reason when arrow is blocked', () => {
    const board = createBoardState(blockedLevel);
    const result = resolveMove(board, 'a1');
    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
    expect(result.blockers).toContain('a2');
  });

  it('returns invalid when selecting a non-existent arrow', () => {
    const board = createBoardState(singleArrowLevel);
    const result = resolveMove(board, 'ghost');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('ghost');
  });

  it('returns invalid when selecting an already-cleared arrow', () => {
    const board = createBoardState(singleArrowLevel);
    const r1 = resolveMove(board, 'only');
    expect(r1.valid).toBe(true);

    const r2 = resolveMove(r1.boardState!, 'only');
    expect(r2.valid).toBe(false);
    expect(r2.reason).toContain('already been cleared');
  });
});

describe('isBoardComplete', () => {
  it('returns false when arrows are still active', () => {
    const board = createBoardState(singleArrowLevel);
    expect(isBoardComplete(board)).toBe(false);
  });

  it('returns true when all arrows have been cleared', () => {
    const board = createBoardState(singleArrowLevel);
    const result = resolveMove(board, 'only');
    expect(isBoardComplete(result.boardState!)).toBe(true);
  });

  it('returns false when only some arrows are cleared', () => {
    const board = createBoardState(blockedLevel);
    const r1 = resolveMove(board, 'a2');
    expect(isBoardComplete(r1.boardState!)).toBe(false);
  });
});

describe('undoMove', () => {
  it('restores the arrow to active state', () => {
    const board = createBoardState(singleArrowLevel);
    const moved = resolveMove(board, 'only').boardState!;
    expect(moved.arrows[0].active).toBe(false);

    const undone = undoMove(moved);
    expect(undone).not.toBeNull();
    expect(undone!.arrows[0].active).toBe(true);
  });

  it('decrements moveCount', () => {
    const board = createBoardState(singleArrowLevel);
    const moved = resolveMove(board, 'only').boardState!;
    const undone = undoMove(moved);
    expect(undone!.moveCount).toBe(0);
  });

  it('removes the last entry from moveHistory', () => {
    const board = createBoardState(singleArrowLevel);
    const moved = resolveMove(board, 'only').boardState!;
    const undone = undoMove(moved);
    expect(undone!.moveHistory).toEqual([]);
  });

  it('returns null when there are no moves to undo', () => {
    const board = createBoardState(singleArrowLevel);
    const result = undoMove(board);
    expect(result).toBeNull();
  });

  it('does not mutate the input board state', () => {
    const board = createBoardState(singleArrowLevel);
    const moved = resolveMove(board, 'only').boardState!;
    undoMove(moved);
    // moved should still have the arrow inactive
    expect(moved.arrows[0].active).toBe(false);
    expect(moved.moveCount).toBe(1);
  });

  it('correctly undoes the latest of multiple moves', () => {
    const board = createBoardState(blockedLevel);
    const r1 = resolveMove(board, 'a2').boardState!;
    const r2 = resolveMove(r1, 'a1').boardState!;

    const undone = undoMove(r2)!;
    // a1 should be active again, a2 should still be inactive
    expect(undone.arrows.find(a => a.definition.id === 'a1')!.active).toBe(true);
    expect(undone.arrows.find(a => a.definition.id === 'a2')!.active).toBe(false);
    expect(undone.moveHistory).toEqual(['a2']);
  });
});

describe('restartBoard', () => {
  it('resets all arrows to active', () => {
    const board = createBoardState(singleArrowLevel);
    const moved = resolveMove(board, 'only').boardState!;
    const restarted = restartBoard(moved);
    expect(restarted.arrows.every(a => a.active)).toBe(true);
  });

  it('resets moveCount to 0', () => {
    const board = createBoardState(singleArrowLevel);
    const moved = resolveMove(board, 'only').boardState!;
    const restarted = restartBoard(moved);
    expect(restarted.moveCount).toBe(0);
  });

  it('clears moveHistory', () => {
    const board = createBoardState(singleArrowLevel);
    const moved = resolveMove(board, 'only').boardState!;
    const restarted = restartBoard(moved);
    expect(restarted.moveHistory).toEqual([]);
  });

  it('preserves the level definition', () => {
    const board = createBoardState(singleArrowLevel);
    const moved = resolveMove(board, 'only').boardState!;
    const restarted = restartBoard(moved);
    expect(restarted.level).toBe(singleArrowLevel);
  });
});
