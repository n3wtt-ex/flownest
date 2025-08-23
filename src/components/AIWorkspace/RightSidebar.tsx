import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Users } from 'lucide-react';

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

const sampleMessages: Message[] = [
  {
    id: '1',
    agent: 'Leo',
    text: 'Apollo ile lead araştırması başlattım. Google Maps entegrasyonu da hazır.',
    timestamp: '14:32',
    mentionedTools: ['Apollo', 'GoogleMaps']
  },
  {
    id: '2',
    agent: 'Mike',
    text: 'Instantly ve Lemlist kampanyaları hazır. E-posta dizileri aktif.',
    timestamp: '14:35',
    mentionedTools: ['Instantly', 'Lemlist']
  },
  {
    id: '3',
    agent: 'Sophie',
    text: 'LinkedIn outreach metinleri hazır. PerplexityAI ile içerik optimizasyonu yapıldı.',
    timestamp: '14:38',
    mentionedTools: ['LinkedIn', 'PerplexityAI']
  },
  {
    id: '4',
    agent: 'Ash',
    text: 'CalCom entegrasyonu tamamlandı. CRM ile senkronizasyon hazır.',
    timestamp: '14:42',
    mentionedTools: ['CalCom', 'CRM']
  },
  {
    id: '5',
    agent: 'Clara',
    text: 'Gmail API bağlantısı kuruldu. BrightData ile veri analizi başladı.',
    timestamp: '14:45',
    mentionedTools: ['Gmail', 'BrightData']
  }
];

export function RightSidebar({ isOpen, onToggle, onToolMention }: RightSidebarProps) {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      agent: 'You',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
  };

  const handleToolClick = (agent: string, tool: string) => {
    onToolMention(agent, tool);
  };

  React.useEffect(() => {
    // Simulate automatic tool mentions when messages are added
    messages.forEach(message => {
      if (message.mentionedTools) {
        message.mentionedTools.forEach(tool => {
          setTimeout(() => {
            onToolMention(message.agent, tool);
          }, 500);
        });
      }
    });
  }, []);

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
              <p className="text-slate-400 text-sm mt-1">Araçlar otomatik seçiliyor</p>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              {/* Team Members */}
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
                      <div className="flex flex-wrap gap-1">
                        {member.tools.map((tool) => (
                          <button
                            key={tool}
                            onClick={() => handleToolClick(member.name, tool)}
                            className="px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30 hover:border-cyan-400 transition-colors hover:scale-105"
                          >
                            {tool}
                          </button>
                        ))}
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

            {/* Input */}
            <div className="p-4 border-t border-slate-700/50">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Mesaj yazın..."
                  className="flex-1 bg-slate-800 text-white placeholder-slate-400 px-3 py-2 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white p-2 rounded-lg hover:shadow-lg transition-shadow duration-200"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}