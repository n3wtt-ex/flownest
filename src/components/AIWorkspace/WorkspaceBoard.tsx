import React, { useState, useEffect } from 'react';
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

// Y eksenindeki uzaklıkları 3/4 oranında küçültülmüş ve AI agent'ın ortasına konumlandırılmış tool pozisyonları
const toolPositions = {
  leo: { x: -120, y: 60, tools: ['apollo', 'google_maps', 'apify'] },    // 1st: (-3x, +0.75y)
  mike: { x: -60, y: -60, tools: ['instantly', 'lemlist'] },            // 2nd: (-1.5x, -0.75y)
  sophie: { x: 0, y: 60, tools: ['LinkedIn', 'PerplexityAI', 'BrightData'] }, // 3rd: (0, +0.75y)
  ash: { x: 60, y: -60, tools: ['CalCom'] },                            // 4th: (+1.5x, -0.75y)
  clara: { x: 120, y: 60, tools: ['Gmail'] }                            // 5th: (+3x, +0.75y)
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
      
      {/* Main Content - Split into two boards */}
      <div className="flex h-[700px]">
        {/* Left Board - Messaging Interface - Genişletilmiş alan */}
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

        {/* Right Board - Working Area - Daraltılmış alan */}
        <div className="w-3/4 relative">
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
            {/* Connection Lines - Behind hexagons */}
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
              />
            </div>

            {/* Selected Tools - Above connection lines */}
            <div style={{ zIndex: 2 }}>
              <AnimatePresence>
                {Object.entries(selectedTools).map(([agent, data]) => (
                  <motion.div
                    key={`${agent}-${data.tool}`}
                    initial={{ scale: 0, opacity: 0, y: 50 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1, 
                      y: 0,
                      x: data.position.x,
                      y: data.position.y
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute"
                    style={{ 
                      transform: `translate(${data.position.x}px, ${data.position.y}px)` 
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

            {/* Enhanced Start Button - Floating with balloon effect - Pozisyonu düzeltildi */}
            {allToolsSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 100 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  x: 200,  // Pozisyon düzeltildi
                  y: -120  // Pozisyon düzeltildi
                }}
                exit={{ opacity: 0, scale: 0, y: 100 }}
                className="absolute"
                style={{ zIndex: 10 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                  delay: 0.5
                }}
              >
                {/* Balloon String */}
                <motion.div
                  className="absolute top-16 left-1/2 w-px h-12 bg-gradient-to-b from-yellow-400 to-transparent"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                />
                
                {/* Balloon/Bubble Container */}
                <motion.div
                  className="relative"
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Main Button Bubble */}
                  <motion.div
                    className="relative bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full shadow-2xl"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      boxShadow: canStartWorkflow ? [
                        "0 0 20px rgba(34, 197, 94, 0.5)",
                        "0 0 40px rgba(34, 197, 94, 0.8)",
                        "0 0 20px rgba(34, 197, 94, 0.5)"
                      ] : "0 0 10px rgba(107, 114, 128, 0.3)"
                    }}
                    transition={{
                      boxShadow: { duration: 2, repeat: Infinity }
                    }}
                  >
                    <motion.button
                      onClick={handleStartWorkflow}
                      disabled={!canStartWorkflow}
                      className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
                        canStartWorkflow
                          ? 'cursor-pointer text-white'
                          : 'cursor-not-allowed opacity-50 text-gray-300'
                      }`}
                    >
                      {/* Animated sparkles */}
                      {canStartWorkflow && (
                        <>
                          <motion.div
                            className="absolute -top-2 -left-2"
                            animate={{ 
                              rotate: 360,
                              scale: [0.8, 1.2, 0.8]
                            }}
                            transition={{ 
                              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                              scale: { duration: 2, repeat: Infinity }
                            }}
                          >
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                          </motion.div>
                          <motion.div
                            className="absolute -bottom-2 -right-2"
                            animate={{ 
                              rotate: -360,
                              scale: [1.2, 0.8, 1.2]
                            }}
                            transition={{ 
                              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                              scale: { duration: 2, repeat: Infinity, delay: 1 }
                            }}
                          >
                            <Sparkles className="w-3 h-3 text-yellow-400" />
                          </motion.div>
                        </>
                      )}
                      
                      {/* Play icon */}
                      <motion.div
                        animate={canStartWorkflow ? {
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity
                        }}
                      >
                        <Play className="w-8 h-8 ml-1" fill="currentColor" />
                      </motion.div>
                    </motion.button>
                  </motion.div>
                  
                  {/* Floating text label */}
                  <motion.div
                    className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <div className="bg-slate-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-yellow-400/30 shadow-lg">
                      <span className="text-sm font-semibold">İş Akışını Başlat</span>
                      {canStartWorkflow && (
                        <motion.span
                          className="text-xs text-green-300 block"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          ✓ Hazır!
                        </motion.span>
                      )}
                    </div>
                    {/* Speech bubble pointer */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-slate-800/90"></div>
                  </motion.div>
                </motion.div>
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
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50"
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