import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexIcon } from './HexIcon';
import { ConnectionLines } from './ConnectionLines';
import { ChatBox } from './ChatBox';
import { AgentHeader } from './AgentHeader';
import { RightSidebar } from './RightSidebar';
import { SelectionRow } from './SelectionRow';
import { Play } from 'lucide-react';
import { OnboardingFlow } from './OnboardingFlow';

interface WorkspaceSelection {
  [key: string]: string;
}

interface WorkspaceData {
  id: string;
  name: string;
  selections: WorkspaceSelection;
  messages: any[];
  createdAt: string;
  onboardingCompleted?: boolean;
  targetCustomers?: number;
  targetAudience?: string;
  name?: string;
  companyName?: string;
  companyInfo?: string;
  eventType?: string;
  eventContent?: string;
}

interface WorkspaceBoardProps {
  workspace: WorkspaceData;
  onUpdateWorkspace: (workspace: WorkspaceData) => void;
}

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
  const [showToolSelection, setShowToolSelection] = useState(false);
  const [evaCommandReceived, setEvaCommandReceived] = useState(false);
  const [workflowStarted, setWorkflowStarted] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 480 });
  
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Dinamik pozisyon hesaplama fonksiyonu
  const calculateToolPositions = (containerWidth: number, containerHeight: number) => {
    const ICON_SIZE = 80; // HexIcon large size
    const PADDING = ICON_SIZE; // Container kenarlarından minimum uzaklık
    
    // Kullanılabilir alan
    const availableWidth = containerWidth - (2 * PADDING);
    const availableHeight = containerHeight - (2 * PADDING);
    
    // 5 ikon için zigzag düzeni
    const horizontalSpacing = Math.min(availableWidth / 4, 150); // Max 150px spacing
    const verticalOffset = Math.min(availableHeight / 6, 80); // Max 80px offset
    
    const startX = PADDING + (availableWidth - (4 * horizontalSpacing)) / 2;
    const centerY = containerHeight / 2;
    
    return {
      leo: { 
        x: startX, 
        y: centerY + verticalOffset,
        tools: ['Apollo', 'GoogleMaps', 'Apify'] 
      },
      mike: { 
        x: startX + horizontalSpacing, 
        y: centerY - verticalOffset,
        tools: ['Instantly', 'Lemlist'] 
      },
      sophie: { 
        x: startX + (2 * horizontalSpacing), 
        y: centerY + verticalOffset,
        tools: ['LinkedIn', 'PerplexityAI', 'BrightData'] 
      },
      ash: { 
        x: startX + (3 * horizontalSpacing), 
        y: centerY - verticalOffset,
        tools: ['CalCom', 'CRM', 'Instagram'] 
      },
      clara: { 
        x: startX + (4 * horizontalSpacing), 
        y: centerY + verticalOffset,
        tools: ['Gmail', 'BrightData'] 
      }
    };
  };

  // Container boyutlarını izleme - Optimize edilmiş versiyon
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const updateDimensions = () => {
      // Debounce ile gereksiz güncellemeleri engelle
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (workspaceRef.current) {
          const rect = workspaceRef.current.getBoundingClientRect();
          const newDimensions = { 
            width: rect.width, 
            height: rect.height 
          };
          
          // Sadece gerçek değişiklik varsa güncelle
          setContainerDimensions(prev => {
            if (Math.abs(prev.width - newDimensions.width) < 5 && 
                Math.abs(prev.height - newDimensions.height) < 5) {
              return prev; // Küçük değişiklikleri yok say
            }
            return newDimensions;
          });
        }
      }, 100); // 100ms debounce
    };

    // İlk yükleme
    updateDimensions();

    // Resize event listener
    window.addEventListener('resize', updateDimensions);
    
    // Sidebar toggle için sadece body'yi izle (daha spesifik)
    const observer = new MutationObserver((mutations) => {
      // Sadece sınıf değişikliklerini izle
      const hasClassChange = mutations.some(mutation => 
        mutation.type === 'attributes' && 
        mutation.attributeName === 'class'
      );
      
      if (hasClassChange) {
        // Onboarding akışı tamamlandıktan sonra pozisyonları yeniden hesapla
        if (workspace.onboardingCompleted) {
          setTimeout(updateDimensions, 300); // Animasyon tamamlandıktan sonra güncelle
        }
      }
    });
    
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] // Sadece class değişikliklerini izle
    });

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', updateDimensions);
      observer.disconnect();
    };
  }, [workspace.onboardingCompleted]); // workspace.onboardingCompleted değiştiğinde yeniden çalıştır

  // Pozisyonları güncelleme
  const toolPositions = calculateToolPositions(containerDimensions.width, containerDimensions.height);

  const handleManualToolSelect = (sectionId: string, toolName: string) => {
    const agentPosition = toolPositions[sectionId as keyof typeof toolPositions];
    if (agentPosition) {
      setSelectedTools(prev => {
        // Eğer bu agent için zaten bir araç seçilmişse, mevcut pozisyonu koru
        const existingTool = prev[sectionId];
        const position = existingTool 
          ? existingTool.position 
          : { x: agentPosition.x, y: agentPosition.y };
        
        return {
          ...prev,
          [sectionId]: { tool: toolName, position }
        };
      });
      onUpdateWorkspace({ ...workspace, selections: { ...workspace.selections, [sectionId]: toolName } });
      
      // Araç seçildiğinde hemen showToolSelection'ı false yap
      setShowToolSelection(false);
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
      setSelectedTools(prev => {
        // Eğer bu agent için zaten bir araç seçilmişse, mevcut pozisyonu koru
        const existingTool = prev[agentKey];
        const position = existingTool 
          ? existingTool.position 
          : { x: agentPosition.x, y: agentPosition.y };
        
        return {
          ...prev,
          [agentKey]: { tool: exactTool, position }
        };
      });
      onUpdateWorkspace({ ...workspace, selections: { ...workspace.selections, [agentKey]: exactTool } });
      
      // Araç seçildiğinde hemen showToolSelection'ı false yap
      setShowToolSelection(false);
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
    if (Object.keys(selectedTools).length === 5) {
      // Araç seçimi tamamlandığında hemen UI'yı gizle
      setShowToolSelection(false);
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

  // Onboarding completion handler
  const handleOnboardingComplete = (onboardingData: any) => {
    onUpdateWorkspace({
      ...workspace,
      onboardingCompleted: true,
      ...onboardingData
    });
    
    // Onboarding tamamlandıktan sonra pozisyonları yeniden hesapla
    setTimeout(() => {
      if (workspaceRef.current) {
        const rect = workspaceRef.current.getBoundingClientRect();
        setContainerDimensions({ 
          width: rect.width, 
          height: rect.height 
        });
      }
    }, 300); // Animasyon tamamlandıktan sonra güncelle
  };

  // If onboarding is not completed, show the onboarding flow
  if (!workspace.onboardingCompleted) {
    return (
      <div className="w-full h-[618px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden relative">
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="w-full h-[618px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden relative">
      
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
        <div className="w-1/3 p-3 border-r border-slate-700/50 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <ChatBox messages={workspace.messages} />
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="w-2/3 relative overflow-hidden" ref={workspaceRef}>
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
                containerDimensions={containerDimensions}
                isRightSidebarOpen={isRightSidebarOpen}
              />
            </div>

            {/* Selected Tools - Z-INDEX: 20 (Üstte) */}
            <AnimatePresence>
              {Object.entries(selectedTools).map(([agent, data]) => (
                <motion.div
                  key={`${agent}-${data.tool}`}
                  initial={{ 
                    scale: 0, 
                    opacity: 0, 
                    left: containerDimensions.width / 2 - 40, 
                    top: containerDimensions.height / 2 - 40 
                  }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    left: data.position.x - 40, // HexIcon large size / 2
                    top: data.position.y - 40
                  }}
                  exit={{ 
                    scale: 0, 
                    opacity: 0, 
                    left: containerDimensions.width / 2 - 40, 
                    top: containerDimensions.height / 2 - 40 
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 25, 
                    delay: Object.keys(selectedTools).indexOf(agent) * 0.2 
                  }}
                  className="absolute"
                  style={{ 
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

            {/* Start Button - Merkez pozisyonda */}
            {canShowStartButton && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={workflowStarted ? 
                  { 
                    scale: 0.5, 
                    x: -(containerDimensions.width / 2) + 100, 
                    y: -(containerDimensions.height / 2) + 60 
                  } : 
                  { scale: 1, x: 0, y: 0 }
                }
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
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