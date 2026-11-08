/**
 * AROWGO — DailyChallengeGenerator
 *
 * Generates a deterministic, mathematically guaranteed solvable puzzle for any given date.
 * Uses a reverse-construction algorithm with a seeded PRNG so every player gets the exact
 * same puzzle on any given calendar day.
 */
import { LevelDefinition, ArrowDefinition, Direction } from '@/data/types';
import { validateLevel } from './LevelValidator';

const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

/**
 * Mulberry32 seeded pseudo-random number generator.
 */
function createRng(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate numeric seed from date string 'YYYY-MM-DD'.
 */
export function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates a guaranteed solvable Daily Challenge level for a specific date.
 */
export function generateDailyChallenge(dateStr: string): LevelDefinition {
  const seed = dateToSeed(dateStr);
  const rng = createRng(seed);

  const width = 4;
  const height = 4;
  const arrowCount = 6 + Math.floor(rng() * 3); // 6 to 8 arrows

  // We construct the puzzle in reverse order:
  // Step 1: Start with empty board.
  // Step 2: Add arrows one by one such that each new arrow's exit path to the edge
  // does not intersect any ALREADY placed arrow (meaning this new arrow could exit BEFORE them in forward play).
  const occupied = new Map<string, ArrowDefinition>();
  const solutionOrder: string[] = []; // In forward solving order

  let attempts = 0;
  while (occupied.size < arrowCount && attempts < 500) {
    attempts++;
    const gx = Math.floor(rng() * width);
    const gy = Math.floor(rng() * height);
    const posKey = `${gx},${gy}`;

    if (occupied.has(posKey)) continue;

    // Pick a direction that has a clear path to edge (among currently placed arrows)
    const shuffledDirs = [...DIRECTIONS].sort(() => rng() - 0.5);

    let chosenDir: Direction | null = null;
    for (const dir of shuffledDirs) {
      let isPathClear = true;
      if (dir === 'right') {
        for (let x = gx + 1; x < width; x++) {
          if (occupied.has(`${x},${gy}`)) { isPathClear = false; break; }
        }
      } else if (dir === 'left') {
        for (let x = gx - 1; x >= 0; x--) {
          if (occupied.has(`${x},${gy}`)) { isPathClear = false; break; }
        }
      } else if (dir === 'down') {
        for (let y = gy + 1; y < height; y++) {
          if (occupied.has(`${gx},${y}`)) { isPathClear = false; break; }
        }
      } else if (dir === 'up') {
        for (let y = gy - 1; y >= 0; y--) {
          if (occupied.has(`${gx},${y}`)) { isPathClear = false; break; }
        }
      }

      if (isPathClear) {
        chosenDir = dir;
        break;
      }
    }

    if (chosenDir) {
      const arrowId = `d${occupied.size + 1}`;
      const def: ArrowDefinition = {
        id: arrowId,
        x: gx,
        y: gy,
        direction: chosenDir,
      };
      occupied.set(posKey, def);
      // Because this arrow can exit with all currently placed arrows still on board,
      // in forward play it can exit right now! So it goes at the FRONT of solution order.
      solutionOrder.unshift(arrowId);
    }
  }

  const arrows = Array.from(occupied.values());

  const level: LevelDefinition = {
    id: `daily_${dateStr}`,
    name: `Daily Challenge`,
    width,
    height,
    arrows,
    solution: solutionOrder,
    difficulty: 'medium',
    tutorial: `Daily Challenge for ${dateStr}. Clear all arrows!`,
  };

  // Verify with LevelValidator
  const validation = validateLevel(level);
  if (!validation.valid || !validation.solvable) {
    // Fallback safe preset if random generator didn't find a solution
    return {
      id: `daily_${dateStr}`,
      name: `Daily Challenge`,
      width: 4,
      height: 4,
      arrows: [
        { id: 'd1', x: 0, y: 0, direction: 'right' },
        { id: 'd2', x: 1, y: 0, direction: 'down' },
        { id: 'd3', x: 1, y: 1, direction: 'right' },
        { id: 'd4', x: 2, y: 1, direction: 'down' },
        { id: 'd5', x: 2, y: 2, direction: 'right' },
        { id: 'd6', x: 3, y: 2, direction: 'down' },
      ],
      solution: ['d6', 'd5', 'd4', 'd3', 'd2', 'd1'],
      difficulty: 'medium',
      tutorial: `Daily Challenge for ${dateStr}. Clear all arrows!`,
    };
  }

  return level;
}
