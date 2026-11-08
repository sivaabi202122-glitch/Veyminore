import { BoardState, PathCheckResult } from '@/data/types';

/**
 * Checks whether an arrow's exit path to the board boundary is clear.
 * Pure function — does not mutate any state.
 */
export function checkPath(boardState: BoardState, arrowId: string): PathCheckResult {
  // Find the arrow
  const arrowState = boardState.arrows.find(a => a.definition.id === arrowId && a.active);
  if (!arrowState) {
    return { clear: false, blockers: [] };
  }

  const { x, y, direction } = arrowState.definition;
  const { width, height } = boardState.level;
  const blockers: string[] = [];

  // Get all cells in the exit path
  const cellsToCheck: Array<{ x: number; y: number }> = [];

  switch (direction) {
    case 'right':
      for (let cx = x + 1; cx < width; cx++) cellsToCheck.push({ x: cx, y });
      break;
    case 'left':
      for (let cx = x - 1; cx >= 0; cx--) cellsToCheck.push({ x: cx, y });
      break;
    case 'down':
      for (let cy = y + 1; cy < height; cy++) cellsToCheck.push({ x, y: cy });
      break;
    case 'up':
      for (let cy = y - 1; cy >= 0; cy--) cellsToCheck.push({ x, y: cy });
      break;
  }

  // Check each cell for active arrows
  for (const cell of cellsToCheck) {
    const blockingArrow = boardState.arrows.find(
      a => a.active && a.definition.x === cell.x && a.definition.y === cell.y
    );
    if (blockingArrow) {
      blockers.push(blockingArrow.definition.id);
    }
  }

  return {
    clear: blockers.length === 0,
    blockers,
  };
}

/**
 * Returns all arrows that can currently be cleared (have clear exit paths).
 */
export function getMovableArrows(boardState: BoardState): string[] {
  return boardState.arrows
    .filter(a => a.active)
    .filter(a => checkPath(boardState, a.definition.id).clear)
    .map(a => a.definition.id);
}
