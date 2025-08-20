import React, { useState, useEffect, useRef } from 'react';
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
      text: 'AI Workspace\'e hoş geldiniz! Ekip üyeleri burada iletişim kuracak ve görevleri yönetecek.',
      sender: 'ai',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      text: 'Bir görev atamak için "Work" modunu, soru sormak için "Ask" modunu kullanabilirsiniz.',
      sender: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [currentMode, setCurrentMode] = useState<'work' | 'ask'>('work');
  const [isTyping, setIsTyping] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShouldAutoScroll(isNearBottom);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, shouldAutoScroll]);

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
    setShouldAutoScroll(true); // Yeni mesaj gönderince otomatik scroll aktif
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: currentMode === 'work' 
          ? `Elbette, bu görevi seçili araçları kullanarak yerine getireceğim.`
          : `Sorunuzu analiz ediyorum, lütfen bekleyin.`,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4a5568;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #718096;
          }
        `}
      </style>
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full h-[450px] bg-slate-900/60 backdrop-blur-lg rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 flex-shrink-0">
          <h3 className="text-white font-bold text-base">Yeni Kaynakları Sohbeti</h3>
          <p className="text-slate-400 text-sm mt-1">Entegre araştırma arayüzü</p>
        </div>

        {/* Messages */}
        <div 
          className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar"
          onScroll={handleScroll}
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed shadow-md ${
                    message.sender === 'user'
                      ? message.mode === 'work'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-violet-600 text-white'
                      : 'bg-slate-700/80 text-slate-200'
                  }`}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-slate-700/80 p-3 rounded-xl shadow-md">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-slate-700/50 flex-shrink-0 bg-slate-900/40">
          <div className="flex space-x-2 mb-2">
            {['work', 'ask'].map((mode) => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentMode(mode as 'work' | 'ask')}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                  currentMode === mode
                    ? mode === 'work'
                      ? 'bg-cyan-500 text-white shadow-lg'
                      : 'bg-violet-500 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {mode === 'work' ? <Zap size={16} /> : <HelpCircle size={16} />}
                <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
              </motion.button>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={currentMode === 'work' ? 'Görevinizi açıklayın...' : 'Bir soru sorun...'}
              className="flex-1 bg-slate-700/80 text-white placeholder-slate-400 px-4 py-2 rounded-lg border border-transparent focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none text-sm transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow duration-200 flex items-center justify-center"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}