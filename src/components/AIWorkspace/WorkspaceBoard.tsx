import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexIcon } from './HexIcon';
import { ConnectionLines } from './ConnectionLines';
import { ChatBox } from '@/components/AIWorkspace/ChatBox';
import { AgentHeader } from './AgentHeader';
import { RightSidebar } from './RightSidebar';
import { SelectionRow } from './SelectionRow';
import { OnboardingFlow } from './OnboardingFlow';
import { supabase } from '../../lib/supabaseClient';
import { useOrganization } from '@/contexts/OrganizationContext';
import MultiStepForm from './multistep_form_fixed'; // MultiStepForm importunu ekliyoruz

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
  { id: 'clara', name: 'Clara', icons: ['Gmail', 'BrightData'] },
  { id: 'tom', name: 'Tom', icons: ['CalCom'] },
  { id: 'ash', name: 'Ash', icons: ['CRM', 'Instagram'] }
];

const agents = [
  { name: 'Eva', role: 'Project Director', avatar: '👩‍💼' },
  { name: 'Leo', role: 'Lead Researcher', avatar: '👨‍🔬' },
  { name: 'Mike', role: 'Campaign Manager', avatar: '👨‍🚀' },
  { name: 'Sophie', role: 'Copywriter', avatar: '👩‍🎨' },
  { name: 'Clara', role: 'Data Analyst', avatar: '👩‍📊' },
  { name: 'Tom', role: 'Meeting Assistant', avatar: '👨‍💻' },
  { name: 'Ash', role: 'Engagement & CRM Assistant', avatar: '👩‍💼' }
];

