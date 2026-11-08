import { describe, it, expect } from 'vitest';
import { validateStructure, checkSolvability, validateLevel } from '../src/game/systems/LevelValidator';
import { LevelDefinition } from '../src/data/types';

// ───── Helper levels ─────

/** A simple solvable 3×3 level: a1 and a2 are both free to exit. */
const validSolvableLevel: LevelDefinition = {
  id: 'valid-solvable',
  width: 3,
  height: 3,
  arrows: [
    { id: 'a1', x: 0, y: 0, direction: 'right' },
    { id: 'a2', x: 2, y: 2, direction: 'down' },
  ],
};

/**
 * Unsolvable 2×1 level: two arrows face each other and permanently block.
 * a1→ ←a2 on a 2-cell board — neither can move.
 */
const unsolvableLevel: LevelDefinition = {
  id: 'unsolvable',
  width: 2,
  height: 1,
  arrows: [
    { id: 'a1', x: 0, y: 0, direction: 'right' },
    { id: 'a2', x: 1, y: 0, direction: 'left' },
  ],
};

describe('validateStructure', () => {
  it('returns no errors for a valid level', () => {
    const { errors } = validateStructure(validSolvableLevel);
    expect(errors).toHaveLength(0);
  });

  it('errors on duplicate arrow IDs', () => {
    const level: LevelDefinition = {
      id: 'dup-ids',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: 0, y: 0, direction: 'right' },
        { id: 'a1', x: 1, y: 1, direction: 'left' },
      ],
    };
    const { errors } = validateStructure(level);
    expect(errors.some(e => e.toLowerCase().includes('duplicate'))).toBe(true);
  });

  it('errors on out-of-bounds arrow positions', () => {
    const level: LevelDefinition = {
      id: 'oob',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: 5, y: 0, direction: 'right' },
      ],
    };
    const { errors } = validateStructure(level);
    expect(errors.some(e => e.toLowerCase().includes('out of bounds'))).toBe(true);
  });

  it('errors on negative arrow positions', () => {
    const level: LevelDefinition = {
      id: 'neg-pos',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: -1, y: 0, direction: 'right' },
      ],
    };
    const { errors } = validateStructure(level);
    expect(errors.some(e => e.toLowerCase().includes('out of bounds'))).toBe(true);
  });

  it('errors on overlapping arrow positions', () => {
    const level: LevelDefinition = {
      id: 'overlap',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: 1, y: 1, direction: 'right' },
        { id: 'a2', x: 1, y: 1, direction: 'left' },
      ],
    };
    const { errors } = validateStructure(level);
    expect(errors.some(e => e.toLowerCase().includes('multiple arrows'))).toBe(true);
  });

  it('errors on empty arrows array', () => {
    const level: LevelDefinition = {
      id: 'no-arrows',
      width: 3,
      height: 3,
      arrows: [],
    };
    const { errors } = validateStructure(level);
    expect(errors.some(e => e.toLowerCase().includes('no arrows'))).toBe(true);
  });

  it('errors on invalid board width', () => {
    const level: LevelDefinition = {
      id: 'bad-width',
      width: 0,
      height: 3,
      arrows: [
        { id: 'a1', x: 0, y: 0, direction: 'right' },
      ],
    };
    const { errors } = validateStructure(level);
    expect(errors.some(e => e.toLowerCase().includes('width'))).toBe(true);
  });

  it('errors on invalid board height', () => {
    const level: LevelDefinition = {
      id: 'bad-height',
      width: 3,
      height: 11,
      arrows: [
        { id: 'a1', x: 0, y: 0, direction: 'right' },
      ],
    };
    const { errors } = validateStructure(level);
    expect(errors.some(e => e.toLowerCase().includes('height'))).toBe(true);
  });

  it('warns when there are fewer than 2 arrows', () => {
    const level: LevelDefinition = {
      id: 'few-arrows',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: 0, y: 0, direction: 'right' },
      ],
    };
    const { warnings } = validateStructure(level);
    expect(warnings.some(w => w.toLowerCase().includes('fewer than 2'))).toBe(true);
  });
});

