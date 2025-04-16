import React from 'react';

interface GridSelectorProps {
  value: number;
  onChange: (size: number) => void;
  cellSize: number;
  onCellSizeChange: (size: number) => void;
}

export function GridSelector({ value, onChange, cellSize, onCellSizeChange }: GridSelectorProps) {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">网格：</label>
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem'
          }}
        >
          <option value={2}>2 × 2</option>
          <option value={3}>3 × 3</option>
          <option value={4}>4 × 4</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">单元格：</label>
        <select
          value={cellSize}
          onChange={(e) => onCellSizeChange(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem'
          }}
        >
          <option value={50}>小 (50px)</option>
          <option value={100}>中 (100px)</option>
          <option value={150}>大 (150px)</option>
        </select>
      </div>
    </div>
  );
}