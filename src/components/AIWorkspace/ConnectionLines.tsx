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
  const viewBoxWidth = BOARD_WIDTH;
  const viewBoxHeight = BOARD_HEIGHT;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <svg className="w-full h-full" viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="xMidYMid meet">
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
        </defs>
        {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
          const [nextAgentKey, nextToolData] = orderedTools[index + 1];
          const pathData = `M ${toolData.position.x} ${toolData.position.y} L ${nextToolData.position.x} ${nextToolData.position.y}`;
          return (
            <motion.path
              key={`connection-${agentKey}-${nextAgentKey}`}
              d={pathData}
              stroke="url(#connectionGradient)"
              strokeWidth="3"
              fill="none"
              filter="url(#connectionGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: index * 0.3, ease: 'easeInOut' }}
            />
          );
        })}
      </svg>
    </div>
  );
}
