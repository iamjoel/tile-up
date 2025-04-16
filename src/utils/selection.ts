import { Selection, Cell } from '../types';

export function areSelectionsAdjacent(a: Selection, b: Selection): boolean {
  for (const cellA of a.cells) {
    for (const cellB of b.cells) {
      // Check if cells are adjacent horizontally, vertically, or diagonal
      const isAdjacent = (
        // Horizontally or vertically adjacent
        (Math.abs(cellA.col - cellB.col) <= 1 && cellA.row === cellB.row) ||
        (Math.abs(cellA.row - cellB.row) <= 1 && cellA.col === cellB.col) ||
        // Diagonally adjacent
        (Math.abs(cellA.row - cellB.row) === 1 && Math.abs(cellA.col - cellB.col) === 1)
      );
      
      if (isAdjacent) {
        return true;
      }
    }
  }
  return false;
}

export function mergeSelections(selections: Selection[]): Selection {
  if (selections.length === 0) {
    return { cells: [] };
  }

  // Find the boundaries of all selections
  let minRow = Infinity;
  let maxRow = -Infinity;
  let minCol = Infinity;
  let maxCol = -Infinity;

  // Create a set to track all selected cells
  const selectedCells = new Set<string>();

  // Get the boundaries and track selected cells
  selections.forEach(selection => {
    selection.cells.forEach(cell => {
      minRow = Math.min(minRow, cell.row);
      maxRow = Math.max(maxRow, cell.row);
      minCol = Math.min(minCol, cell.col);
      maxCol = Math.max(maxCol, cell.col);
      selectedCells.add(`${cell.row},${cell.col}`);
    });
  });

  // Create a new selection that includes all cells within the boundaries
  const mergedCells: Cell[] = [];
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      if (selectedCells.has(`${row},${col}`)) {
        mergedCells.push({ row, col });
      }
    }
  }

  return { cells: mergedCells };
}