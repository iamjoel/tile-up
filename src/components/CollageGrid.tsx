import React, { useState, useRef } from 'react';
import { Selection, ImageData, Cell } from '../types';
import { Upload } from 'lucide-react';

interface CollageGridProps {
  size: number;
  cellSize: number;
  selections: Selection[];
  images: ImageData[];
  onSelectionComplete: (selection: Selection) => void;
  onImageUpload: (selection: Selection, file: File) => void;
}

export function CollageGrid({
  size,
  cellSize,
  selections,
  images,
  onSelectionComplete,
  onImageUpload,
}: CollageGridProps) {
  const [startCell, setStartCell] = useState<Cell | null>(null);
  const [previewEndCell, setPreviewEndCell] = useState<Cell | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSelection, setActiveSelection] = useState<Selection | null>(null);

  const gap = 4;
  const containerSize = cellSize * size + gap * (size - 1);

  const handleCellClick = (row: number, col: number) => {
    // Check if the clicked cell is already part of a selection
    const isAlreadySelected = selections.some(selection =>
      selection.cells.some(cell => cell.row === row && cell.col === col)
    );

    if (isAlreadySelected) {
      return; // Ignore clicks on already selected cells
    }

    if (!startCell) {
      // First click - set start point
      setStartCell({ row, col });
      setPreviewEndCell({ row, col });
    } else {
      // Second click - complete selection
      const cells = getCellsInRange(startCell, { row, col });
      onSelectionComplete({ cells });
      setStartCell(null);
      setPreviewEndCell(null);
    }
  };

  const handleCellHover = (row: number, col: number) => {
    if (startCell) {
      setPreviewEndCell({ row, col });
    }
  };

  const getCellsInRange = (start: Cell, end: Cell): Cell[] => {
    const cells: Cell[] = [];
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        cells.push({ row, col });
      }
    }
    return cells;
  };

  const isSelected = (row: number, col: number) => {
    return selections.some(selection =>
      selection.cells.some(cell => cell.row === row && cell.col === cell)
    );
  };

  const isInPreview = (row: number, col: number) => {
    if (!startCell || !previewEndCell) return false;
    
    // Don't show preview if it would overlap with existing selections
    const previewCells = getCellsInRange(startCell, previewEndCell);
    const wouldOverlap = selections.some(selection =>
      selection.cells.some(existingCell =>
        previewCells.some(previewCell =>
          previewCell.row === existingCell.row && previewCell.col === existingCell.col
        )
      )
    );

    if (wouldOverlap) {
      return false;
    }

    return previewCells.some(cell => cell.row === row && cell.col === col);
  };

  const getSelectionForCell = (row: number, col: number) => {
    return selections.find(selection =>
      selection.cells.some(cell => cell.row === row && cell.col === cell)
    );
  };

  const getImageForSelection = (selection: Selection) => {
    return images.find(img => 
      img.selection.cells.some(cell =>
        selection.cells.some(selCell => 
          selCell.row === cell.row && selCell.col === cell.col
        )
      )
    );
  };

  const handleUploadClick = (selection: Selection) => {
    setActiveSelection(selection);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && activeSelection) {
      onImageUpload(activeSelection, file);
      setActiveSelection(null);
      event.target.value = '';
    }
  };

  const getSelectionStyle = (selection: Selection) => {
    const cells = selection.cells;
    const minRow = Math.min(...cells.map(c => c.row));
    const maxRow = Math.max(...cells.map(c => c.row));
    const minCol = Math.min(...cells.map(c => c.col));
    const maxCol = Math.max(...cells.map(c => c.col));
    
    const top = minRow * (cellSize + gap);
    const left = minCol * (cellSize + gap);
    const width = (maxCol - minCol + 1) * (cellSize + gap) - gap;
    const height = (maxRow - minRow + 1) * (cellSize + gap) - gap;
    
    return { top, left, width, height };
  };

  return (
    <div 
      className="relative select-none"
      style={{
        width: containerSize,
        height: containerSize,
      }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gap: `${gap}px`,
          width: '100%',
          height: '100%',
        }}
      >
        {Array.from({ length: size * size }).map((_, index) => {
          const row = Math.floor(index / size);
          const col = index % size;
          const selected = isSelected(row, col);
          const inPreview = isInPreview(row, col);
          const isStart = startCell?.row === row && startCell?.col === col;

          return (
            <div
              key={`${row}-${col}`}
              className={`
                relative rounded-lg transition-colors duration-200
                ${selected ? 'bg-blue-100' : 'bg-gray-100'}
                ${inPreview ? 'bg-blue-200' : ''}
                ${isStart ? 'ring-2 ring-blue-500' : ''}
                ${!selected && !inPreview ? 'hover:bg-gray-200' : ''}
                ${selected ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
              onClick={() => handleCellClick(row, col)}
              onMouseEnter={() => handleCellHover(row, col)}
            />
          );
        })}
      </div>

      {selections.map((selection, index) => {
        const image = getImageForSelection(selection);
        const style = getSelectionStyle(selection);

        return (
          <div
            key={index}
            className="absolute rounded-lg overflow-hidden"
            style={style}
          >
            {image ? (
              <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ) : (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-blue-50 transition-colors rounded-lg"
                onClick={() => handleUploadClick(selection)}
              >
                <div className="flex flex-col items-center text-blue-500">
                  <Upload size={24} />
                  <span className="text-sm mt-1">点击上传</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}