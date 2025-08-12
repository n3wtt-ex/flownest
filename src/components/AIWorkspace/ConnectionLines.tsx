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

  // Zigzag sıralama için agent sırası (soldan sağa)
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
          
          {/* Enhanced glow effect for zigzag */}
          <filter id="connectionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Connection dots */}
          <marker 
            id="connectionDot" 
            markerWidth="8" 
            markerHeight="8" 
            refX="4" 
            refY="4"
            orient="auto"
          >
            <circle 
              cx="4" 
              cy="4" 
              r="2" 
              fill="#06b6d4" 
              opacity="0.8"
            />
          </marker>

          {/* Arrow marker for direction */}
          <marker
            id="arrowhead"
            markerWidth="12"
            markerHeight="8"
            refX="10"
            refY="4"
            orient="auto"
          >
            <polygon
              points="0 0, 12 4, 0 8"
              fill="#8b5cf6"
              opacity="0.9"
            />
          </marker>
        </defs>

        {/* Draw connections between consecutive tools with smooth curves */}
        {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
          const [nextAgentKey, nextToolData] = orderedTools[index + 1];
          
          // İkon merkezleri - TRANSFORM OFFSET'İ HESAPLANMİŞ MERKEZ NOKTALARI
          // WorkspaceBoard'da transform: translate(-40px, -40px) uygulanıyor
          // SVG koordinat sisteminde bu offset'i hesaba katmıyoruz çünkü 
          // SVG viewBox koordinatları pozisyon değerlerini direkt kullanır
          const startX = toolData.position.x;
          const startY = toolData.position.y;
          const endX = nextToolData.position.x;
          const endY = nextToolData.position.y;
          
          // Zigzag için smooth S-curve hesaplaması
          const deltaX = endX - startX;
          const deltaY = endY - startY;
          
          // Yumuşak S-curve için control points
          const controlOffset = Math.abs(deltaY) * 0.6; // Y farkına göre dinamik curve
          const control1X = startX + deltaX * 0.3;
          const control1Y = startY + (deltaY > 0 ? -controlOffset : controlOffset);
          const control2X = endX - deltaX * 0.3;
          const control2Y = endY + (deltaY > 0 ? controlOffset : -controlOffset);
          
          // Cubic Bezier curve for smooth zigzag connections
          const pathData = `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
          
          return (
            <motion.path
              key={`connection-${agentKey}-${nextAgentKey}`}
              d={pathData}
              stroke="url(#connectionGradient)"
              strokeWidth="3"
              fill="none"
              filter="url(#connectionGlow)"
              markerEnd="url(#arrowhead)"
              markerStart="url(#connectionDot)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{ 
                duration: 1.8, 
                delay: index * 0.4, 
                ease: 'easeInOut' 
              }}
              style={{
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
              }}
            />
          );
        })}

        {/* Pulsing effect for active connections - zigzag optimized */}
        {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
          const [nextAgentKey, nextToolData] = orderedTools[index + 1];
          
          const startX = toolData.position.x;
          const startY = toolData.position.y;
          const endX = nextToolData.position.x;
          const endY = nextToolData.position.y;
          
          const deltaX = endX - startX;
          const deltaY = endY - startY;
          const controlOffset = Math.abs(deltaY) * 0.6;
          const control1X = startX + deltaX * 0.3;
          const control1Y = startY + (deltaY > 0 ? -controlOffset : controlOffset);
          const control2X = endX - deltaX * 0.3;
          const control2Y = endY + (deltaY > 0 ? controlOffset : -controlOffset);
          
          const pathData = `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
          
          return (
            <motion.path
              key={`pulse-${agentKey}-${nextAgentKey}`}
              d={pathData}
              stroke="#06b6d4"
              strokeWidth="1.5"
              fill="none"
              opacity="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ 
                duration: 2.5, 
                delay: index * 0.4 + 2, 
                repeat: Infinity,
                repeatDelay: 4,
                ease: 'easeInOut' 
              }}
              strokeDasharray="6 6"
            />
          );
        })}

        {/* Flow particles for enhanced visual effect */}
        {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
          const [nextAgentKey, nextToolData] = orderedTools[index + 1];
          
          const startX = toolData.position.x;
          const startY = toolData.position.y;
          const endX = nextToolData.position.x;
          const endY = nextToolData.position.y;
          
          return (
            <motion.circle
              key={`particle-${agentKey}-${nextAgentKey}`}
              r="3"
              fill="#06b6d4"
              opacity="0.8"
              initial={{ 
                offsetDistance: "0%",
                cx: startX,
                cy: startY
              }}
              animate={{ 
                offsetDistance: "100%",
                cx: endX,
                cy: endY
              }}
              transition={{
                duration: 3,
                delay: index * 0.6 + 3,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut"
              }}
            />
          );
        })}

        {/* Development mode: Show center points for debugging */}
        {process.env.NODE_ENV === 'development' && orderedTools.map(([agentKey, toolData]) => (
          <circle
            key={`debug-${agentKey}`}
            cx={toolData.position.x}
            cy={toolData.position.y}
            r="3"
            fill="red"
            opacity="0.8"
          />
        ))}
      </svg>
    </div>
  );
}