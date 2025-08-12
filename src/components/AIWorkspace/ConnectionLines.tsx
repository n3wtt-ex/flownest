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

  // Çizgilerin sıralı bağlantısı için agent'ları belli bir sırada düzenle
  const agentOrder = ['leo', 'mike', 'sophie', 'ash', 'clara'];
  const orderedTools = agentOrder
    .filter(agent => toolEntries.find(([key]) => key === agent))
    .map(agent => toolEntries.find(([key]) => key === agent)!)
    .filter(Boolean);

  if (orderedTools.length < 2) return null;

  // Zigzag çizgi oluşturma fonksiyonu
  const generateZigzagPath = (
    x1: number, 
    y1: number, 
    x2: number, 
    y2: number
  ): string => {
    const startX = x1;
    const startY = y1;
    const endX = x2;
    const endY = y2;
    
    // Orta noktayı hesapla
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // Zigzag için offset değeri
    const zigzagOffset = 30;
    
    // Y ekseni farkına göre zigzag yönünü belirle
    const offsetY = startY < endY ? -zigzagOffset : zigzagOffset;
    
    // Zigzag path oluştur
    return `M ${startX} ${startY} L ${midX} ${midY + offsetY} L ${endX} ${endY}`;
  };

  // SVG viewBox boyutlarını hesapla
  const allPositions = orderedTools.map(([, tool]) => tool.position);
  const minX = Math.min(...allPositions.map(p => p.x)) - 100;
  const maxX = Math.max(...allPositions.map(p => p.x)) + 100;
  const minY = Math.min(...allPositions.map(p => p.y)) - 100;
  const maxY = Math.max(...allPositions.map(p => p.y)) + 100;
  const width = maxX - minX;
  const height = maxY - minY;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <svg 
        className="w-full h-full" 
        viewBox={`${minX} ${minY} ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
          </linearGradient>
          <filter id="connectionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Ana bağlantı çizgileri - sıralı agent'lar arasında */}
        {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
          const nextEntry = orderedTools[index + 1];
          const [nextAgentKey, nextToolData] = nextEntry;
          
          const pathData = generateZigzagPath(
            toolData.position.x,
            toolData.position.y,
            nextToolData.position.x,
            nextToolData.position.y
          );
          
          return (
            <g key={`connection-${agentKey}-${nextAgentKey}`}>
              {/* Ana çizgi */}
              <motion.path
                d={pathData}
                stroke="url(#connectionGradient)"
                strokeWidth="3"
                fill="none"
                filter="url(#connectionGlow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ 
                  duration: 1.2, 
                  delay: index * 0.3,
                  ease: "easeInOut"
                }}
                className="drop-shadow-lg"
              />
              
              {/* Akış efekti */}
              <motion.path
                d={pathData}
                stroke="url(#flowGradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="10,5"
                initial={{ 
                  pathLength: 0, 
                  opacity: 0,
                  strokeDashoffset: 15 
                }}
                animate={{ 
                  pathLength: 1, 
                  opacity: 0.6,
                  strokeDashoffset: [15, 0, -15]
                }}
                transition={{ 
                  duration: 1.2, 
                  delay: index * 0.3 + 0.5,
                  ease: "easeInOut",
                  strokeDashoffset: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              />
            </g>
          );
        })}
        
        {/* Son agent'tan ilk agent'a döngü bağlantısı (isteğe bağlı) */}
        {orderedTools.length >= 3 && (
          <motion.path
            d={generateZigzagPath(
              orderedTools[orderedTools.length - 1][1].position.x,
              orderedTools[orderedTools.length - 1][1].position.y,
              orderedTools[0][1].position.x,
              orderedTools[0][1].position.y
            )}
            stroke="url(#connectionGradient)"
            strokeWidth="2"
            strokeDasharray="8,4"
            fill="none"
            filter="url(#connectionGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ 
              duration: 1.5, 
              delay: (orderedTools.length - 1) * 0.3 + 1,
              ease: "easeInOut"
            }}
            className="drop-shadow-lg"
          />
        )}
        
        {/* Merkezi akış çizgisi - tüm noktaların ortasından geçen */}
        {orderedTools.length >= 3 && (
          <motion.path
            d={`M ${orderedTools.map(([, tool]) => `${tool.position.x} ${tool.position.y}`).join(' L ')}`}
            stroke="url(#flowGradient)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="5,3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 0.3,
              strokeDashoffset: [0, -8]
            }}
            transition={{ 
              duration: 2, 
              delay: orderedTools.length * 0.3 + 0.5,
              ease: "easeInOut",
              strokeDashoffset: {
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }
            }}
          />
        )}
      </svg>
    </div>
  );
}