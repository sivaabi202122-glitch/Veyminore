import { describe, it, expect } from 'vitest';
import { validateLevel } from '../src/game/systems/LevelValidator';
import levelsData from '../public/levels/levels.json';
import { LevelsFile } from '../src/data/types';

describe('Shipped Levels Solvability & Integrity', () => {
  const file = levelsData as unknown as LevelsFile;

  it('contains valid levels list', () => {
    expect(file.levels).toBeDefined();
    expect(file.levels.length).toBeGreaterThanOrEqual(15);
  });

  file.levels.forEach((level, index) => {
    it(`validates level ${index + 1}: "${level.name || level.id}" is structurally sound and fully solvable`, () => {
      const result = validateLevel(level);

      expect(result.errors).toEqual([]);
      expect(result.valid).toBe(true);
      expect(result.solvable).toBe(true);
      expect(result.solution).toBeDefined();
      expect(result.solution!.length).toBe(level.arrows.length);
    });
  });
});
