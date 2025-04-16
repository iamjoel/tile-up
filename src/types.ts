export interface Cell {
  row: number;
  col: number;
}

export interface Selection {
  cells: Cell[];
}

export interface ImageData {
  selection: Selection;
  url: string;
}