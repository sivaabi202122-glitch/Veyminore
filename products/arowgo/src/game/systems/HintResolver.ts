import { BoardState, HintResult } from '@/data/types';
import { getMovableArrows } from './PathChecker';
import { resolveMove, isBoardComplete } from './MoveResolver';

/**
 * Finds a valid next move that leads toward a solution.
 * Uses BFS to ensure the suggested move doesn't lead to a dead end.
 *
 * If no solvable path exists from the current state, returns the first
 * available move (or unavailable if stuck).
 */
export function getHint(boardState: BoardState): HintResult {
  // If board is already complete, no hint needed
  if (isBoardComplete(boardState)) {
    return {
      available: false,
      message: 'The board is already cleared!',
    };
  }

  const movable = getMovableArrows(boardState);

  if (movable.length === 0) {
    return {
      available: false,
      message: 'No moves available. Try undoing your last move.',
    };
  }

  // Try each movable arrow — use BFS to find one that leads to a solution
  for (const arrowId of movable) {
    const result = resolveMove(boardState, arrowId);
    if (result.valid && result.boardState) {
      if (canSolveFrom(result.boardState)) {
        return {
          available: true,
          arrowId,
          message: `Try the ${boardState.arrows.find(a => a.definition.id === arrowId)!.definition.direction} arrow.`,
        };
      }
    }
  }

  // No move leads to a solution — suggest first available and inform player
  return {
    available: true,
    arrowId: movable[0],
    message: 'This puzzle may require undoing some moves. Try this arrow.',
  };
}

/**
 * Quick BFS check: can the board be solved from this state?
 */
function canSolveFrom(boardState: BoardState): boolean {
  if (isBoardComplete(boardState)) return true;

  interface SearchNode {
    board: BoardState;
  }

  const queue: SearchNode[] = [{ board: boardState }];
  const visited = new Set<string>();

  const stateKey = (board: BoardState): string =>
    board.arrows
      .filter(a => a.active)
      .map(a => a.definition.id)
      .sort()
      .join(',');

  visited.add(stateKey(boardState));

  while (queue.length > 0) {
    const current = queue.shift()!;

    const movable = getMovableArrows(current.board);

    for (const arrowId of movable) {
      const result = resolveMove(current.board, arrowId);
      if (result.valid && result.boardState) {
        if (isBoardComplete(result.boardState)) return true;

        const key = stateKey(result.boardState);
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ board: result.boardState });
        }
      }
    }
  }

  return false;
}
