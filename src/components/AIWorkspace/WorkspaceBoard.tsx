import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexIcon } from './HexIcon';
import { ConnectionLines } from './ConnectionLines';
import { ChatBox } from './ChatBox';
import { AgentHeader } from './AgentHeader';
import { RightSidebar } from './RightSidebar';
import { SelectionRow } from './SelectionRow';
import { Play } from 'lucide-react';

interface WorkspaceSelection {
  [key: string]: string;
}

interface WorkspaceData {
  id: string;
  name: string;
  selections: WorkspaceSelection;
  messages: any[];
  createdAt: string;
}

interface WorkspaceBoardProps {
  workspace: WorkspaceData;
  onUpdateWorkspace: (workspace: WorkspaceData) => void;
}

const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 480; // %20 küçültüldü (600 * 0.8 = 480)
const CENTER_X = BOARD_WIDTH / 2;
const CENTER_Y = BOARD_HEIGHT / 2;

// ZIGZAG Y SIRALAMA - 5 ikon (+y, -y, +y, -y, +y)
const HORIZONTAL_SPACING = 120; // İkonlar arası X mesafesi
const VERTICAL_OFFSET = 64; // %20 küçültüldü (80 * 0.8 = 64)
const START_X = CENTER_X - (4 * HORIZONTAL_SPACING) / 2; // 5 ikon için başlangıç X noktası

const toolPositions = {
  leo: { 
    x: START_X, 
    y: CENTER_Y + VERTICAL_OFFSET, // +y (aşağı)
    tools: ['Apollo', 'GoogleMaps', 'Apify'] 
  },
  mike: { 
    x: START_X + HORIZONTAL_SPACING, 
    y: CENTER_Y - VERTICAL_OFFSET, // -y (yukarı)
    tools: ['Instantly', 'Lemlist'] 
  },
  sophie: { 
    x: START_X + (2 * HORIZONTAL_SPACING), 
    y: CENTER_Y + VERTICAL_OFFSET, // +y (aşağı)
    tools: ['LinkedIn', 'PerplexityAI', 'BrightData'] 
  },
  ash: { 
    x: START_X + (3 * HORIZONTAL_SPACING), 
    y: CENTER_Y - VERTICAL_OFFSET, // -y (yukarı)
    tools: ['CalCom', 'CRM', 'Instagram'] 
  },
  clara: { 
    x: START_X + (4 * HORIZONTAL_SPACING), 
    y: CENTER_Y + VERTICAL_OFFSET, // +y (aşağı)
    tools: ['Gmail', 'BrightData'] 
  }
};

const toolSections = [
  { id: 'leo', name: 'Leo', icons: ['Apollo', 'GoogleMaps', 'Apify'] },
  { id: 'mike', name: 'Mike', icons: ['Instantly', 'Lemlist'] },
  { id: 'sophie', name: 'Sophie', icons: ['LinkedIn', 'PerplexityAI', 'BrightData'] },
  { id: 'ash', name: 'Ash', icons: ['CalCom', 'CRM', 'Instagram'] },
  { id: 'clara', name: 'Clara', icons: ['Gmail', 'BrightData'] }
];

const agents = [
  { name: 'Eva', role: 'Project Director', avatar: '👩‍💼' },
  { name: 'Leo', role: 'Lead Researcher', avatar: '👨‍🔬' },
  { name: 'Mike', role: 'Campaign Manager', avatar: '👨‍💻' },
  { name: 'Sophie', role: 'Copywriter', avatar: '👩‍✍️' },
  { name: 'Ash', role: 'Engagement & CRM Assistant', avatar: '👨‍💼' },
  { name: 'Clara', role: 'Feedback Analyst', avatar: '👩‍📊' }
];

