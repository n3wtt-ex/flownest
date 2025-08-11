import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexIcon } from './HexIcon';
import { ConnectionLines } from './ConnectionLines';
import { ChatBox } from './ChatBox';
import { AgentHeader } from './AgentHeader';
import { RightSidebar } from './RightSidebar';
import { Play, Sparkles } from 'lucide-react';

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

const toolPositions = {
  leo: { x: -120, y: 60, tools: ['apollo', 'google_maps', 'apify'] },
  mike: { x: -60, y: -60, tools: ['instantly', 'lemlist'] },
  sophie: { x: 0, y: 60, tools: ['LinkedIn', 'PerplexityAI', 'BrightData'] },
  ash: { x: 60, y: -60, tools: ['CalCom'] },
  clara: { x: 120, y: 60, tools: ['Gmail'] }
};

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

  // 📌 Board merkezini ölçmek için ref
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardCenter, setBoardCenter] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      setBoardCenter({
        x: rect.width / 2,
        y: rect.height / 2
      });
    }
  }, []);

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

      const updatedSelections = { ...workspace.selections, [agentKey]: exactTool };
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
      
      <div className="flex h-[700px]">
        <div className="w-1/4 p-4 border-r border-slate-700/50">
          <div className="h-full">
            <ChatBox 
              messages={workspace.messages}
              onSendMessage={(message) => {
                const updatedMessages = [...workspace.messages, message];
                const updatedWorkspace = { ...workspace, messages: updatedMessages };
                onUpdateWorkspace(updatedWorkspace);
              }}
            />
          </div>
        </div>

        <div className="w-3/4 relative" ref={boardRef}>
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
            {/* 📌 boardCenter artık ConnectionLines’a gönderiliyor */}
            <div style={{ zIndex: 1 }}>
              <ConnectionLines 
                positions={Object.fromEntries(
                  Object.entries(selectedTools).map(([agent, data]) => [
                    agent, data.position
                  ])
                )}
                sections={Object.keys(selectedTools).map(agent => ({ id: agent, name: agent, icons: [] }))}
                selections={Object.fromEntries(
                  Object.entries(selectedTools).map(([agent, data]) => [agent, data.tool])
                )}
                boardCenter={boardCenter}
              />
            </div>

            <div style={{ zIndex: 2 }}>
              <AnimatePresence>
                {Object.entries(selectedTools).map(([agent, data]) => (
                  <motion.div
                    key={`${agent}-${data.tool}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute"
                    style={{ 
                      transform: `translate(${boardCenter.x + data.position.x}px, ${boardCenter.y + data.position.y}px)` 
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
            </div>
          </div>
        </div>
      </div>

      {(isValidating || validationMessage) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50"
        >
          <div className="flex items-center space-x-3">
            {isValidating && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
            )}
            <span className="text-white text-sm">{validationMessage}</span>
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
