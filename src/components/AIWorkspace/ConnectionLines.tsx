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

  const agentOrder = ['leo', 'mike', 'sophie', 'ash', 'clara'];
  const orderedTools = agentOrder
    .map(agent => toolEntries.find(([key]) => key === agent))
    .filter(Boolean) as [string, SelectedTool][];

  const BOARD_WIDTH = 800;
  const BOARD_HEIGHT = 600;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <svg 
        className="w-full h-full" 
        viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} 
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
          </linearGradient>
          
          <filter id="connectionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Çizgi uçları için daire marker */}
          <marker 
            id="connectionDot" 
            markerWidth="8" 
            markerHeight="8" 
            refX="4" 
            refY="4"
          >
            <circle 
              cx="4" 
              cy="4" 
              r="2" 
              fill="#06b6d4" 
              opacity="0.6"
            />
          </marker>
        </defs>

        {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
          const [nextAgentKey, nextToolData] = orderedTools[index + 1];
          
          // İkon merkezlerini hesapla (25px offset WorkspaceBoard'dan geliyor)
          const startX = toolData.position.x;
          const startY = toolData.position.y;
          const endX = nextToolData.position.x;
          const endY = nextToolData.position.y;
          
          // Smooth curve için control points
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          const controlOffset = 30; // Curve için offset
          
          // Quadratic Bezier curve path
          const pathData = `M ${startX} ${startY} Q ${midX} ${midY - controlOffset} ${endX} ${endY}`;
          
          return (
            <motion.path
              key={`connection-${agentKey}-${nextAgentKey}`}
              d={pathData}
              stroke="url(#connectionGradient)"
              strokeWidth="3"
              fill="none"
              filter="url(#connectionGlow)"
              markerStart="url(#connectionDot)"
              markerEnd="url(#connectionDot)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ 
                duration: 1.2, 
                delay: index * 0.3, 
                ease: 'easeInOut' 
              }}
              // Çizgi animasyonu için stroke-dasharray
              style={{
                strokeDasharray: '5,5',
                strokeDashoffset: '0'
              }}
            />
          );
        })}
        
        {/* Debug için merkez noktaları (geliştirme sırasında aktif et) */}
        {process.env.NODE_ENV === 'development' && orderedTools.map(([agentKey, toolData]) => (
          <circle
            key={`debug-${agentKey}`}
            cx={toolData.position.x}
            cy={toolData.position.y}
            r="3"
            fill="red"
            opacity="0.5"
          />
        ))}
      </svg>
    </div>
  );
}