export function WorkspaceBoard({ workspace, onUpdateWorkspace }: WorkspaceBoardProps) {
  const [selectedTools, setSelectedTools] = useState<{ [key: string]: { tool: string; position: { x: number; y: number } } }>({});
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [connectionsValidated, setConnectionsValidated] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showToolSelection, setShowToolSelection] = useState(true);
  const [evaCommandReceived, setEvaCommandReceived] = useState(false);
  const [workflowStarted, setWorkflowStarted] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(0);

  const handleManualToolSelect = (sectionId: string, toolName: string) => {
    const agentPosition = toolPositions[sectionId as keyof typeof toolPositions];
    if (agentPosition) {
      setSelectedTools(prev => ({
        ...prev,
        [sectionId]: { tool: toolName, position: { x: agentPosition.x, y: agentPosition.y } }
      }));
      onUpdateWorkspace({ ...workspace, selections: { ...workspace.selections, [sectionId]: toolName } });
    }
  };

  const handleToolMention = (agent: string, tool: string) => {
    const agentKey = agent.toLowerCase();

    if (agentKey === 'eva' && tool.toLowerCase() === 'start') {
      setEvaCommandReceived(true);
      return;
    }

    const agentPosition = toolPositions[agentKey as keyof typeof toolPositions];
    if (agentPosition && agentPosition.tools.some(t => t.toLowerCase() === tool.toLowerCase())) {
      const exactTool = agentPosition.tools.find(t => t.toLowerCase() === tool.toLowerCase()) || tool;
      setSelectedTools(prev => ({
        ...prev,
        [agentKey]: { tool: exactTool, position: { x: agentPosition.x, y: agentPosition.y } }
      }));
      onUpdateWorkspace({ ...workspace, selections: { ...workspace.selections, [agentKey]: exactTool } });
    }
  };

  const validateConnections = () => {
    setIsValidating(true);
    setValidationMessage('Bağlantılar kontrol ediliyor...');
    setTimeout(() => {
      const selectedCount = Object.keys(selectedTools).length;
      if (selectedCount === 5) {
        if (Math.random() > 0.3) {
          setConnectionsValidated(true);
          setValidationMessage("Tüm bağlantılar hazır, Eva'dan komut bekleniyor...");
          setShowToolSelection(false);
        } else {
          setConnectionsValidated(false);
          setValidationMessage('Gmail ve Cal.com bağlantıları eksik. API anahtarlarını kontrol edin.');
        }
      } else {
        setConnectionsValidated(false);
        setValidationMessage(`${5 - selectedCount} araç daha seçilmeli`);
      }
      setIsValidating(false);
    }, 2000);
  };

  const retryValidation = () => validateConnections();

  useEffect(() => {
    if (Object.keys(selectedTools).length === 5 && !connectionsValidated && !isValidating) {
      validateConnections();
    }
  }, [selectedTools]);

  const allToolsSelected = Object.keys(selectedTools).length === 5;
  const canShowStartButton = allToolsSelected && connectionsValidated && evaCommandReceived;

  const handleStartWorkflow = () => {
    setWorkflowStarted(true);
    setTimeout(() => {
      alert('İş akışı başlatıldı! n8n entegrasyonu devrede...');
    }, 1500);
  };

  // Sidebar genişliğini hesaplamak için effect
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
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden relative">
      
      <AgentHeader agents={agents} />
      
      {showToolSelection && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -20 }}
          className="p-4 bg-slate-800/50 border-b border-slate-700/50"
        >
          <h3 className="text-white font-semibold mb-4">Her agent için bir araç seçin:</h3>
          <div className="space-y-4">
            {toolSections.map(section => (
              <SelectionRow 
                key={section.id} 
                section={section} 
                selectedIcon={selectedTools[section.id]?.tool}
                onIconSelect={toolName => handleManualToolSelect(section.id, toolName)} 
              />
            ))}
          </div>
          <div className="mt-4 text-slate-400 text-sm">
            {Object.keys(selectedTools).length}/5 araç seçildi
          </div>
        </motion.div>
      )}

      <div className="flex h-[480px]">
        {/* Left Chat Panel */}
        <div className="w-1/5 p-3 border-r border-slate-700/50 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <div className="transform scale-75 origin-center">
              <ChatBox messages={workspace.messages} />
            </div>
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="w-4/5 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" className="w-full h-full">
              <defs>
                <pattern id="honeycomb" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                  <polygon points="30,2 50,15 50,37 30,50 10,37 10,15" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#honeycomb)" />
            </svg>
          </div>

          {/* Tools and Connections Container */}
          <div className="relative h-full">
            {/* Connection Lines - Z-INDEX: 5 (Altında) */}
            <div style={{ zIndex: 5 }}>
              <ConnectionLines 
                selectedTools={selectedTools} 
              />
            </div>

            {/* Selected Tools - Z-INDEX: 20 (Üstte) */}
            <AnimatePresence>
              {Object.entries(selectedTools).map(([agent, data]) => (
                <motion.div
                  key={`${agent}-${data.tool}`}
                  initial={{ scale: 0, opacity: 0, left: CENTER_X - 40, top: CENTER_Y - 32 }} // %20 küçültüldü
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    left: data.position.x - 40, // %20 küçültüldü
                    top: data.position.y - 32  // %20 küçültüldü
                  }}
                  exit={{ scale: 0, opacity: 0, left: CENTER_X - 40, top: CENTER_Y - 32 }} // %20 küçültüldü
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 25, 
                    delay: Object.keys(selectedTools).indexOf(agent) * 0.2 
                  }}
                  className="absolute"
                  style={{ 
                    zIndex: 20 // Çizgilerin üstünde
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

            {/* Start Button - Merkez pozisyonda */}
            {canShowStartButton && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={workflowStarted ? 
                  { scale: 0.5, x: 0, y: -280 } : 
                  { scale: 1, x: 0, y: 0 } // Merkez pozisyon
                }
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="absolute"
                style={{ zIndex: 25 }}
              >
                <motion.button
                  onClick={handleStartWorkflow}
                  whileHover={{ scale: workflowStarted ? 0.5 : 1.05 }}
                  whileTap={{ scale: workflowStarted ? 0.5 : 0.95 }}
                  className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                >
                  <Play className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">İş Akışını Başlat</span>
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Validation Message */}
      {(isValidating || validationMessage) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800/90 p-4 rounded-lg border border-slate-700/50 z-30"
        >
          <div className="flex items-center space-x-3">
            {isValidating && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
            )}
            <span className="text-white text-sm">{validationMessage}</span>
            {!connectionsValidated && !isValidating && validationMessage && (
              <button 
                onClick={retryValidation}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
              >
                Yeniden Dene
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Right Sidebar */}
      <RightSidebar 
        isOpen={isRightSidebarOpen} 
        onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
        onToolMention={handleToolMention} 
      />
    </div>
  );
}