export function WorkspaceBoard({ workspace, onUpdateWorkspace }: WorkspaceBoardProps) {
  // CRITICAL DEBUG: Log workspace immediately when component receives it
  console.log('=== WorkspaceBoard Component Mounted ===');
  console.log('workspace prop received:', workspace);
  console.log('workspace.id:', workspace?.id);
  console.log('workspace keys:', workspace ? Object.keys(workspace) : 'workspace is null/undefined');
  
  const { currentOrganization } = useOrganization();
  const [selectedTools, setSelectedTools] = useState<{ [key: string]: { tool: string; position: { x: number; y: number } } }>({});
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 480 });
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [showMultiStepForm, setShowMultiStepForm] = useState(false); // Multistep form durumu için yeni state
  
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Dinamik pozisyon hesaplama fonksiyonu
  const calculateToolPositions = (containerWidth: number, containerHeight: number) => {
    const ICON_SIZE = 60; // HexIcon large size
    const PADDING = ICON_SIZE + 50; // Container kenarlarından minimum uzaklık + 50px sola kaydırma
    
    // Kullanılabilir alan
    const availableWidth = containerWidth - (2 * PADDING);
    const availableHeight = containerHeight - (2 * PADDING);
    
    // 6 ikon için zigzag düzeni
    const horizontalSpacing = Math.min(availableWidth / 5, 120); // Max 120px spacing
    const verticalOffset = Math.min(availableHeight / 6, 60); // Max 60px offset
    
    const startX = PADDING + (availableWidth - (5 * horizontalSpacing)) / 2;
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
      clara: { 
        x: startX + (3 * horizontalSpacing), 
        y: centerY - verticalOffset,
        tools: ['Gmail', 'BrightData'] 
      },
      tom: { 
        x: startX + (4 * horizontalSpacing), 
        y: centerY + verticalOffset,
        tools: ['CalCom'] 
      },
      ash: { 
        x: startX + (5 * horizontalSpacing), 
        y: centerY - verticalOffset,
        tools: ['CRM', 'Instagram'] 
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

  const handleToolMention = (agent: string, tool: string) => {
    const agentKey = agent.toLowerCase();

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
    }
  };

  // Yeni tablodan workspace verilerini çek
  const fetchWorkspaceData = async () => {
    try {
      const { data, error } = await supabase
        .from('workspace')
        .select('*')
        .eq('workspace_id', workspace.id)
        .single();
        
      if (error) {
        console.error('Error fetching workspace data:', error);
        return;
      }
      
      setWorkspaceData(data);
      
      // Veri geldiğinde araçları otomatik seç
      if (data) {
        const newSelectedTools: { [key: string]: { tool: string; position: { x: number; y: number } } } = {};
        
        Object.keys(data).forEach(agent => {
          // workspace_id harici agent sütunlarını işle
          if (agent !== 'workspace_id' && data[agent]) {
            const agentKey = agent.toLowerCase();
            const toolName = data[agent];
            const agentPosition = toolPositions[agentKey as keyof typeof toolPositions];
            
            if (agentPosition && agentPosition.tools.includes(toolName)) {
              newSelectedTools[agentKey] = {
                tool: toolName,
                position: { x: agentPosition.x, y: agentPosition.y }
              };
            }
          }
        });
        
        setSelectedTools(newSelectedTools);
      }
    } catch (error) {
      console.error('Error in fetchWorkspaceData:', error);
    }
  };

  // Workspace verilerini periyodik olarak güncelle
  useEffect(() => {
    if (workspace && workspace.id) {
      fetchWorkspaceData();
      
      const interval = setInterval(fetchWorkspaceData, 3000);
      return () => clearInterval(interval);
    }
  }, [workspace.id]);

  // Onboarding completion handler
  const handleOnboardingComplete = (onboardingData: any) => {
    const updatedWorkspace = {
      ...workspace,
      onboardingCompleted: true,
      ...onboardingData
    };
    
    onUpdateWorkspace(updatedWorkspace);
    
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

  // Multistep form completion handler
  const handleMultiStepFormComplete = async (data: any) => {
    console.log('Multistep form completed with data:', data);
    
    // Formu kapat
    setShowMultiStepForm(false);
    
    // Workspace'i güncelle
    const updatedWorkspace = { ...workspace, ...data };
    onUpdateWorkspace(updatedWorkspace);
    
    // Webhook çağrıları
    try {
      // Tüm verileri birleştir
      const combinedData = {
        target_count: data.targetCustomers,
        target_audience: data.targetAudience,
        name: data.name,
        company: data.companyName,
        info: data.companyInfo,
        event_type: data.eventType,
        event: data.eventContent
      };

      // Webhook URL'leri
      const webhooks = [
        'https://n8n.flownests.org/webhook/c42236c9-e0a7-4d2e-bbdb-46940c0f91c5',
        'https://n8n.flownests.org/webhook/40bb5e2c-741f-4586-8c11-7659bd1cc874',
        'https://n8n.flownests.org/webhook/541cdb39-b379-4f91-a6d6-90435b58d0a0',
        'https://n8n.flownests.org/webhook/156450b8-a366-4648-8fad-eef1a1a3e5b5'
      ];

      // Tüm webhook'ları sırayla çağır
      for (const webhook of webhooks) {
        const response = await fetch(webhook, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Organization-ID': currentOrganization?.id || 'default-org'
          },
          body: JSON.stringify(combinedData),
        });
        
        if (!response.ok) {
          throw new Error(`Webhook error: ${response.status}`);
        }
      }
      
      console.log('All webhooks sent successfully');
      alert('Form başarıyla tamamlandı ve verileriniz gönderildi!');
    } catch (error) {
      console.error('Webhook error:', error);
      alert('Veriler gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  // If onboarding is not completed, show the onboarding flow
  if (!workspace.onboardingCompleted) {
    console.log('=== WorkspaceBoard: Showing Onboarding Flow ===');
    console.log('WorkspaceBoard workspace.id for onboarding:', workspace.id);
    
    return (
      <div className="w-full h-[618px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-none border border-slate-700/50 overflow-hidden relative mt-[-1px]">
        <OnboardingFlow onComplete={handleOnboardingComplete} workspaceId={workspace.id} />
      </div>
    );
  }

  // Onboarding tamamlandıktan sonra workspace board'u render et
  try {

  // Yeni workspace oluşturulduğunda tabloya satır ekle
    useEffect(() => {
      const insertWorkspaceData = async () => {
        // Önce workspace_id ile kayıt olup olmadığını kontrol et
        const { data: existingData, error: selectError } = await supabase
          .from('workspace')
          .select('workspace_id')
          .eq('workspace_id', workspace.id)
          .single();
        
        // Eğer kayıt yoksa yeni satır ekle
        if (!existingData) {
          const { error: insertError } = await supabase
            .from('workspace')
            .insert({
              workspace_id: workspace.id,
              leo: null,
              mike: null,
              sophie: null,
              clara: null,
              tom: null,
              ash: null
            });
          
          if (insertError) {
            console.error('Error inserting workspace data:', insertError);
          }
        }
      };
      
      insertWorkspaceData();
    }, [workspace.id]);

  // Multistep formu göster
  if (showMultiStepForm) {
    // Debug: log workspace.id before passing to MultiStepForm
    console.log('WorkspaceBoard - About to render MultiStepForm');
    console.log('WorkspaceBoard - workspace object:', workspace);
    console.log('WorkspaceBoard - workspace.id:', workspace.id);
    console.log('WorkspaceBoard - workspace.id type:', typeof workspace.id);
    
    return (
      <div className="w-full h-[618px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-none border border-slate-700/50 overflow-hidden relative mt-[-1px]">
        <MultiStepForm 
          onComplete={handleMultiStepFormComplete} 
          workspaceId={workspace?.id || ''} 
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[618px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-none border border-slate-700/50 overflow-hidden relative mt-[-1px]">
      
      <AgentHeader agents={agents} />
      
      {/* Araç seçim bölümü kaldırıldı - Otomatik seçim devrede */}

      <div className="flex h-[480px]">
        {/* Left Chat Panel */}
        <div className="w-1/3 p-3">
          <div className="w-full h-full">
            <ChatBox workspaceId={workspace.id} onModeChange={() => {}} />
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
                selectedTools={selectedTools || {}}
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
                    left: containerDimensions.width / 2 - 30, 
                    top: containerDimensions.height / 2 - 30 
                  }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    left: data.position.x - 30, // HexIcon large size / 2
                    top: data.position.y - 30
                  }}
                  exit={{ 
                    scale: 0, 
                    opacity: 0, 
                    left: containerDimensions.width / 2 - 30, 
                    top: containerDimensions.height / 2 - 30 
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

            {/* Start Button kaldırıldı - Otomasyon devrede */}
            
            {/* Multistep formu başlatmak için bir buton ekleyebiliriz */}
            <div className="absolute top-4 right-4 z-30">
              <button
                onClick={() => {
                  console.log('=== Formu Aç Button Clicked ===');
                  console.log('Current workspace when button clicked:', workspace);
                  console.log('Current workspace.id when button clicked:', workspace?.id);
                  setShowMultiStepForm(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
              >
                Formu Aç
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Message kaldırıldı - Otomasyon devrede */}

      {/* Right Sidebar */}
      <RightSidebar 
        isOpen={isRightSidebarOpen} 
        onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
        onToolMention={handleToolMention} 
        workspaceId={workspace.id}
      />
    </div>
  );
  } catch (error) {
    console.error('Error rendering WorkspaceBoard:', error);
    return (
      <div className="w-full h-[618px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-none border border-slate-700/50 overflow-hidden relative flex items-center justify-center mt-[-1px]">
        <div className="text-white text-center p-4">
          <h3 className="text-xl font-bold mb-2">Bir hata oluştu</h3>
          <p className="text-slate-300">Workspace yüklenirken bir hata meydana geldi.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }
}