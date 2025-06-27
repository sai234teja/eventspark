
import { useEffect, useRef } from 'react';

interface QRCodeComponentProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
}

const QRCodeComponent = ({ value, size = 128, level = 'M' }: QRCodeComponentProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Simple QR code generation using canvas
    // In a real app, you'd use a proper QR code library
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Create a simple pattern that looks like a QR code
    const gridSize = Math.floor(size / 25);
    const cellSize = size / 25;

    ctx.fillStyle = '#000000';

    // Generate a pseudo-random pattern based on the value
    const hash = value.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    // Draw finder patterns (corners)
    const drawFinderPattern = (x: number, y: number) => {
      // Outer square
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinderPattern(0, 0);
    drawFinderPattern(18, 0);
    drawFinderPattern(0, 18);

    // Draw data pattern
    for (let x = 0; x < 25; x++) {
      for (let y = 0; y < 25; y++) {
        // Skip finder patterns
        if ((x < 9 && y < 9) || (x > 15 && y < 9) || (x < 9 && y > 15)) continue;
        
        // Generate pseudo-random pattern
        const shouldFill = ((x * y + hash) % 3) === 0;
        if (shouldFill) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [value, size, level]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="border border-gray-300 rounded"
    />
  );
};

export default QRCodeComponent;
