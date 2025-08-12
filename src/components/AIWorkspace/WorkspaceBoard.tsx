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

// Yeni koordinat sistemi: 16a x 10b grid, orta nokta (0,0)
// a ve b birimlerini pixel cinsinden tanımlıyoruz
const GRID_UNIT_A = 50; // a birimi = 50px
const GRID_UNIT_B = 40; // b birimi = 40px

// Tool positions - yeni koordinat sistemine göre
const toolPositions = {
  leo: { 
    x: -4 * GRID_UNIT_A, // -4a
    y: -1 * GRID_UNIT_B, // -1b
    tools: ['Apollo', 'GoogleMaps', 'Apify'] 
  },
  mike: { 
    x: -2 * GRID_UNIT_A, // -2a
    y: 1 * GRID_UNIT_B,  // +1b
    tools: ['Instantly', 'Lemlist'] 
  },
  sophie: { 
    x: 0,                 // 0
    y: -1 * GRID_UNIT_B,  // -1b
    tools: ['LinkedIn', 'PerplexityAI', 'BrightData'] 
  },
  ash: { 
    x: 2 * GRID_UNIT_A,   // +2a
    y: 1 * GRID_UNIT_B,   // +1b
    tools: ['CalCom', 'CRM', 'Instagram'] 
  },
  clara: { 
    x: 4 * GRID_UNIT_A,   // +4a
    y: -1 * GRID_UNIT_B,  // -1b
    tools: ['Gmail', 'BrightData'] 
  }
};

// Tool selection sections for manual selection
const toolSections = [
  {
    id: 'leo',
    name: 'Leo',
    icons: ['Apollo', 'GoogleMaps', 'Apify']
  },
  {
    id: 'mike', 
    name: 'Mike',
    icons: ['Instantly', 'Lemlist']
  },
  {
    id: 'sophie',
    name: 'Sophie', 
    icons: ['LinkedIn', 'PerplexityAI', 'BrightData']
  },
  {
    id: 'ash',
    name: 'Ash',
    icons: ['CalCom', 'CRM', 'Instagram'] 
  },
  {
    id: 'clara',
    name: 'Clara',
    icons: ['Gmail', 'BrightData']
  }
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

  // Manual tool selection handler
  const handleManualToolSelect = (sectionId: string, toolName: string) => {
    const agentPosition = toolPositions[sectionId as keyof typeof toolPositions];
    
    if (agentPosition) {
      setSelectedTools(prev => ({
        ...prev,
        [sectionId]: {
          tool: toolName,
          position: {
            x: agentPosition.x,
            y: agentPosition.y
          }
        }
      }));

      // Update workspace
      const updatedSelections = { ...workspace.selections, [sectionId]: toolName };
      const updatedWorkspace = { ...workspace, selections: updatedSelections };
      onUpdateWorkspace(updatedWorkspace);
    }
  };

  const handleToolMention = (agent: string, tool: string) => {
    const agentKey = agent.toLowerCase();
    const agentPosition = toolPositions[agentKey as keyof typeof toolPositions];
    
    if (agentPosition && agentPosition.tools.some(t => t.toLowerCase() === tool.toLowerCase())) {
      const exactTool = agentPosition.tools.find(t => t.toLowerCase() === tool.toLowerCase()) || tool;
      
      setSelectedTools(prev => ({
        ...prev,
        [agentKey]: {
          tool: exactTool,
          position: {
            x: agentPosition.x,
            y: agentPosition.y
          }
        }
      }));

      // Update workspace
      const updatedSelections = { ...workspace.selections, [agentKey]: exactTool };
      const updatedWorkspace = { ...workspace, selections: updatedSelections };
      onUpdateWorkspace(updatedWorkspace);
    }
  };

  const validateConnections = async () => {
    setIsValidating(true);
    setValidationMessage('Bağlantılar kontrol ediliyor...');
    
    // Simulate API validation
    setTimeout(() => {
      const selectedCount = Object.keys(selectedTools).length;
      
      if (selectedCount === 5) {
        // All tools selected - simulate successful validation
        const success = Math.random() > 0.3; // 70% success rate for demo
        
        if (success) {
          setConnectionsValidated(true);
          setValidationMessage('Tüm bağlantılar hazır, start butonuna bastığında başlayabiliriz');
          setShowToolSelection(false); // Hide tool selection once validated
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

  const handleStartWorkflow = () => {
    alert('İş akışı başlatılıyor! n8n entegrasyonu devreye giriyor...');
  };

  const retryValidation = () => {
    validateConnections();
  };

  // Auto-validate when all 5 tools are selected
  useEffect(() => {
    if (Object.keys(selectedTools).length === 5 && !connectionsValidated && !isValidating) {
      validateConnections();
    }
  }, [selectedTools]);

  const allToolsSelected = Object.keys(selectedTools).length === 5;
  const canStartWorkflow = allToolsSelected && connectionsValidated;

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden relative">
      {/* Agent Header */}
      <AgentHeader agents={agents} />
      
      {/* Tool Selection Panel - Show until all tools are validated */}
      {showToolSelection && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="p-4 bg-slate-800/50 border-b border-slate-700/50"
        >
          <h3 className="text-white font-semibold mb-4">Her agent için bir araç seçin:</h3>
          <div className="space-y-4">
            {toolSections.map((section) => (
              <SelectionRow
                key={section.id}
                section={section}
                selectedIcon={selectedTools[section.id]?.tool}
                onIconSelect={(toolName) => handleManualToolSelect(section.id, toolName)}
              />
            ))}
          </div>
          <div className="mt-4 text-slate-400 text-sm">
            {Object.keys(selectedTools).length}/5 araç seçildi
          </div>
        </motion.div>
      )}
      
      {/* Main Content - New Layout: 20% Chat + 80% Working Area */}
      <div className="flex h-[600px]">
        {/* Left Chat Area - 20% width */}
        <div className="w-1/5 p-3 border-r border-slate-700/50 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <div className="transform scale-75 origin-center">
              <ChatBox messages={workspace.messages} />
            </div>
          </div>
        </div>

        {/* Right Working Area - 80% width */}
        <div className="w-4/5 relative">
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

          {/* Working Board Content */}
          <div className="relative h-full flex items-center justify-center">
            {/* Selected Tools - Only visible when selected */}
            <AnimatePresence>
              {Object.entries(selectedTools).map(([agent, data]) => (
                <motion.div
                  key={`${agent}-${data.tool}`}
                  initial={{ scale: 0, opacity: 0, y: 50 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    y: 0
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute"
                  style={{ 
                    transform: `translate(${data.position.x}px, ${data.position.y}px)`,
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

            {/* Connection Lines - z-index 5 to stay behind hexagons */}
            <div style={{ zIndex: 5 }}>
              <ConnectionLines 
                selectedTools={selectedTools}
              />
            </div>

            {/* Start Button - Only show when validated and ready */}
            {canStartWorkflow && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute"
                style={{ 
                  transform: `translate(${6 * GRID_UNIT_A}px, 0px)`,
                  zIndex: 20
                }}
              >
                <motion.button
                  onClick={handleStartWorkflow}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center p-6 rounded-xl transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25 cursor-pointer"
                >
                  <Play className="w-8 h-8 text-white mb-2" />
                  <span className="text-white text-sm font-medium">İş Akışını Başlat</span>
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Validation Status Panel */}
      {(isValidating || validationMessage) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50 z-30"
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