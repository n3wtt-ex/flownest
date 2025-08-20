import React, { useState, useEffect } from 'react';
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
  const BOARD_HEIGHT = 480; // %20 küçültüldü
  // DÜZELTME: İkon merkezi offset değerlerini 16 olarak ayarla (32x32px ikonlar için)
  const ICON_X_OFFSET = 40; // İkonun yatay merkezi (32px genişliğinde)
  const ICON_Y_OFFSET = 16; // İkonun dikey merkezi (32px yüksekliğinde)
  
  // DÜZELTME: Sidebar genişliği ayarını kaldır - ikon koordinatları zaten viewport'a göre tanımlı

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

          {/* DÜZELTME: Ok başı tanımı kaldırıldı */}
        </defs>

        {/* Draw connections between consecutive tools with smooth curves */}
        {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
          const [nextAgentKey, nextToolData] = orderedTools[index + 1];
          
          // İkonların merkez noktalarını hesapla
          // DÜZELTME: Sidebar genişliği ayarı kaldırıldı
          const startX = toolData.position.x + ICON_X_OFFSET;
          const startY = toolData.position.y + ICON_Y_OFFSET;
          const endX = nextToolData.position.x + ICON_X_OFFSET;
          const endY = nextToolData.position.y + ICON_Y_OFFSET;
          
          const deltaX = endX - startX;
          const deltaY = endY - startY;
          
          const controlOffset = Math.abs(deltaY) * 0.6; 
          // DÜZELTME: Sidebar genişliği ayarı kaldırıldı
          const control1X = startX + deltaX * 0.3;
          const control1Y = startY + (deltaY > 0 ? -controlOffset : controlOffset);
          const control2X = endX - deltaX * 0.3;
          const control2Y = endY + (deltaY > 0 ? controlOffset : -controlOffset);
          
          // DÜZELTME: Sidebar genişliği ayarı kaldırıldı
          const pathData = `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
          
          return (
            <motion.path
              key={`connection-${agentKey}-${nextAgentKey}`}
              d={pathData}
              stroke="url(#connectionGradient)"
              strokeWidth="3"
              fill="none"
              filter="url(#connectionGlow)"
              markerStart="url(#connectionDot)" // DÜZELTME: markerEnd kaldırıldı
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

        {/* Pulsing effect */}
        {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
          const [nextAgentKey, nextToolData] = orderedTools[index + 1];
          
          // İkonların merkez noktalarını hesapla
          // DÜZELTME: Sidebar genişliği ayarı kaldırıldı
          const startX = toolData.position.x + ICON_X_OFFSET;
          const startY = toolData.position.y + ICON_Y_OFFSET;
          const endX = nextToolData.position.x + ICON_X_OFFSET;
          const endY = nextToolData.position.y + ICON_Y_OFFSET;
          
          const deltaX = endX - startX;
          const deltaY = endY - startY;
          const controlOffset = Math.abs(deltaY) * 0.6;
          // DÜZELTME: Sidebar genişliği ayarı kaldırıldı
          const control1X = startX + deltaX * 0.3;
          const control1Y = startY + (deltaY > 0 ? -controlOffset : controlOffset);
          const control2X = endX - deltaX * 0.3;
          const control2Y = endY + (deltaY > 0 ? controlOffset : -controlOffset);
          
          // DÜZELTME: Sidebar genişliği ayarı kaldırıldı
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

        {/* Flow particles */}
        {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
          const [nextAgentKey, nextToolData] = orderedTools[index + 1];
          
          // İkonların merkez noktalarını hesapla
          // DÜZELTME: Sidebar genişliği ayarı kaldırıldı
          const startX = toolData.position.x + ICON_X_OFFSET;
          const startY = toolData.position.y + ICON_Y_OFFSET;
          
          const endX = nextToolData.position.x + ICON_X_OFFSET;
          const endY = nextToolData.position.y + ICON_Y_OFFSET;
          
          const deltaX = endX - startX;
          const deltaY = endY - startY;
          const controlOffset = Math.abs(deltaY) * 0.6;
          // DÜZELTME: Sidebar genişliği ayarı kaldırıldı
          const control1X = startX + deltaX * 0.3;
          const control1Y = startY + (deltaY > 0 ? -controlOffset : controlOffset);
          const control2X = endX - deltaX * 0.3;
          const control2Y = endY + (deltaY > 0 ? controlOffset : -controlOffset);
          // DÜZELTME: Sidebar genişliği ayarı kaldırıldı
          const pathData = `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;

          return (
            <motion.g key={`particle-group-${agentKey}-${nextAgentKey}`}>
              <path id={`particle-path-${index}`} d={pathData} fill="none" />
              <motion.circle
                r="3"
                fill="#06b6d4"
                opacity="0.8"
                >
                <animateMotion
                  dur="3s"
                  begin={`${index * 0.6 + 3}s`}
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="spline"
                  keySplines="0.42 0 0.58 1"
                  >
                  <mpath href={`#particle-path-${index}`} />
                </animateMotion>
              </motion.circle>
            </motion.g>
          );
        })}

        {/* Development mode: Debug points */}
        {process.env.NODE_ENV === 'development' && orderedTools.map(([agentKey, toolData]) => {
          // İkonların merkez noktalarını hesapla
          // DÜZELTME: Sidebar genişliği ayarı kaldırıldı
          const adjustedX = toolData.position.x + ICON_X_OFFSET;
          const adjustedY = toolData.position.y + ICON_Y_OFFSET;
          
          return (
            <circle
              key={`debug-${agentKey}`}
              cx={adjustedX} 
              cy={adjustedY}
              r="3"
              fill="red"
              opacity="0.8"
            />
          );
        })}
      </svg>
    </div>
  );
}