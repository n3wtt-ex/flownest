import React, { useState, useEffect, useRef } from 'react';
import { Send, Zap, HelpCircle, Bot, User, Sparkles, Copy, Reply, CheckSquare, X, Save, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  mode?: 'work' | 'ask';
  timestamp: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  mode: 'work' | 'ask';
  createdAt: string;
}

// Header Component
const Header = () => (
  <div className="bg-slate-900/40 backdrop-blur p-4 rounded-2xl flex items-center justify-between mb-4">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div>
        <h1 className="text-white font-bold text-lg">AI Workspace</h1>
        <p className="text-slate-400 text-sm">Entegre araştırma arayüzü</p>
      </div>
    </div>
    <div className="flex items-center space-x-3">
      <div className="bg-slate-800/50 backdrop-blur px-3 py-1 rounded-full border border-slate-700/50">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" aria-label="System online"></div>
          <span className="text-slate-400 text-sm">7 Active Agents</span>
        </div>
      </div>
    </div>
  </div>
);

// Message Item Component
const MessageItem = ({ message, onCopy, onConvertToTask }) => {
  const [showActions, setShowActions] = useState(false);

  if (message.sender === 'ai') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-start"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="group max-w-[70%] p-4 rounded-2xl shadow-lg bg-slate-800/70 border border-slate-700/40 backdrop-blur relative">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-amber-300 font-semibold">AI Workspace</span>
          </div>
          
          <p className="text-slate-100 text-sm leading-relaxed mb-3">{message.text}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {/* Message Actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-2 right-2 flex space-x-1 bg-slate-900/90 backdrop-blur rounded-full p-1"
              >
                <button
                  onClick={() => onCopy(message.text)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                  aria-label="Copy message"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => console.log('Reply to:', message.text)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                  aria-label="Reply to message"
                >
                  <Reply className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onConvertToTask(message)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                  aria-label="Convert to task"
                >
                  <CheckSquare className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-end"
    >
      <div className={`group max-w-[70%] p-4 rounded-2xl shadow-lg border ${
        message.mode === 'work'
          ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-100'
          : 'bg-blue-500/10 border-blue-500/20 text-blue-100'
      }`}>
        <p className="text-sm leading-relaxed mb-2">{message.text}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {message.mode && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
              message.mode === 'work'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            }`}>
              {message.mode.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Task Modal Component
const TaskModal = ({ isOpen, onClose, onSave, initialText = '' }) => {
  const [taskTitle, setTaskTitle] = useState(initialText.slice(0, 80));
  const [taskDescription, setTaskDescription] = useState('');

  const handleSave = () => {
    onSave({
      title: taskTitle,
      description: taskDescription
    });
    setTaskTitle('');
    setTaskDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800/90 backdrop-blur border border-slate-700/40 rounded-2xl p-6 w-96 max-w-[90vw]"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Görev Olarak Kaydet</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-2">Görev Başlığı</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600/30 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="Görev başlığı..."
            />
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm mb-2">Açıklama</label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600/30 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none h-20"
              placeholder="Görev açıklaması..."
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
          >
            Kaydet
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Typing Indicator Component
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="flex justify-start"
  >
    <div className="flex items-start space-x-3 max-w-[70%]">
      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex-shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="bg-slate-800/70 border border-slate-700/40 backdrop-blur rounded-2xl p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-purple-400 rounded-full"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
              className="w-2 h-2 bg-purple-400 rounded-full"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4
              }}
              className="w-2 h-2 bg-purple-400 rounded-full"
            />
          </div>
          <span className="text-slate-400 text-xs" aria-live="polite">AI düşünüyor...</span>
        </div>
      </div>
    </div>
  </motion.div>
);

// Input Bar Component
const InputBar = ({ inputValue, setInputValue, currentMode, setCurrentMode, handleSendMessage, isTyping }) => (
  <div className="bg-slate-900/40 backdrop-blur border border-slate-700/30 rounded-2xl p-4">
    <div className="flex space-x-3 mb-3">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        placeholder={
          currentMode === 'work' 
            ? 'Görevinizi açıklayın...' 
            : 'Sorunuzu sorun...'
        }
        className="flex-1 bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200"
        disabled={isTyping}
        aria-label={`Type your ${currentMode} message here`}
      />
      <motion.button
        onClick={handleSendMessage}
        disabled={!inputValue.trim() || isTyping}
        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
          !inputValue.trim() || isTyping
            ? 'bg-slate-800/50 border border-slate-700/30 text-slate-500 cursor-not-allowed'
            : currentMode === 'work'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-emerald-500/25'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-blue-500/25'
        }`}
        whileHover={{ scale: inputValue.trim() && !isTyping ? 1.02 : 1 }}
        whileTap={{ scale: inputValue.trim() && !isTyping ? 0.98 : 1 }}
        aria-label={`Send ${currentMode} message`}
      >
        <Send className="w-4 h-4" />
        <span className="hidden sm:inline">Gönder</span>
      </motion.button>
    </div>
    
    <div className="flex justify-between items-center">
      {/* Quick Actions */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-slate-500">Hızlı:</span>
        {[
          { label: 'Analiz', text: 'Proje durumunu analiz et' },
          { label: 'Rapor', text: 'Rapor oluştur' },
          { label: 'Yardım', text: 'Yardıma ihtiyacım var' }
        ].map((action) => (
          <button
            key={action.label}
            className="px-2 py-1 bg-slate-800/30 border border-slate-700/30 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            onClick={() => setInputValue(action.text)}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Mode Selector */}
      <div className="bg-slate-800/30 backdrop-blur p-1 rounded-full border border-slate-700/30">
        {(['work', 'ask'] as const).map((mode) => (
          <motion.button
            key={mode}
            onClick={() => setCurrentMode(mode)}
            className={`px-3 py-1 font-semibold text-xs transition-all duration-200 flex items-center space-x-1 rounded-full ${
              currentMode === mode
                ? mode === 'work'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
            whileScale={{ scale: currentMode === mode ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            aria-pressed={currentMode === mode}
            aria-label={`Switch to ${mode} mode`}
          >
            <motion.div
              animate={currentMode === mode ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {mode === 'work' ? <Zap className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
            </motion.div>
            <span className="uppercase tracking-wide font-semibold">
              {mode === 'work' ? 'Work' : 'Ask'}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  </div>
);

// Main Component
export default function ModernAIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'AI Workspace\'e hoş geldiniz! Size nasıl yardımcı olabilirim?',
      sender: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [currentMode, setCurrentMode] = useState<'work' | 'ask'>('work');
  const [isTyping, setIsTyping] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskToCreate, setTaskToCreate] = useState<Message | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
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

    try {
      const payload: any = {
        timestamp: new Date().toISOString()
      };
      
      if (currentMode === 'work') {
        payload.work = `work:${inputValue}`;
      } else {
        payload.ask = `ask:${inputValue}`;
      }

      const response = await fetch('https://n8n.flownests.org/webhook-test/8caf5ac6-9fb5-4e68-9741-3d452248a95e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Workspace-ID': 'workspace-id'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      let responseText = 'Mesajınız alındı, teşekkürler!';
      
      if (typeof responseData === 'string') {
        responseText = responseData;
      } else if (responseData.response) {
        responseText = responseData.response;
      } else if (responseData.message) {
        responseText = responseData.message;
      } else if (responseData.text) {
        responseText = responseData.text;
      } else if (responseData.answer) {
        responseText = responseData.answer;
      } else if (responseData.reply) {
        responseText = responseData.reply;
      } else if (responseData.output) {
        responseText = responseData.output;
      } else {
        responseText = JSON.stringify(responseData, null, 2);
      }
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Webhook error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Üzgünüm, mesajınız işlenirken bir hata oluştu. Lütfen tekrar deneyin.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Message copied to clipboard');
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleConvertToTask = (message: Message) => {
    setTaskToCreate(message);
    setShowTaskModal(true);
  };

  const handleSaveTask = (taskData: { title: string; description: string }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      mode: currentMode,
      createdAt: new Date().toISOString()
    };
    
    setTasks(prev => [...prev, newTask]);
    console.log('Task saved:', newTask);
  };

  return (
    <div 
      className="h-screen w-full flex flex-col p-6"
      style={{
        background: 'linear-gradient(180deg, #071026 0%, #051428 100%)'
      }}
    >
      <Header />

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 relative">
        <div role="list" aria-label="Chat messages">
          <AnimatePresence>
            {messages.map((message) => (
              <div key={message.id} role="listitem">
                <MessageItem
                  message={message}
                  onCopy={handleCopy}
                  onConvertToTask={handleConvertToTask}
                />
              </div>
            ))}
          </AnimatePresence>

          {isTyping && <TypingIndicator />}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <InputBar
        inputValue={inputValue}
        setInputValue={setInputValue}
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        handleSendMessage={handleSendMessage}
        isTyping={isTyping}
      />

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleSaveTask}
        initialText={taskToCreate?.text || ''}
      />
    </div>
  );
}