describe('checkSolvability', () => {
  it('detects a solvable level and returns a solution', () => {
    const result = checkSolvability(validSolvableLevel);
    expect(result.solvable).toBe(true);
    expect(result.solution).toBeDefined();
    expect(result.solution!.length).toBeGreaterThan(0);
  });

  it('detects an unsolvable level', () => {
    const result = checkSolvability(unsolvableLevel);
    expect(result.solvable).toBe(false);
    expect(result.solution).toBeUndefined();
  });

  it('returns a valid move sequence for a solvable level', () => {
    const level: LevelDefinition = {
      id: 'ordered',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: 0, y: 0, direction: 'up' },   // clear immediately
        { id: 'a2', x: 1, y: 0, direction: 'up' },   // clear immediately
        { id: 'a3', x: 2, y: 0, direction: 'up' },   // clear immediately
      ],
    };
    const result = checkSolvability(level);
    expect(result.solvable).toBe(true);
    expect(result.solution).toBeDefined();
    // Solution should contain all 3 arrow IDs
    expect(result.solution!.sort()).toEqual(['a1', 'a2', 'a3']);
  });

  it('solves a level requiring a specific order', () => {
    // a1 faces right, blocked by a2. a2 faces up, is clear.
    // Must clear a2 first, then a1.
    const level: LevelDefinition = {
      id: 'order-matters',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: 0, y: 1, direction: 'right' },
        { id: 'a2', x: 2, y: 1, direction: 'up' },
      ],
    };
    const result = checkSolvability(level);
    expect(result.solvable).toBe(true);
    expect(result.solution).toEqual(['a2', 'a1']);
  });
});

describe('validateLevel', () => {
  it('returns valid=true and solvable=true for a good level', () => {
    const result = validateLevel(validSolvableLevel);
    expect(result.valid).toBe(true);
    expect(result.solvable).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.solution).toBeDefined();
  });

  it('returns valid=false when structural errors exist (skips solvability)', () => {
    const level: LevelDefinition = {
      id: 'struct-error',
      width: 3,
      height: 3,
      arrows: [],
    };
    const result = validateLevel(level);
    expect(result.valid).toBe(false);
    expect(result.solvable).toBe(false);
  });

  it('returns valid=false and solvable=false for an unsolvable level', () => {
    const result = validateLevel(unsolvableLevel);
    expect(result.valid).toBe(false);
    expect(result.solvable).toBe(false);
    expect(result.errors.some(e => e.toLowerCase().includes('not solvable'))).toBe(true);
  });

  it('verifies a declared solution that is correct', () => {
    const level: LevelDefinition = {
      id: 'declared-ok',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: 0, y: 0, direction: 'up' },
        { id: 'a2', x: 2, y: 2, direction: 'down' },
      ],
      solution: ['a1', 'a2'],
    };
    const result = validateLevel(level);
    expect(result.valid).toBe(true);
    expect(result.solvable).toBe(true);
    // No warnings about the declared solution failing
    expect(result.warnings.some(w => w.includes('Declared solution fails'))).toBe(false);
  });

  it('warns when a declared solution is invalid', () => {
    const level: LevelDefinition = {
      id: 'declared-bad',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: 0, y: 1, direction: 'right' },
        { id: 'a2', x: 2, y: 1, direction: 'up' },
      ],
      // Wrong order: a1 is blocked by a2, so a1 can't go first
      solution: ['a1', 'a2'],
    };
    const result = validateLevel(level);
    // The level is still solvable (a2 then a1 works), but the declared solution is wrong
    expect(result.solvable).toBe(true);
    expect(result.warnings.some(w => w.includes('Declared solution fails'))).toBe(true);
  });

  it('warns when declared solution does not clear all arrows', () => {
    const level: LevelDefinition = {
      id: 'declared-incomplete',
      width: 3,
      height: 3,
      arrows: [
        { id: 'a1', x: 0, y: 0, direction: 'up' },
        { id: 'a2', x: 2, y: 2, direction: 'down' },
      ],
      // Only clears one of two arrows
      solution: ['a1'],
    };
    const result = validateLevel(level);
    expect(result.solvable).toBe(true);
    expect(result.warnings.some(w => w.includes('does not clear all arrows'))).toBe(true);
  });

  it('propagates structural errors without checking solvability', () => {
    const level: LevelDefinition = {
      id: 'multi-error',
      width: 0,
      height: 0,
      arrows: [
        { id: 'a1', x: 0, y: 0, direction: 'right' },
        { id: 'a1', x: 1, y: 0, direction: 'left' },
      ],
    };
    const result = validateLevel(level);
    expect(result.valid).toBe(false);
    expect(result.solvable).toBe(false);
    // Should have multiple errors
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
