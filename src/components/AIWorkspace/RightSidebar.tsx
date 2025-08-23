import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Users } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface Message {
  id: string;
  agent: string;
  text: string;
  timestamp: string;
  mentionedTools?: string[];
}

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onToolMention: (agent: string, tool: string) => void;
}

interface AgentChat {
  id: string;
  agent_name: string;
  message: string;
  created_at: string;
}

const teamMembers = [
  { 
    name: 'Leo', 
    role: 'Lead Researcher', 
    color: 'from-blue-500 to-cyan-500',
    tools: ['Apollo', 'GoogleMaps', 'Apify']
  },
  { 
    name: 'Mike', 
    role: 'Campaign Manager', 
    color: 'from-green-500 to-emerald-500',
    tools: ['Instantly', 'Lemlist']
  },
  { 
    name: 'Sophie', 
    role: 'Copywriter', 
    color: 'from-purple-500 to-pink-500',
    tools: ['LinkedIn', 'PerplexityAI', 'BrightData']
  },
  { 
    name: 'Ash', 
    role: 'Engagement Assistant', 
    color: 'from-orange-500 to-red-500',
    tools: ['CalCom', 'CRM', 'Instagram']
  },
  { 
    name: 'Clara', 
    role: 'Feedback Analyst', 
    color: 'from-indigo-500 to-purple-500',
    tools: ['Gmail', 'BrightData']
  }
];

// Tarih formatlama fonksiyonu
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  // Türkiye saat diliminde (UTC+3) göster
  const utcDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = utcDate.getUTCDate().toString().padStart(2, '0');
  const hours = utcDate.getUTCHours().toString().padStart(2, '0');
  const minutes = utcDate.getUTCMinutes().toString().padStart(2, '0');
  
  return `${month}/${day} ${hours}.${minutes}`;
};

export function RightSidebar({ isOpen, onToggle, onToolMention }: RightSidebarProps) {
  console.log('RightSidebar rendered with isOpen:', isOpen);
  
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Veritabanından mesajları çek
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        console.log('Fetching messages from database...');
        
        const { data, error } = await supabase
          .from('agent_chat')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }
        
        console.log('Messages fetched:', data);
        
        // Veritabanı verisini Message formatına dönüştür
        const formattedMessages: Message[] = data.map((item: AgentChat) => ({
          id: item.id,
          agent: item.agent_name,
          text: item.message,
          timestamp: formatTimestamp(item.created_at)
        }));
        
        console.log('Formatted messages:', formattedMessages);
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error in fetchMessages:', error);
      }
    };
    
    // İlk yükleme
    fetchMessages();
    
    // 5 saniyede bir veriyi güncelle
    const interval = setInterval(fetchMessages, 5000);
    
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const handleToolClick = (agent: string, tool: string) => {
    console.log('Tool clicked:', agent, tool);
    onToolMention(agent, tool);
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <motion.button
          onClick={onToggle}
          className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white p-3 rounded-l-lg shadow-lg hover:shadow-xl transition-shadow duration-200 z-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Users className="w-5 h-5" />
        </motion.button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-80 h-full bg-slate-900/95 backdrop-blur-sm border-l border-slate-700/50 z-50 flex flex-col"
          >
            {/* Toggle Button Inside Sidebar */}
            <motion.button
              onClick={onToggle}
              className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white p-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 z-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50">
              <h3 className="text-white font-semibold flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Ekip Sohbeti
              </h3>
              <p className="text-slate-400 text-sm mt-1">Araçlar otomatik olarak AI tarafından seçilir</p>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              {/* Team Members - Manuel araç seçimi kaldırıldı */}
              <div className="p-4 border-b border-slate-700/50">
                <h4 className="text-slate-300 text-sm font-medium mb-3">Aktif Üyeler</h4>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.name} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${member.color}`}></div>
                        <span className="text-slate-300 text-sm font-medium">{member.name}</span>
                        <span className="text-slate-500 text-xs">• {member.role}</span>
                      </div>
                      <div className="text-slate-400 text-xs">
                        Araçlar otomatik olarak AI tarafından seçilir
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3">
                <h4 className="text-slate-300 text-sm font-medium mb-3">Mesajlar</h4>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-cyan-400 text-sm font-medium">{message.agent}</span>
                      <span className="text-slate-500 text-xs">{message.timestamp}</span>
                    </div>
                    <p className="text-slate-200 text-sm mb-2">{message.text}</p>
                    
                    {message.mentionedTools && (
                      <div className="flex flex-wrap gap-1">
                        {message.mentionedTools.map((tool) => (
                          <button
                            key={tool}
                            onClick={() => handleToolClick(message.agent, tool)}
                            className="px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30 hover:border-cyan-400 transition-colors"
                          >
                            {tool}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Input - Removed as per requirements */}
            <div className="p-4 border-t border-slate-700/50">
              <div className="text-slate-400 text-sm text-center">
                Bu kanal sadece izleme amaçlıdır. Mesaj göndermek için chatbot'u kullanın.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}