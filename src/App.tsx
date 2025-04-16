import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Download, RefreshCcw, Undo, ChevronDown, ChevronUp } from 'lucide-react';
import { GridSelector } from './components/GridSelector';
import { CollageGrid } from './components/CollageGrid';
import { Selection, ImageData } from './types';
import { createImage } from './utils/canvas';

function App() {
  const [gridSize, setGridSize] = useState(3);
  const [cellSize, setCellSize] = useState(100);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firstVisitKey = 'collage-first-visit';
  const guideStateKey = 'collage-guide-state';

  useEffect(() => {
    const isFirstVisit = localStorage.getItem(firstVisitKey) === null;
    const savedGuideState = localStorage.getItem(guideStateKey);

    if (isFirstVisit) {
      localStorage.setItem(firstVisitKey, 'false');
      setIsGuideOpen(true);
    } else {
      setIsGuideOpen(savedGuideState === 'true');
    }
  }, []);

  const toggleGuide = () => {
    const newState = !isGuideOpen;
    setIsGuideOpen(newState);
    localStorage.setItem(guideStateKey, String(newState));
  };

  const handleGridChange = (size: number) => {
    setGridSize(size);
    setSelections([]);
    setImages([]);
  };

  const handleCellSizeChange = (size: number) => {
    setCellSize(size);
  };

  const handleSelectionComplete = (newSelection: Selection) => {
    const hasOverlap = selections.some(existing =>
      existing.cells.some(existingCell =>
        newSelection.cells.some(newCell =>
          newCell.row === existingCell.row && newCell.col === existingCell.col
        )
      )
    );

    if (!hasOverlap) {
      setSelections(prev => [...prev, newSelection]);
    }
  };

  const handleImageUpload = async (selection: Selection, file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setImages([...images, { selection, url: imageUrl }]);
  };

  const handleUndo = () => {
    setSelections(prev => prev.slice(0, -1));
    setImages(prev => prev.slice(0, -1));
  };

  const handleReset = () => {
    setSelections([]);
    setImages([]);
  };

  const handleExport = useCallback(async () => {
    if (!canvasRef.current || images.length === 0) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const gap = 4;
      const totalSize = cellSize * gridSize + gap * (gridSize - 1);
      
      canvas.width = totalSize;
      canvas.height = totalSize;

      // Fill background
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw each selection with rounded corners and proper spacing
      for (const { selection, url } of images) {
        const img = await createImage(url);
        const cells = selection.cells;
        const minRow = Math.min(...cells.map(c => c.row));
        const maxRow = Math.max(...cells.map(c => c.row));
        const minCol = Math.min(...cells.map(c => c.col));
        const maxCol = Math.max(...cells.map(c => c.col));

        const x = minCol * (cellSize + gap);
        const y = minRow * (cellSize + gap);
        const width = (maxCol - minCol + 1) * (cellSize + gap) - gap;
        const height = (maxRow - minRow + 1) * (cellSize + gap) - gap;
        const radius = 8;

        // Draw rounded rectangle background
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        // Create clipping path for rounded corners
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.clip();

        // Calculate scaling and positioning for object-fit: cover behavior
        const imageAspectRatio = img.width / img.height;
        const targetAspectRatio = width / height;
        
        let drawWidth = width;
        let drawHeight = height;
        let drawX = x;
        let drawY = y;

        if (imageAspectRatio > targetAspectRatio) {
          // Image is wider than target area
          drawWidth = height * imageAspectRatio;
          drawX = x - (drawWidth - width) / 2;
        } else {
          // Image is taller than target area
          drawHeight = width / imageAspectRatio;
          drawY = y - (drawHeight - height) / 2;
        }

        // Draw the image with cover behavior
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
      }

      const blob = await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob!)));
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'collage.png';
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [cellSize, gridSize, images]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            拼图秀
          </h1>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <GridSelector
                value={gridSize}
                onChange={handleGridChange}
                cellSize={cellSize}
                onCellSizeChange={handleCellSizeChange}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={handleUndo}
                  disabled={selections.length === 0}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="撤销上一步"
                >
                  <Undo size={20} />
                </button>
                
                <button
                  onClick={handleReset}
                  disabled={selections.length === 0}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="重置"
                >
                  <RefreshCcw size={20} />
                </button>

                <button
                  onClick={handleExport}
                  disabled={images.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download size={20} />
                  导出
                </button>
              </div>
            </div>

            <CollageGrid
              size={gridSize}
              cellSize={cellSize}
              selections={selections}
              images={images}
              onSelectionComplete={handleSelectionComplete}
              onImageUpload={handleImageUpload}
            />

            {/* User Guide */}
            <div className="mt-8 border-t pt-6">
              <button
                onClick={toggleGuide}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                {isGuideOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span>使用说明</span>
              </button>
              
              <div
                className={`mt-2 transition-all duration-300 ease-in-out ${
                  isGuideOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
              >
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>选择网格大小和单元格尺寸</li>
                  <li>在网格上点击选择起点，再次点击选择终点</li>
                  <li>点击"点击上传"来添加图片</li>
                  <li>重复以上步骤添加更多图片</li>
                  <li>完成后点击"导出"下载拼贴图</li>
                </ol>
                <p className="mt-2 text-xs text-gray-500">
                  提示：可以使用"撤销"和"重置"按钮来修改布局
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default App;