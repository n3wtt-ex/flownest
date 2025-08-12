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

  // Yatay sıralama için agent sırası (soldan sağa)
  const agentOrder = ['leo', 'mike', 'sophie', 'ash', 'clara'];
  const orderedTools = agentOrder
    .map(agent => toolEntries.find(([key]) => key === agent))
    .filter(Boolean) as [string, SelectedTool][];

  const BOARD_WIDTH = 800;
  const BOARD_HEIGHT = 600;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      <svg 
        className="w-full h-full" 
        viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} 
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradient for connection lines */}
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
          </linearGradient>
          
          {/* Glow effect */}
          <filter id="connectionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Connection dots - made smaller to be less intrusive */}
          <marker 
            id="connectionDot" 
            markerWidth="6" 
            markerHeight="6" 
            refX="3" 
            refY="3"
            orient="auto"
          >
            <circle 
              cx="3" 
              cy="3" 
              r="1.5" 
              fill="#06b6d4" 
              opacity="0.7"
            />
          </marker>

          {/* Arrow marker for direction */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#8b5cf6"
              opacity="0.8"
            />
          </marker>
        </defs>

        {/* Draw connections between consecutive tools */}
        {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
          const [nextAgentKey, nextToolData] = orderedTools[index + 1];
          
          // İkon merkezleri - WorkspaceBoard'daki koordinatlarla tam uyumlu
          const startX = toolData.position.x;
          const startY = toolData.position.y;
          const endX = nextToolData.position.x;
          const endY = nextToolData.position.y;
          
          // Yatay düzen için smooth curve - daha az belirgin
          const midX = (startX + endX) / 2;
          const curveOffset = 15; // Yatay düzen için daha az curve
          
          // Quadratic Bezier curve for smooth connection
          const pathData = `M ${startX} ${startY} Q ${midX} ${startY - curveOffset} ${endX} ${endY}`;
          
          return (
            <motion.path
              key={`connection-${agentKey}-${nextAgentKey}`}
              d={pathData}
              stroke="url(#connectionGradient)"
              strokeWidth="2.5"
              fill="none"
              filter="url(#connectionGlow)"
              markerEnd="url(#arrowhead)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{ 
                duration: 1.5, 
                delay: index * 0.4, 
                ease: 'easeInOut' 
              }}
              // Animated dash pattern
              strokeDasharray="0"
              style={{
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
              }}
            />
          );
        })}

        {/* Optional: Add pulsing effect for active connections */}
        {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
          const [nextAgentKey, nextToolData] = orderedTools[index + 1];
          const startX = toolData.position.x;
          const startY = toolData.position.y;
          const endX = nextToolData.position.x;
          const endY = nextToolData.position.y;
          const midX = (startX + endX) / 2;
          const curveOffset = 15;
          const pathData = `M ${startX} ${startY} Q ${midX} ${startY - curveOffset} ${endX} ${endY}`;
          
          return (
            <motion.path
              key={`pulse-${agentKey}-${nextAgentKey}`}
              d={pathData}
              stroke="#06b6d4"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ 
                duration: 2, 
                delay: index * 0.4 + 1.5, 
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut' 
              }}
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Development mode: Show center points */}
        {process.env.NODE_ENV === 'development' && orderedTools.map(([agentKey, toolData]) => (
          <circle
            key={`debug-${agentKey}`}
            cx={toolData.position.x}
            cy={toolData.position.y}
            r="2"
            fill="red"
            opacity="0.7"
          />
        ))}
      </svg>
    </div>
  );
}