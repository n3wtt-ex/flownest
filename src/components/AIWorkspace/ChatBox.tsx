import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  mode?: 'work' | 'ask';
  timestamp: string;
}

interface ChatBoxProps {
  messages: Message[];
  onSendMessage?: (message: Message) => void;
}

export function ChatBox({ messages: initialMessages, onSendMessage }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || [
    {
      id: '1',
      text: 'Welcome to your AI Workspace! Team members will communicate here and automatically select tools.',
      sender: 'ai',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      text: 'Try the team chat on the right to see automatic tool selection in action!',
      sender: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [currentMode, setCurrentMode] = useState<'work' | 'ask'>('work');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      mode: currentMode,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Call parent callback if provided
    if (onSendMessage) {
      onSendMessage(newMessage);
    }
    
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: currentMode === 'work' 
          ? 'I\'ll help you execute that task using the selected tools.'
          : 'Let me analyze that question for you.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiResponse]);
      
      if (onSendMessage) {
        onSendMessage(aiResponse);
      }
      
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-700/50">
        <h3 className="text-white font-semibold text-sm">Data Sources Chat</h3>
        <p className="text-slate-400 text-xs mt-1">Integrated lead research interface</p>
      </div>

      {/* Messages Area - Improved scrolling */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-0">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${
                  message.sender === 'user'
                    ? message.mode === 'work'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                <div className="text-sm">{message.text}</div>
                {message.mode && (
                  <div className="text-xs opacity-75 mt-1 flex items-center">
                    {message.mode === 'work' ? (
                      <>
                        <Zap className="w-3 h-3 mr-1" />
                        Work Mode
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-3 h-3 mr-1" />
                        Ask Mode
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-700 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area - Enhanced */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-800/50">
        {/* Mode Buttons */}
        <div className="flex space-x-2 mb-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentMode('work')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 flex items-center justify-center ${
              currentMode === 'work'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Zap className="w-4 h-4 mr-1" />
            Work Mode
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentMode('ask')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 flex items-center justify-center ${
              currentMode === 'ask'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Ask Mode
          </motion.button>
        </div>

        {/* Message Input */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`${currentMode === 'work' ? 'Describe your task...' : 'Ask a question...'}`}
              className="w-full bg-slate-700 text-white placeholder-slate-400 px-3 py-2 rounded-lg border border-slate-600 focus:border-yellow-500 focus:outline-none text-sm transition-colors"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`p-2 rounded-lg transition-all duration-200 ${
              inputValue.trim()
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}