import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Zap, Users, MessageSquare } from 'lucide-react';
import { HexIcon } from './HexIcon';
import { ConnectionLines } from './ConnectionLines';
import { ChatBox } from './ChatBox';
import { SelectionRow } from './SelectionRow';
import { RightSidebar } from './RightSidebar';

interface WorkspaceData {
  id: string;
  name: string;
  selections: { [key: string]: string };
  messages: any[];
  createdAt: string;
}

interface WorkspaceBoardProps {
  workspace: WorkspaceData;
  onUpdateWorkspace: (workspace: WorkspaceData) => void;
}

const sections = [
  {
    id: 'Leo',
    name: 'Leo',
    icons: ['GoogleMaps', 'Apollo', 'Apify']
  },
  {
    id: 'Mike',
    name: 'Mike',
    icons: ['Instagram', 'Instantly', 'Lemlist']
  },
  {
    id: 'Sophie',
    name: 'Sophie',
    icons: ['LinkedIn', 'Perplexity AI', 'BrightData']
  },
  {
    id: 'Ash',
    name: 'Ash',
    icons: ['Gmail', 'CalCom', 'CRM']
  },
  {
    id: 'Clara',
    name: 'Clara',
    icons: ['GoogleMaps', 'Apollo', 'LinkedIn']
  }
];

// Altıgen nesnelerin konumları - kullanıcının isteklerine göre güncellenmiş
const toolPositions = {
  Leo: { x: -160, y: 60 },    // -4x, +y (y değeri küçültüldü)
  Mike: { x: -80, y: -60 },   // -2x, -y
  Sophie: { x: 0, y: 60 },    // 0, +y
  Ash: { x: 80, y: -60 },     // +2x, -y
  Clara: { x: 160, y: 60 }    // +4x, +y
};

export function WorkspaceBoard({ workspace, onUpdateWorkspace }: WorkspaceBoardProps) {
  const [selections, setSelections] = useState<{ [key: string]: string }>(workspace.selections || {});
  const [messages, setMessages] = useState(workspace.messages || []);
  const [isWorkflowStarted, setIsWorkflowStarted] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{ [key: string]: boolean }>({});

  const allToolsSelected = sections.every(section => selections[section.id]);

  useEffect(() => {
    const updatedWorkspace = {
      ...workspace,
      selections,
      messages
    };
    onUpdateWorkspace(updatedWorkspace);
  }, [selections, messages]);

  const handleIconSelect = (sectionId: string, iconName: string) => {
    setSelections(prev => ({
      ...prev,
      [sectionId]: iconName
    }));
    
    // Validation simulation
    setTimeout(() => {
      setValidationStatus(prev => ({
        ...prev,
        [sectionId]: true
      }));
    }, 500);
  };

  const startWorkflow = () => {
    if (!allToolsSelected) return;
    setIsWorkflowStarted(true);
    
    // Add system message
    const systemMessage = {
      id: Date.now().toString(),
      text: 'İş akışı başlatıldı! Seçilen araçlar aktif hale getirildi.',
      sender: 'ai' as const,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #FFD44D 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, #FFD44D 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex h-full">
        {/* Left Panel - Tool Selection */}
        <div className="w-80 bg-slate-800/90 backdrop-blur-sm border-r border-slate-700/50 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">AI Agents</h2>
            <p className="text-slate-400 text-sm">Her ajan için bir araç seçin</p>
          </div>
          
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="space-y-2">
                <SelectionRow
                  section={section}
                  selectedIcon={selections[section.id]}
                  onIconSelect={(iconName) => handleIconSelect(section.id, iconName)}
                />
                
                {/* Validation Status */}
                <AnimatePresence>
                  {validationStatus[section.id] && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="ml-24 text-xs text-green-400 flex items-center"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                      Araç doğrulandı
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Workspace Board */}
        <div className="flex-1 relative">
          {/* Connection Lines */}
          <ConnectionLines
            positions={toolPositions}
            sections={sections}
            selections={selections}
          />
          
          {/* Hexagonal Objects */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {sections.map((section) => {
                const position = toolPositions[section.id as keyof typeof toolPositions];
                const isSelected = !!selections[section.id];
                
                return (
                  <motion.div
                    key={section.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `calc(50% + ${position.x}px)`,
                      top: `calc(50% + ${position.y}px)`,
                      zIndex: 20
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: sections.indexOf(section) * 0.1 }}
                  >
                    <div className="relative">
                      {/* Agent Name */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium">
                        {section.name}
                      </div>
                      
                      {/* Hexagon */}
                      <HexIcon
                        name={selections[section.id] || section.icons[0]}
                        isSelected={isSelected}
                        size="large"
                      />
                      
                      {/* Status Indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Floating Start Button */}
          <AnimatePresence>
            {allToolsSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 50 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                style={{ zIndex: 50 }}
              >
                <motion.button
                  onClick={startWorkflow}
                  disabled={isWorkflowStarted}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative px-8 py-4 rounded-full font-bold text-lg shadow-2xl
                    transition-all duration-300 flex items-center space-x-3
                    ${isWorkflowStarted 
                      ? 'bg-green-500 text-white cursor-not-allowed' 
                      : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:shadow-yellow-500/25'
                    }
                  `}
                >
                  {/* Floating Animation */}
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="flex items-center space-x-3"
                  >
                    {isWorkflowStarted ? (
                      <>
                        <Zap className="w-6 h-6" />
                        <span>İş Akışı Aktif</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6" />
                        <span>İş Akışını Başlat</span>
                      </>
                    )}
                  </motion.div>
                  
                  {/* Glow Effect */}
                  {!isWorkflowStarted && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-75 blur-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Area - Bottom */}
          <div className="absolute bottom-4 left-4 right-80 h-64">
            <ChatBox messages={messages} />
          </div>
        </div>

        {/* Right Panel - Team Chat */}
        <div className="w-80">
          <RightSidebar />
        </div>
      </div>

      {/* Validation Status Panel */}
      <AnimatePresence>
        {Object.keys(validationStatus).length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50"
            style={{ zIndex: 30 }}
          >
            <h3 className="text-white font-semibold mb-2 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Doğrulama Durumu
            </h3>
            <div className="space-y-1">
              {sections.map((section) => (
                <div key={section.id} className="flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    validationStatus[section.id] ? 'bg-green-400' : 'bg-slate-600'
                  }`} />
                  <span className={validationStatus[section.id] ? 'text-green-400' : 'text-slate-400'}>
                    {section.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}