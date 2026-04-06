export const SPEEDS = { Slow: 600, Medium: 200, Fast: 40, Instant: 0 };

export const TOTAL_SOLUTIONS = {
  1: 1, 2: 0, 3: 0, 4: 2, 5: 10, 6: 4,
  7: 40, 8: 92, 9: 352, 10: 724, 11: 2680, 12: 14200,
};

export function solveNQueens(n) {
  const solutions = [];
  const board = Array(n).fill(-1);

  function isSafe(row, col) {
    for (let r = 0; r < row; r++)
      if (board[r] === col || Math.abs(board[r] - col) === Math.abs(r - row)) return false;
    return true;
  }

  function solve(row) {
    if (row === n) { solutions.push([...board]); return; }
    for (let col = 0; col < n; col++)
      if (isSafe(row, col)) { board[row] = col; solve(row + 1); board[row] = -1; }
  }

  solve(0);
  return solutions;
}

export function getAttackedCells(currentBoard, size) {
  const attacked = new Set();
  for (let r = 0; r < size; r++) {
    const col = currentBoard[r];
    if (col === -1) continue;
    for (let c = 0; c < size; c++) if (c !== col) attacked.add(`${r},${c}`);
    for (let dr = -size; dr <= size; dr++) {
      if (dr === 0) continue;
      const nr = r + dr, nc = col + dr, nc2 = col - dr;
      if (nr >= 0 && nr < size) {
        if (nc >= 0 && nc < size) attacked.add(`${nr},${nc}`);
        if (nc2 >= 0 && nc2 < size) attacked.add(`${nr},${nc2}`);
      }
    }
    for (let rr = 0; rr < size; rr++) if (rr !== r) attacked.add(`${rr},${col}`);
  }
  return attacked;
}

export function buildAnimationSteps(n) {
  const b = Array(n).fill(-1);
  const steps = [];

  function isSafe(row, col) {
    for (let r = 0; r < row; r++)
      if (b[r] === col || Math.abs(b[r] - col) === Math.abs(r - row)) return false;
    return true;
  }

  function build(row) {
    if (row === n) { steps.push({ type: "solution", board: [...b] }); return; }
    for (let col = 0; col < n; col++) {
      steps.push({ type: "place", row, col });
      b[row] = col;
      if (isSafe(row, col)) build(row + 1);
      steps.push({ type: "remove", row, col });
      b[row] = -1;
    }
  }

  build(0);
  return steps;
}