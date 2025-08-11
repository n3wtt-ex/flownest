import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ChevronRight, ChevronLeft, Send } from 'lucide-react';

interface Message {
  id: string;
  agent: string;
  content: string;
  timestamp: string;
  toolMention?: string;
}

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onToolMention: (agent: string, tool: string) => void;
}

const agents = [
  { name: 'Eva', role: 'Project Director', avatar: '👩‍💼' },
  { name: 'Leo', role: 'Lead Researcher', avatar: '👨‍🔬' },
  { name: 'Mike', role: 'Campaign Manager', avatar: '👨‍💻' },
  { name: 'Sophie', role: 'Copywriter', avatar: '👩‍✍️' },
  { name: 'Ash', role: 'Engagement & CRM Assistant', avatar: '👨‍💼' },
  { name: 'Clara', role: 'Feedback Analyst', avatar: '👩‍📊' }
];

const agentToolMapping: { [key: string]: string[] } = {
  'Leo': ['apollo', 'google_maps', 'apify'],
  'Mike': ['instantly', 'lemlist'],
  'Sophie': ['LinkedIn', 'PerplexityAI', 'BrightData'],
  'Ash': ['CalCom'],
  'Clara': ['Gmail']
};

const mockMessages: Message[] = [
  {
    id: '1',
    agent: 'Eva',
    content: 'Team, let\'s start the new campaign setup. Leo, can you begin with lead research?',
    timestamp: '10:30 AM'
  },
  {
    id: '2',
    agent: 'Leo',
    content: 'Starting research now. I\'ll use apollo for B2B data and google_maps for local businesses.',
    timestamp: '10:32 AM',
    toolMention: 'apollo'
  },
  {
    id: '3',
    agent: 'Mike',
    content: 'Great! Once we have the leads, I\'ll set up the instantly campaign for outreach.',
    timestamp: '10:35 AM',
    toolMention: 'instantly'
  },
  {
    id: '4',
    agent: 'Sophie',
    content: 'I\'ll research the prospects on LinkedIn and use Perplexity AI for content ideas.',
    timestamp: '10:38 AM',
    toolMention: 'LinkedIn'
  }
];

export function RightSidebar({ isOpen, onToggle, onToolMention }: RightSidebarProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('Eva');

  const detectToolMention = (content: string, agent: string): string | undefined => {
    const agentTools = agentToolMapping[agent] || [];
    const lowerContent = content.toLowerCase();
    
    for (const tool of agentTools) {
      if (lowerContent.includes(tool.toLowerCase())) {
        return tool;
      }
    }
    return undefined;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const toolMention = detectToolMention(newMessage, selectedAgent);
    const message: Message = {
      id: Date.now().toString(),
      agent: selectedAgent,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolMention
    };

    setMessages(prev => [...prev, message]);
    
    if (toolMention) {
      onToolMention(selectedAgent, toolMention);
    }
    
    setNewMessage('');
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={onToggle}
        className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 p-3 bg-slate-800/90 backdrop-blur-sm rounded-l-xl border border-slate-700/50 text-white hover:bg-slate-700/90 transition-all duration-200 ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft className="w-5 h-5" />
      </motion.button>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-sm border-l border-slate-700/50 z-40 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-semibold">Team Communication</h3>
              </div>
              <button
                onClick={onToggle}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {agents.find(a => a.name === message.agent)?.avatar}
                      </span>
                      <span className="text-cyan-400 font-medium text-sm">
                        {message.agent}
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs">{message.timestamp}</span>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {message.content}
                  </p>
                  {message.toolMention && (
                    <div className="mt-2 inline-flex items-center px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
                      Tool: {message.toolMention}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700/50">
              <div className="mb-3">
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full bg-slate-800 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                >
                  {agents.map((agent) => (
                    <option key={agent.name} value={agent.name}>
                      {agent.avatar} {agent.name} - {agent.role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-800 text-white placeholder-slate-400 px-3 py-2 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none text-sm"
                />
                <motion.button
                  onClick={handleSendMessage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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