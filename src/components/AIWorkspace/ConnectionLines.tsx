import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SelectedTool {
  tool: string;
  position: { x: number; y: number };
}

interface ConnectionLinesProps {
  selectedTools: { [key: string]: SelectedTool };
  containerDimensions?: { width: number; height: number };
  isRightSidebarOpen?: boolean; // Sidebar durumunu prop olarak al
}

export function ConnectionLines({ 
  selectedTools, 
  containerDimensions = { width: 800, height: 480 },
  isRightSidebarOpen = false 
}: ConnectionLinesProps) {
  const toolEntries = Object.entries(selectedTools);
  if (toolEntries.length < 2) return null;

  // Sidebar genişliğini hesaplama - sadece açık olduğunda
  const [sidebarWidth, setSidebarWidth] = useState(0);

  // Sidebar durumu değiştiğinde genişliği hesapla
  useEffect(() => {
    if (isRightSidebarOpen) {
      // Sidebar açıkken genişliğini hesapla
      const updateSidebarWidth = () => {
        const rightSidebar = document.querySelector('.fixed.top-0.right-0');
        if (rightSidebar) {
          const rect = rightSidebar.getBoundingClientRect();
          const isVisible = rect.x < window.innerWidth && rect.width > 0;
          setSidebarWidth(isVisible ? rect.width : 0);
        }
      };

      // Küçük bir gecikme ile sidebar'ın render olmasını bekle
      const timer = setTimeout(updateSidebarWidth, 50);
      
      return () => clearTimeout(timer);
    } else {
      // Sidebar kapalıyken genişlik sıfır
      setSidebarWidth(0);
    }
  }, [isRightSidebarOpen]); // Sadece sidebar durumu değiştiğinde çalışır

  // Zigzag sıralama için agent sırası (soldan sağa)
  const agentOrder = ['leo', 'mike', 'sophie', 'ash', 'clara'];
  const orderedTools = agentOrder
    .map(agent => toolEntries.find(([key]) => key === agent))
    .filter(Boolean) as [string, SelectedTool][];

  const ICON_SIZE = 80; // HexIcon large size
  const ICON_CENTER_OFFSET = ICON_SIZE / 2; // İkonun merkez noktası için offset

  // Sidebar durumuna göre viewport genişliğini ayarla
  const adjustedViewportWidth = containerDimensions.width - sidebarWidth;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      <svg 
        className="w-full h-full" 
        viewBox={`0 0 ${containerDimensions.width} ${containerDimensions.height}`} 
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradient for connection lines */}
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
          </linearGradient>
          
          {/* Enhanced glow effect */}
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
        </defs>

        {/* Draw connections between consecutive tools with smooth curves */}
        {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
          const [nextAgentKey, nextToolData] = orderedTools[index + 1];
          
          // İkonların merkez noktalarını hesapla
          // Sidebar açıkken ikonlar da kaydırılmadığı için çizgileri de kaydırma
          const startX = toolData.position.x + ICON_CENTER_OFFSET;
          const startY = toolData.position.y + ICON_CENTER_OFFSET;
          const endX = nextToolData.position.x + ICON_CENTER_OFFSET;
          const endY = nextToolData.position.y + ICON_CENTER_OFFSET;
          
          const deltaX = endX - startX;
          const deltaY = endY - startY;
          
          // Curve control points
          const controlOffset = Math.abs(deltaY) * 0.6; 
          const control1X = startX + deltaX * 0.3;
          const control1Y = startY + (deltaY > 0 ? -controlOffset : controlOffset);
          const control2X = endX - deltaX * 0.3;
          const control2Y = endY + (deltaY > 0 ? controlOffset : -controlOffset);
          
          const pathData = `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
          
          return (
            <motion.path
              key={`connection-${agentKey}-${nextAgentKey}-${isRightSidebarOpen}`} // Key'e sidebar durumu ekle
              d={pathData}
              stroke="url(#connectionGradient)"
              strokeWidth="3"
              fill="none"
              filter="url(#connectionGlow)"
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

        {/* Pulsing effect */}
        {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
          const [nextAgentKey, nextToolData] = orderedTools[index + 1];
          
          // İkonların merkez noktalarını hesapla
          const startX = toolData.position.x + ICON_CENTER_OFFSET;
          const startY = toolData.position.y + ICON_CENTER_OFFSET;
          const endX = nextToolData.position.x + ICON_CENTER_OFFSET;
          const endY = nextToolData.position.y + ICON_CENTER_OFFSET;
          
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
              key={`pulse-${agentKey}-${nextAgentKey}-${isRightSidebarOpen}`}
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
          const startX = toolData.position.x + ICON_CENTER_OFFSET;
          const startY = toolData.position.y + ICON_CENTER_OFFSET;
          const endX = nextToolData.position.x + ICON_CENTER_OFFSET;
          const endY = nextToolData.position.y + ICON_CENTER_OFFSET;
          
          const deltaX = endX - startX;
          const deltaY = endY - startY;
          const controlOffset = Math.abs(deltaY) * 0.6;
          const control1X = startX + deltaX * 0.3;
          const control1Y = startY + (deltaY > 0 ? -controlOffset : controlOffset);
          const control2X = endX - deltaX * 0.3;
          const control2Y = endY + (deltaY > 0 ? controlOffset : -controlOffset);
          const pathData = `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;

          return (
            <motion.g key={`particle-group-${agentKey}-${nextAgentKey}-${isRightSidebarOpen}`}>
              <path id={`particle-path-${index}-${isRightSidebarOpen ? 'open' : 'closed'}`} d={pathData} fill="none" />
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
                  <mpath href={`#particle-path-${index}-${isRightSidebarOpen ? 'open' : 'closed'}`} />
                </animateMotion>
              </motion.circle>
            </motion.g>
          );
        })}

        {/* Development mode: Debug points - İkon merkezlerini göster */}
        {process.env.NODE_ENV === 'development' && orderedTools.map(([agentKey, toolData]) => {
          const centerX = toolData.position.x + ICON_CENTER_OFFSET;
          const centerY = toolData.position.y + ICON_CENTER_OFFSET;
          
          return (
            <g key={`debug-${agentKey}-${isRightSidebarOpen}`}>
              {/* İkon merkezi */}
              <circle
                cx={centerX} 
                cy={centerY}
                r="4"
                fill="red"
                opacity="0.8"
              />
              {/* İkon sınırları */}
              <rect
                x={toolData.position.x}
                y={toolData.position.y}
                width={ICON_SIZE}
                height={ICON_SIZE}
                fill="none"
                stroke="orange"
                strokeWidth="1"
                opacity="0.5"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}