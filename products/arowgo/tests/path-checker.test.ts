import { describe, it, expect } from 'vitest';
import { checkPath, getMovableArrows } from '../src/game/systems/PathChecker';
import { createBoardState } from '../src/game/systems/MoveResolver';
import { LevelDefinition, BoardState } from '../src/data/types';

/** Helper to create a board from a minimal level definition. */
function makeBoard(level: LevelDefinition): BoardState {
  return createBoardState(level);
}

describe('checkPath', () => {
  // ───── Arrow with empty exit path ─────
  it('returns clear when no arrows block the exit path (right)', () => {
    const level: LevelDefinition = {
      id: 'test-clear-right',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 0, y: 2, direction: 'right' },
      ],
    };
    const board = makeBoard(level);
    const result = checkPath(board, 'a1');
    expect(result.clear).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it('returns clear when no arrows block the exit path (left)', () => {
    const level: LevelDefinition = {
      id: 'test-clear-left',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 4, y: 2, direction: 'left' },
      ],
    };
    const board = makeBoard(level);
    const result = checkPath(board, 'a1');
    expect(result.clear).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it('returns clear when no arrows block the exit path (up)', () => {
    const level: LevelDefinition = {
      id: 'test-clear-up',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 2, y: 4, direction: 'up' },
      ],
    };
    const board = makeBoard(level);
    const result = checkPath(board, 'a1');
    expect(result.clear).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it('returns clear when no arrows block the exit path (down)', () => {
    const level: LevelDefinition = {
      id: 'test-clear-down',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 2, y: 0, direction: 'down' },
      ],
    };
    const board = makeBoard(level);
    const result = checkPath(board, 'a1');
    expect(result.clear).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  // ───── Arrow blocked by one tile ─────
  it('detects a single blocker in the right direction', () => {
    const level: LevelDefinition = {
      id: 'test-blocked-right',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 1, y: 2, direction: 'right' },
        { id: 'a2', x: 3, y: 2, direction: 'up' },
      ],
    };
    const board = makeBoard(level);
    const result = checkPath(board, 'a1');
    expect(result.clear).toBe(false);
    expect(result.blockers).toContain('a2');
    expect(result.blockers).toHaveLength(1);
  });

  it('detects a single blocker in the left direction', () => {
    const level: LevelDefinition = {
      id: 'test-blocked-left',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 3, y: 2, direction: 'left' },
        { id: 'a2', x: 1, y: 2, direction: 'down' },
      ],
    };
    const board = makeBoard(level);
    const result = checkPath(board, 'a1');
    expect(result.clear).toBe(false);
    expect(result.blockers).toContain('a2');
  });

  it('detects a single blocker in the up direction', () => {
    const level: LevelDefinition = {
      id: 'test-blocked-up',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 2, y: 3, direction: 'up' },
        { id: 'a2', x: 2, y: 1, direction: 'right' },
      ],
    };
    const board = makeBoard(level);
    const result = checkPath(board, 'a1');
    expect(result.clear).toBe(false);
    expect(result.blockers).toContain('a2');
  });

  it('detects a single blocker in the down direction', () => {
    const level: LevelDefinition = {
      id: 'test-blocked-down',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 2, y: 1, direction: 'down' },
        { id: 'a2', x: 2, y: 3, direction: 'left' },
      ],
    };
    const board = makeBoard(level);
    const result = checkPath(board, 'a1');
    expect(result.clear).toBe(false);
    expect(result.blockers).toContain('a2');
  });

  // ───── Arrow blocked by multiple tiles ─────
  it('lists all blockers when multiple arrows are in the path', () => {
    const level: LevelDefinition = {
      id: 'test-multi-block',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 0, y: 2, direction: 'right' },
        { id: 'b1', x: 2, y: 2, direction: 'up' },
        { id: 'b2', x: 4, y: 2, direction: 'down' },
      ],
    };
    const board = makeBoard(level);
    const result = checkPath(board, 'a1');
    expect(result.clear).toBe(false);
    expect(result.blockers).toHaveLength(2);
    expect(result.blockers).toContain('b1');
    expect(result.blockers).toContain('b2');
  });

  // ───── Arrow at each board edge can always exit ─────
  it('arrow at right edge facing right has a clear path (no cells to check)', () => {
    const level: LevelDefinition = {
      id: 'test-edge-right',
      width: 4,
      height: 4,
      arrows: [
        { id: 'a1', x: 3, y: 1, direction: 'right' },
      ],
    };
    const board = makeBoard(level);
    const result = checkPath(board, 'a1');
    expect(result.clear).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it('arrow at left edge facing left has a clear path', () => {
    const level: LevelDefinition = {
      id: 'test-edge-left',
      width: 4,
      height: 4,
      arrows: [
        { id: 'a1', x: 0, y: 1, direction: 'left' },
      ],
    };
    const board = makeBoard(level);
    const result = checkPath(board, 'a1');
    expect(result.clear).toBe(true);
  });

  it('arrow at top edge facing up has a clear path', () => {
    const level: LevelDefinition = {
      id: 'test-edge-top',
      width: 4,
      height: 4,
      arrows: [
        { id: 'a1', x: 1, y: 0, direction: 'up' },
      ],
    };
    const board = makeBoard(level);
    const result = checkPath(board, 'a1');
    expect(result.clear).toBe(true);
  });

  it('arrow at bottom edge facing down has a clear path', () => {
    const level: LevelDefinition = {
      id: 'test-edge-bottom',
      width: 4,
      height: 4,
      arrows: [
        { id: 'a1', x: 1, y: 3, direction: 'down' },
      ],
    };
    const board = makeBoard(level);
    const result = checkPath(board, 'a1');
    expect(result.clear).toBe(true);
  });

  // ───── Multiple arrows sharing a row/column ─────
  it('arrows in the same row but different directions do not interfere', () => {
    // a1 faces left, a2 faces right — they look away from each other
    const level: LevelDefinition = {
      id: 'test-same-row',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 1, y: 2, direction: 'left' },
        { id: 'a2', x: 3, y: 2, direction: 'right' },
      ],
    };
    const board = makeBoard(level);
    expect(checkPath(board, 'a1').clear).toBe(true);
    expect(checkPath(board, 'a2').clear).toBe(true);
  });

  it('arrows in the same column facing away from each other are both clear', () => {
    const level: LevelDefinition = {
      id: 'test-same-col',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 2, y: 1, direction: 'up' },
        { id: 'a2', x: 2, y: 3, direction: 'down' },
      ],
    };
    const board = makeBoard(level);
    expect(checkPath(board, 'a1').clear).toBe(true);
    expect(checkPath(board, 'a2').clear).toBe(true);
  });

  it('arrow facing toward another in the same row is blocked', () => {
    const level: LevelDefinition = {
      id: 'test-face-toward',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 1, y: 2, direction: 'right' },
        { id: 'a2', x: 3, y: 2, direction: 'left' },
      ],
    };
    const board = makeBoard(level);
    // a1 faces right and a2 is at x=3 on the same row → blocked
    expect(checkPath(board, 'a1').clear).toBe(false);
    // a2 faces left and a1 is at x=1 on the same row → blocked
    expect(checkPath(board, 'a2').clear).toBe(false);
  });

  // ───── Inactive (cleared) arrows don't block ─────
  it('inactive arrow does not block the path', () => {
    const level: LevelDefinition = {
      id: 'test-inactive',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 0, y: 2, direction: 'right' },
        { id: 'a2', x: 3, y: 2, direction: 'up' },
      ],
    };
    const board = makeBoard(level);

    // Initially a1 is blocked by a2
    expect(checkPath(board, 'a1').clear).toBe(false);

    // Set a2 to inactive (simulating it was cleared)
    const modifiedBoard: BoardState = {
      ...board,
      arrows: board.arrows.map(a =>
        a.definition.id === 'a2' ? { ...a, active: false } : a
      ),
    };
    expect(checkPath(modifiedBoard, 'a1').clear).toBe(true);
  });

  // ───── Non-existent / inactive arrow returns not clear ─────
  it('returns not clear for a non-existent arrow ID', () => {
    const level: LevelDefinition = {
      id: 'test-nonexistent',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: 0, y: 0, direction: 'right' },
      ],
    };
    const board = makeBoard(level);
    const result = checkPath(board, 'does-not-exist');
    expect(result.clear).toBe(false);
    expect(result.blockers).toEqual([]);
  });

  it('returns not clear when the arrow is inactive', () => {
    const level: LevelDefinition = {
      id: 'test-inactive-self',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: 0, y: 0, direction: 'right' },
      ],
    };
    const board: BoardState = {
      ...makeBoard(level),
      arrows: [{ definition: level.arrows[0], active: false }],
    };
    const result = checkPath(board, 'a1');
    expect(result.clear).toBe(false);
    expect(result.blockers).toEqual([]);
  });

  // ───── Arrow not in same row/col doesn't block ─────
  it('arrow in a different row does not block a horizontal path', () => {
    const level: LevelDefinition = {
      id: 'test-diff-row',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 0, y: 2, direction: 'right' },
        { id: 'a2', x: 3, y: 3, direction: 'left' }, // different row
      ],
    };
    const board = makeBoard(level);
    expect(checkPath(board, 'a1').clear).toBe(true);
  });
});

