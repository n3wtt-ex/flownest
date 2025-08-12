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
const BOARD_HEIGHT = 480;
const CENTER_X = BOARD_WIDTH / 2;
const CENTER_Y = BOARD_HEIGHT / 2;

const HORIZONTAL_SPACING = 120;
const VERTICAL_OFFSET = 64;
const START_X = CENTER_X - (4 * HORIZONTAL_SPACING) / 2;

const toolPositions = {
  leo: { 
    x: START_X, 
    y: CENTER_Y + VERTICAL_OFFSET,
    tools: ['Apollo', 'GoogleMaps', 'Apify'] 
  },
  mike: { 
    x: START_X + HORIZONTAL_SPACING, 
    y: CENTER_Y - VERTICAL_OFFSET,
    tools: ['Instantly', 'Lemlist'] 
  },
  sophie: { 
    x: START_X + (2 * HORIZONTAL_SPACING), 
    y: CENTER_Y + VERTICAL_OFFSET,
    tools: ['LinkedIn', 'PerplexityAI', 'BrightData'] 
  },
  ash: { 
    x: START_X + (3 * HORIZONTAL_SPACING), 
    y: CENTER_Y - VERTICAL_OFFSET,
    tools: ['CalCom', 'CRM', 'Instagram'] 
  },
  clara: { 
    x: START_X + (4 * HORIZONTAL_SPACING), 
    y: CENTER_Y + VERTICAL_OFFSET,
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
        <div className="w-1/5 p-3 border-r border-slate-700/50 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <div className="transform scale-75 origin-center">
              <ChatBox messages={workspace.messages} />
            </div>
          </div>
        </div>

        <div className="w-4/5 relative overflow-hidden">
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

          <div className="relative h-full flex items-center justify-center">
            <div style={{ zIndex: 5 }}>
              <ConnectionLines selectedTools={selectedTools} />
            </div>

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
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 25, 
                    delay: Object.keys(selectedTools).indexOf(agent) * 0.2 
                  }}
                  className="absolute"
                  style={{ 
                    left: 0, 
                    top: 0, 
                    transform: `translate(${data.position.x - 40}px, ${data.position.y - 32}px)`,
                    zIndex: 20
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

            {canShowStartButton && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={workflowStarted ? 
                  { scale: 0.5, x: 0, y: -280 } : 
                  { scale: 1, x: 0, y: 0 }
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

      <RightSidebar 
        isOpen={isRightSidebarOpen} 
        onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
        onToolMention={handleToolMention} 
      />
    </div>
  );
}