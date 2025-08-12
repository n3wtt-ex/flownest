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
}

export function ChatBox({ messages: initialMessages }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || [
    {
      id: '1',
      text: 'AI Workspace\'e hoş geldiniz! Ekip üyeleri burada iletişim kuracak ve otomatik olarak araçları seçecek.',
      sender: 'ai',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      text: 'Otomatik araç seçimini görmek için sağdaki ekip sohbetini deneyin!',
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
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: currentMode === 'work' 
          ? 'Seçilen araçları kullanarak bu görevi yerine getirmenize yardımcı olacağım.'
          : 'Bu soruyu sizin için analiz edeyim.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-700/50">
        <h3 className="text-white font-semibold text-sm">AI Asistan Sohbeti</h3>
        <p className="text-slate-400 text-xs mt-1">Entegre araştırma ve görev yönetimi</p>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
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
                className={`max-w-[85%] p-3 rounded-lg text-sm ${
                  message.sender === 'user'
                    ? message.mode === 'work'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                {message.text}
                {message.mode && (
                  <div className="text-xs opacity-75 mt-0.5">
                    {message.mode === 'work' ? '⚡ Work' : '❓ Ask'}
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
            <div className="bg-slate-700 p-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mode Buttons */}
      <div className="p-3 border-t border-slate-700/50">
        <div className="flex space-x-2 mb-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentMode('work')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 ${
              currentMode === 'work'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Zap className="w-3 h-3 inline mr-1" />
            Çalışma
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentMode('ask')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 ${
              currentMode === 'ask'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <HelpCircle className="w-3 h-3 inline mr-1" />
            Soru
          </motion.button>
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`${currentMode === 'work' ? 'Görevinizi açıklayın...' : 'Bir soru sorun...'}`}
            className="flex-1 bg-slate-700 text-white placeholder-slate-400 px-3 py-2 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none text-sm"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-2 rounded-lg hover:shadow-lg transition-shadow duration-200"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}