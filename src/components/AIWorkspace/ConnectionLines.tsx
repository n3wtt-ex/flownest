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
  // HexIcon large size için gerçek merkez offset'leri (SVG viewBox'e göre)
  const ICON_X_OFFSET = 50; // SVG viewBox (0 0 100 100) merkezi
  const ICON_Y_OFFSET = 50; // SVG viewBox (0 0 100 100) merkezi
  
  // Sidebar genişliğini dinamik olarak hesaplamak için state
  const [sidebarWidth, setSidebarWidth] = useState(0);

  // Sidebar genişliğini izlemek için effect
  useEffect(() => {
    const updateSidebarWidth = () => {
      const rightSidebar = document.querySelector('.fixed.top-0.right-0');
      if (rightSidebar) {
        // Sidebar'ın gerçek genişliğini ölç
        const rect = rightSidebar.getBoundingClientRect();
        // Eğer sidebar viewport içindeyse genişliğini al, değilse 0
        const isVisible = rect.x < window.innerWidth && rect.width > 0;
        setSidebarWidth(isVisible ? rect.width : 0);
      } else {
        setSidebarWidth(0);
      }
    };

    // İlk yükleme ve resize durumlarında güncelle
    updateSidebarWidth();
    window.addEventListener('resize', updateSidebarWidth);
    
    // MutationObserver ile DOM değişikliklerini izle
    const observer = new MutationObserver(updateSidebarWidth);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      window.removeEventListener('resize', updateSidebarWidth);
      observer.disconnect();
    };
  }, []);

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
          const startX = toolData.position.x + ICON_X_OFFSET;
          const startY = toolData.position.y + ICON_Y_OFFSET;
          const endX = nextToolData.position.x + ICON_X_OFFSET;
          const endY = nextToolData.position.y + ICON_Y_OFFSET;
          
          // Sidebar genişliğine göre X koordinatlarını ayarla
          const adjustedStartX = startX + sidebarWidth;
          const adjustedEndX = endX + sidebarWidth;
          
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
          
          // Sidebar genişliğine göre X koordinatlarını ayarla
          const adjustedStartX = toolData.position.x + (sidebarWidth / 2);
          const adjustedEndX = nextToolData.position.x + (sidebarWidth / 2);
          
          const startX = adjustedStartX;
          const startY = toolData.position.y;
          const endX = adjustedEndX;
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

        {/* Flow particles */}
        {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
          const [nextAgentKey, nextToolData] = orderedTools[index + 1];
          
          // Sidebar genişliğine göre X koordinatlarını ayarla
          const adjustedStartX = toolData.position.x + (sidebarWidth / 2);
          const adjustedEndX = nextToolData.position.x + (sidebarWidth / 2);
          
          const startX = adjustedStartX;
          const startY = toolData.position.y;
          
          const endX = adjustedEndX;
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
          // Sidebar genişliğine göre X koordinatlarını ayarla
          const adjustedX = toolData.position.x + (sidebarWidth / 2);
          
          return (
            <circle
              key={`debug-${agentKey}`}
              cx={adjustedX} 
              cy={toolData.position.y}
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