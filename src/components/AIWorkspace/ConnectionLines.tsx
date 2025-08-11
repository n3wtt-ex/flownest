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
  boardCenter: { x: number; y: number };
}

export function ConnectionLines({ positions, sections, selections, boardCenter }: ConnectionLinesProps) {
  const getConnectedSections = () => {
    return sections.filter(section => selections[section.id] && positions[section.id]);
  };

  const connectedSections = getConnectedSections();
  if (connectedSections.length < 2) return null;

  const hexSize = 80;
  const hexRadius = (hexSize * Math.sqrt(3)) / 4;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD44D" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FFD44D" />
        </linearGradient>
        <filter id="lineGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {connectedSections.slice(0, -1).map((section, index) => {
        const currentPos = positions[section.id];
        const nextSection = connectedSections[index + 1];
        const nextPos = positions[nextSection.id];
        
        if (!currentPos || !nextPos) return null;
        
        // 📌 Relative → Absolute dönüşümü
        const centerX1 = boardCenter.x + currentPos.x;
        const centerY1 = boardCenter.y + currentPos.y;
        const centerX2 = boardCenter.x + nextPos.x;
        const centerY2 = boardCenter.y + nextPos.y;

        const dx = centerX2 - centerX1;
        const dy = centerY2 - centerY1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < hexRadius * 2.5) return null;
        
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        const startX = centerX1 + dirX * hexRadius;
        const startY = centerY1 + dirY * hexRadius;
        const endX = centerX2 - dirX * hexRadius;
        const endY = centerY2 - dirY * hexRadius;
        
        const pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
        
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
          />
        );
      })}
    </svg>
  );
}
