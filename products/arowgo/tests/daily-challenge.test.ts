import { describe, it, expect } from 'vitest';
import { generateDailyChallenge, dateToSeed } from '../src/game/systems/DailyChallengeGenerator';
import { validateLevel } from '../src/game/systems/LevelValidator';

describe('DailyChallengeGenerator', () => {
  it('generates consistent seed from date string', () => {
    const seed1 = dateToSeed('2026-11-08');
    const seed2 = dateToSeed('2026-11-08');
    const seed3 = dateToSeed('2026-11-09');

    expect(seed1).toBe(seed2);
    expect(seed1).not.toBe(seed3);
  });

  it('generates deterministic identical levels for the same date', () => {
    const level1 = generateDailyChallenge('2026-11-08');
    const level2 = generateDailyChallenge('2026-11-08');

    expect(level1.id).toBe(level2.id);
    expect(level1.arrows).toEqual(level2.arrows);
  });

  it('generates valid and solvable puzzles across multiple consecutive calendar dates', () => {
    const sampleDates = [
      '2026-11-08',
      '2026-11-09',
      '2026-11-10',
      '2026-11-11',
      '2026-12-01',
      '2027-01-01',
    ];

    for (const date of sampleDates) {
      const level = generateDailyChallenge(date);
      const validation = validateLevel(level);

      expect(validation.errors).toEqual([]);
      expect(validation.valid).toBe(true);
      expect(validation.solvable).toBe(true);
      expect(level.arrows.length).toBeGreaterThanOrEqual(4);
    }
  });
});
