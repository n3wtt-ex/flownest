// WorkspaceBoard.tsx - Yeni koordinat sistemi (90 derece döndürülmüş, ortada)

const BOARD_WIDTH = 800; // Board genişliği
const BOARD_HEIGHT = 600; // Board yüksekliği
const CENTER_X = BOARD_WIDTH / 2; // 400px
const CENTER_Y = BOARD_HEIGHT / 2; // 300px

// 90 derece sağa döndürülmüş ve ortada gruplanmış pozisyonlar
const toolPositions = {
  leo: { 
    x: CENTER_X - 50,  // Merkez sol
    y: CENTER_Y - 120, // Üst
    tools: ['Apollo', 'GoogleMaps', 'Apify'] 
  },
  mike: { 
    x: CENTER_X + 80,  // Sağ
    y: CENTER_Y - 60,  // Üst sağ
    tools: ['Instantly', 'Lemlist'] 
  },
  sophie: { 
    x: CENTER_X,       // Tam merkez
    y: CENTER_Y,       // Tam merkez
    tools: ['LinkedIn', 'PerplexityAI', 'BrightData'] 
  },
  ash: { 
    x: CENTER_X + 80,  // Sağ
    y: CENTER_Y + 60,  // Alt sağ
    tools: ['CalCom', 'CRM', 'Instagram'] 
  },
  clara: { 
    x: CENTER_X - 50,  // Merkez sol
    y: CENTER_Y + 120, // Alt
    tools: ['Gmail', 'BrightData'] 
  }
};

// Bağlantı çizgileri için düzeltilmiş SVG viewBox
// ConnectionLines.tsx güncellemesi:
const viewBoxWidth = BOARD_WIDTH;
const viewBoxHeight = BOARD_HEIGHT;

return (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
    <svg 
      className="w-full h-full" 
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Defs aynı kalacak */}
      
      {/* Düzeltilmiş path hesaplama */}
      {orderedTools.slice(0, -1).map(([agentKey, toolData], index) => {
        const nextEntry = orderedTools[index + 1];
        const [nextAgentKey, nextToolData] = nextEntry;
        
        // Artık koordinatlar doğrudan kullanılabilir
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
            transition={{ 
              duration: 1.2, 
              delay: index * 0.3,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </svg>
  </div>
);

// Board sınırları için container'a overflow:hidden ekle
// Right Working Area güncellemesi:
<div className="w-4/5 relative overflow-hidden"> {/* overflow-hidden eklendi */}
  {/* Background Pattern */}
  
  {/* Working Board Content */}
  <div className="relative h-full flex items-center justify-center">
    {/* Selected Tools - position artık sınırlarda */}
    <AnimatePresence>
      {Object.entries(selectedTools).map(([agent, data]) => (
        <motion.div
          key={`${agent}-${data.tool}`}
          initial={{ scale: 0, opacity: 0, x: CENTER_X, y: CENTER_Y }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            x: data.position.x,
            y: data.position.y
          }}
          exit={{ scale: 0, opacity: 0, x: CENTER_X, y: CENTER_Y }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            delay: Object.keys(selectedTools).indexOf(agent) * 0.2 // Sıralı animasyon
          }}
          className="absolute"
          style={{ 
            left: 0,
            top: 0,
            transform: `translate(${data.position.x - 25}px, ${data.position.y - 25}px)`, // Icon merkezleme
            zIndex: 15
          }}
        >
          <HexIcon 
            name={data.tool} 
            isSelected={true}
            size="large"
          />
        </motion.div>
      ))}
    </AnimatePresence>
    
    {/* Connection Lines - koordinat sistemi artık uyumlu */}
    <ConnectionLines selectedTools={selectedTools} />
  </div>
</div>