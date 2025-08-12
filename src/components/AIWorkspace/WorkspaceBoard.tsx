import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexIcon } from './HexIcon';
import { ConnectionLines } from './ConnectionLines';
import { ChatBox } from './ChatBox';
import { AgentHeader } from './AgentHeader';
import { RightSidebar } from './RightSidebar';
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

const agents = [
  { name: 'Eva', role: 'Project Director', avatar: '👩‍💼' },
  { name: 'Leo', role: 'Lead Researcher', avatar: '👨‍🔬' },
  { name: 'Mike', role: 'Campaign Manager', avatar: '👨‍💻' },
  { name: 'Sophie', role: 'Copywriter', avatar: '👩‍✍️' },
  { name: 'Ash', role: 'Engagement & CRM Assistant', avatar: '👨‍💼' },
  { name: 'Clara', role: 'Feedback Analyst', avatar: '👩‍📊' }
];

export function WorkspaceBoard({ workspace, onUpdateWorkspace }: WorkspaceBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [selectedTools, setSelectedTools] = useState<{ [key: string]: { tool: string; position: { x: number; y: number } } }>({});
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [connectionsValidated, setConnectionsValidated] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Koordinat hesaplama
  const getAgentPosition = (agentKey: string) => {
    const width = boardRef.current?.offsetWidth || 800;
    const height = boardRef.current?.offsetHeight || 600;
    const a = width / 16;
    const b = height / 10;

    const positions: Record<string, { x: number; y: number }> = {
      leo: { x: -4 * a, y: -1 * b },
      mike: { x: -2 * a, y: 1 * b },
      sophie: { x: 0, y: -1 * b },
      ash: { x: 2 * a, y: 1 * b },
      clara: { x: 4 * a, y: -1 * b }
    };

    return positions[agentKey];
  };

  const handleToolMention = (agent: string, tool: string) => {
    const agentKey = agent.toLowerCase();
    const agentPosition = getAgentPosition(agentKey);

    if (agentPosition) {
      setSelectedTools(prev => ({
        ...prev,
        [agentKey]: {
          tool,
          position: { x: agentPosition.x, y: agentPosition.y }
        }
      }));

      const updatedSelections = { ...workspace.selections, [agentKey]: tool };
      const updatedWorkspace = { ...workspace, selections: updatedSelections };
      onUpdateWorkspace(updatedWorkspace);
    }
  };

  const validateConnections = async () => {
    setIsValidating(true);
    setValidationMessage('Bağlantılar kontrol ediliyor...');

    setTimeout(() => {
      const selectedCount = Object.keys(selectedTools).length;

      if (selectedCount === 5) {
        const success = Math.random() > 0.3;

        if (success) {
          setConnectionsValidated(true);
          setValidationMessage('Tüm bağlantılar hazır, start butonuna bastığında başlayabiliriz');
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

  useEffect(() => {
    if (Object.keys(selectedTools).length === 5 && !connectionsValidated && !isValidating) {
      validateConnections();
    }
  }, [selectedTools]);

  const allToolsSelected = Object.keys(selectedTools).length === 5;
  const canStartWorkflow = allToolsSelected && connectionsValidated;

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden relative">
      <AgentHeader agents={agents} />

      <div className="flex h-[600px]">
        {/* Chat Area */}
        <div className="w-1/5 p-3 border-r border-slate-700/50 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <div className="transform scale-75 origin-center">
              <ChatBox messages={workspace.messages} />
            </div>
          </div>
        </div>

        {/* Working Area */}
        <div className="w-4/5 relative" ref={boardRef}>
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="honeycomb" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                  <polygon points="30,2 50,15 50,37 30,50 10,37 10,15" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#honeycomb)" />
            </svg>
          </div>

          <div className="relative h-full flex items-center justify-center">
            <AnimatePresence>
              {Object.entries(selectedTools).map(([agent, data]) => (
                <motion.div
                  key={`${agent}-${data.tool}`}
                  initial={{ scale: 0, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute"
                  style={{
                    transform: `translate(${data.position.x}px, ${data.position.y}px)`,
                    zIndex: 10
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

            <ConnectionLines selectedTools={selectedTools} />

            {allToolsSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute"
                style={{ transform: 'translate(400px, 0px)', zIndex: 20 }}
              >
                <motion.button
                  onClick={handleStartWorkflow}
                  disabled={!canStartWorkflow}
                  whileHover={{ scale: canStartWorkflow ? 1.05 : 1 }}
                  whileTap={{ scale: canStartWorkflow ? 0.95 : 1 }}
                  className={`flex flex-col items-center p-6 rounded-xl transition-all duration-300 ${
                    canStartWorkflow
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25 cursor-pointer'
                      : 'bg-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Play className="w-8 h-8 text-white mb-2" />
                  <span className="text-white text-sm font-medium">İş Akışını Başlat</span>
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

      <RightSidebar
        isOpen={isRightSidebarOpen}
        onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        onToolMention={handleToolMention}
      />
    </div>
  );
}
