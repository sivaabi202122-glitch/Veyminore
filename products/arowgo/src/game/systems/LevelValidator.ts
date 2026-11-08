import { LevelDefinition, ValidationResult } from '@/data/types';
import { createBoardState, resolveMove, isBoardComplete } from './MoveResolver';
import { getMovableArrows } from './PathChecker';

/**
 * Validates a level definition for structural correctness.
 */
export function validateStructure(level: LevelDefinition): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check dimensions
  if (level.width < 1 || level.width > 10) {
    errors.push(`Invalid board width: ${level.width}. Must be 1–10.`);
  }
  if (level.height < 1 || level.height > 10) {
    errors.push(`Invalid board height: ${level.height}. Must be 1–10.`);
  }

  // Check arrows exist
  if (!level.arrows || level.arrows.length === 0) {
    errors.push('Level has no arrows.');
  }

  // Check unique IDs
  const ids = level.arrows.map(a => a.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    errors.push(`Duplicate arrow IDs: ${[...new Set(duplicates)].join(', ')}`);
  }

  // Check positions
  for (const arrow of level.arrows) {
    // Valid direction
    if (!['up', 'down', 'left', 'right'].includes(arrow.direction)) {
      errors.push(`Arrow "${arrow.id}" has invalid direction: ${arrow.direction}`);
    }

    // Within bounds
    if (arrow.x < 0 || arrow.x >= level.width || arrow.y < 0 || arrow.y >= level.height) {
      errors.push(`Arrow "${arrow.id}" at (${arrow.x}, ${arrow.y}) is out of bounds for a ${level.width}x${level.height} board.`);
    }
  }

  // Check for overlapping positions
  const positions = new Set<string>();
  for (const arrow of level.arrows) {
    const key = `${arrow.x},${arrow.y}`;
    if (positions.has(key)) {
      errors.push(`Multiple arrows at position (${arrow.x}, ${arrow.y}).`);
    }
    positions.add(key);
  }

  // Warnings
  if (level.arrows.length < 2) {
    warnings.push('Level has fewer than 2 arrows — may be trivial.');
  }
  if (level.arrows.length > 20) {
    warnings.push('Level has more than 20 arrows — may be overwhelming.');
  }

  return { errors, warnings };
}

/**
 * Checks if a level is solvable using BFS (breadth-first search).
 * Returns a solution sequence if found.
 */
export function checkSolvability(level: LevelDefinition): { solvable: boolean; solution?: string[] } {
  const initialBoard = createBoardState(level);

  // BFS to find any solution
  interface SearchNode {
    board: import('@/data/types').BoardState;
    moves: string[];
  }

  const queue: SearchNode[] = [{ board: initialBoard, moves: [] }];
  const visited = new Set<string>();

  // Create a state key from active arrow IDs
  const stateKey = (board: import('@/data/types').BoardState): string => {
    return board.arrows
      .filter(a => a.active)
      .map(a => a.definition.id)
      .sort()
      .join(',');
  };

  visited.add(stateKey(initialBoard));

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Check if solved
    if (isBoardComplete(current.board)) {
      return { solvable: true, solution: current.moves };
    }

    // Get all possible moves
    const movable = getMovableArrows(current.board);

    for (const arrowId of movable) {
      const result = resolveMove(current.board, arrowId);
      if (result.valid && result.boardState) {
        const key = stateKey(result.boardState);
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({
            board: result.boardState,
            moves: [...current.moves, arrowId],
          });
        }
      }
    }
  }

  return { solvable: false };
}

/**
 * Fully validates a level: structure + solvability.
 */
export function validateLevel(level: LevelDefinition): ValidationResult {
  const { errors, warnings } = validateStructure(level);

  // If structural errors exist, don't check solvability
  if (errors.length > 0) {
    return {
      valid: false,
      solvable: false,
      errors,
      warnings,
    };
  }

  const { solvable, solution } = checkSolvability(level);

  if (!solvable) {
    errors.push('Level is not solvable — no valid sequence clears all arrows.');
  }

  // If level has a declared solution, verify it
  if (level.solution && solvable) {
    const verifyBoard = createBoardState(level);
    let currentBoard = verifyBoard;
    let declaredValid = true;

    for (const arrowId of level.solution) {
      const result = resolveMove(currentBoard, arrowId);
      if (!result.valid || !result.boardState) {
        warnings.push(`Declared solution fails at step "${arrowId}": ${result.reason}`);
        declaredValid = false;
        break;
      }
      currentBoard = result.boardState;
    }

    if (declaredValid && !isBoardComplete(currentBoard)) {
      warnings.push('Declared solution does not clear all arrows.');
    }
  }

  return {
    valid: errors.length === 0,
    solvable,
    errors,
    warnings,
    solution,
  };
}
