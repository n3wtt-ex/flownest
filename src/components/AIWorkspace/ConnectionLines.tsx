import React from 'react';
import { motion } from 'framer-motion';

interface Position {
  x: number;
  y: number;
}

interface ConnectionLinesProps {
  positions: { [key: string]: Position };
  sections: Array<{ id: string; name: string; icons: string[] }>;
  selections: { [key: string]: string };
}

export function ConnectionLines({ positions, sections, selections }: ConnectionLinesProps) {
  const getConnectedSections = () => {
    return sections.filter(section => selections[section.id] && positions[section.id]).sort((a, b) => {
      const posA = positions[a.id];
      const posB = positions[b.id];
      return posA.x - posB.x; // Sort by x position to ensure proper connection order
    });
  };

  const computeStraightPath = (x1: number, y1: number, x2: number, y2: number, centerX: number, centerY: number) => {
    // Adjust coordinates to board center
    const adjustedX1 = x1 + centerX;
    const adjustedY1 = y1 + centerY;
    const adjustedX2 = x2 + centerX;
    const adjustedY2 = y2 + centerY;
    
    // Always draw straight line between centers
    return `M ${adjustedX1} ${adjustedY1} L ${adjustedX2} ${adjustedY2}`;
  };

  const connectedSections = getConnectedSections();
  
  if (connectedSections.length < 2) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD44D" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FFD44D" />
        </linearGradient>
        <filter id="lineGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {connectedSections.slice(0, -1).map((section, index) => {
        const boardCenterX = 400; // Center of the working board
        const boardCenterY = 350; // Center of the working board
        
        const currentPos = positions[section.id];
        const nextSection = connectedSections[index + 1];
        const nextPos = positions[nextSection.id];
        
        if (!currentPos || !nextPos) return null;
        
        const pathData = computeStraightPath(
          currentPos.x, currentPos.y, nextPos.x, nextPos.y, boardCenterX, boardCenterY
        );
        
        return (
          <motion.path
            key={`${section.id}-${nextSection.id}`}
            d={pathData}
            stroke="url(#lineGradient)"
            strokeWidth="4"
            fill="none"
            filter="url(#lineGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: index * 0.2 }}
            className="drop-shadow-lg"
          />
        );
      })}
    </svg>
  );
}