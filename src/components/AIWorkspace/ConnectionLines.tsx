import React from 'react';
import { motion } from 'framer-motion';

interface SelectedTool {
  tool: string;
  position: { x: number; y: number };
}

interface ConnectionLinesProps {
  selectedTools: { [key: string]: SelectedTool };
}

export function ConnectionLines({ selectedTools }: ConnectionLinesProps) {
  const toolEntries = Object.entries(selectedTools);

  if (toolEntries.length < 2) return null;

  // Sıralı noktaları al
  const points = toolEntries.map(([_, toolData]) => ({
    x: toolData.position.x,
    y: toolData.position.y
  }));

  // Zigzag için ara noktalar: her segment iki nokta arasında kırılır
  const zigzagPath = () => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      // Zigzag oluşturmak için orta noktaya dik ofset ekle
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const offset = 20; // kırılım yüksekliği
      const perpX = (-dy / len) * offset;
      const perpY = (dx / len) * offset;
      const zigX = midX + perpX;
      const zigY = midY + perpY;

      // İki düz çizgi ile kırılım yap
      path += ` L ${zigX} ${zigY} L ${end.x} ${end.y}`;
    }
    return path;
  };

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <svg
        className="w-full h-full"
        viewBox="-400 -300 800 600"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
          </linearGradient>
          <filter id="connectionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          d={zigzagPath()}
          stroke="url(#connectionGradient)"
          strokeWidth="3"
          fill="none"
          filter="url(#connectionGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 1.5,
            ease: 'easeInOut'
          }}
          className="drop-shadow-lg"
        />
      </svg>
    </div>
  );
}