describe('getMovableArrows', () => {
  it('returns all arrows when all have clear paths', () => {
    const level: LevelDefinition = {
      id: 'test-all-movable',
      width: 5,
      height: 5,
      arrows: [
        { id: 'a1', x: 0, y: 0, direction: 'left' },
        { id: 'a2', x: 4, y: 4, direction: 'right' },
        { id: 'a3', x: 2, y: 0, direction: 'up' },
      ],
    };
    const board = makeBoard(level);
    const movable = getMovableArrows(board);
    expect(movable).toHaveLength(3);
    expect(movable).toContain('a1');
    expect(movable).toContain('a2');
    expect(movable).toContain('a3');
  });

  it('excludes blocked arrows', () => {
    // a1 faces right, a2 is directly in its path; a2 faces up and is clear
    const level: LevelDefinition = {
      id: 'test-partial-movable',
      width: 4,
      height: 4,
      arrows: [
        { id: 'a1', x: 0, y: 1, direction: 'right' },
        { id: 'a2', x: 2, y: 1, direction: 'up' },
      ],
    };
    const board = makeBoard(level);
    const movable = getMovableArrows(board);
    expect(movable).toContain('a2');
    expect(movable).not.toContain('a1');
  });

  it('returns empty array when no arrows can move', () => {
    // Two arrows directly blocking each other in a tight 2x1 board
    const level: LevelDefinition = {
      id: 'test-none-movable',
      width: 2,
      height: 1,
      arrows: [
        { id: 'a1', x: 0, y: 0, direction: 'right' },
        { id: 'a2', x: 1, y: 0, direction: 'left' },
      ],
    };
    const board = makeBoard(level);
    const movable = getMovableArrows(board);
    expect(movable).toHaveLength(0);
  });

  it('excludes inactive arrows from the result', () => {
    const level: LevelDefinition = {
      id: 'test-inactive-excluded',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: 0, y: 0, direction: 'right' },
      ],
    };
    const board: BoardState = {
      ...makeBoard(level),
      arrows: [{ definition: level.arrows[0], active: false }],
    };
    const movable = getMovableArrows(board);
    expect(movable).toHaveLength(0);
  });
});
