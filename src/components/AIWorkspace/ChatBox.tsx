import React, { useState, useEffect, useRef } from 'react';
import { Send, Zap, HelpCircle, Bot, User, Sparkles, Copy, Reply, CheckSquare, X, Save, Download, MessageCircle, MoreHorizontal, Star, Bookmark, Edit3, Share, Mic, MicOff, Paperclip, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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

// Enhanced Header Component with improved aesthetics
const Header = () => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-r from-chat-surface/60 to-chat-surface/40 backdrop-blur-xl border border-chat-border/40 rounded-2xl p-4 mb-6 shadow-2xl"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <motion.div 
          className="relative p-3 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full border border-blue-500/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bot className="w-6 h-6 text-blue-400" />
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-chat-surface"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <div>
          <h1 className="text-text-primary font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Workspace
          </h1>
          <p className="text-text-secondary text-sm font-medium">Entegre araştırma arayüzü</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <motion.div 
          className="bg-chat-surface/60 backdrop-blur-sm px-4 py-2 rounded-full border border-chat-border/30"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <motion.div 
                className="w-2.5 h-2.5 bg-status-online rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                aria-label="System online"
              />
              <span className="text-text-secondary text-sm font-medium">7 Active Agents</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </motion.div>
);

// Enhanced Message Item Component with superior design
const MessageItem = ({ message, onCopy, onConvertToTask }) => {
  const [showActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    await onCopy(message.text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (message.sender === 'ai') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.4, 
          ease: [0.4, 0, 0.2, 1],
          delay: 0.1 
        }}
        className="flex justify-start group"
        onMouseEnter={() => {
          setShowActions(true);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setShowActions(false);
          setIsHovered(false);
        }}
      >
        <div className="flex items-start space-x-3 max-w-[80%]">
          {/* AI Avatar */}
          <motion.div 
            className="relative flex-shrink-0 mt-1"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <motion.div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-status-online rounded-full border-2 border-chat-surface"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Message Content */}
          <div className="relative">
            <motion.div
              className={cn(
                "relative p-4 rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300",
                "bg-gradient-to-br from-ai-message-bg/80 to-ai-message-bg/60",
                "border-ai-message-border/40",
                isHovered && "shadow-2xl border-ai-message-border/60 transform translate-y-[-2px]"
              )}
              whileHover={{ 
                boxShadow: "0 20px 40px -12px rgba(139, 92, 246, 0.15)"
              }}
            >
              {/* Message Header */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span className="text-xs text-amber-300 font-semibold tracking-wide uppercase">
                    AI Workspace
                  </span>
                </div>
                <motion.div
                  className="text-xs text-text-muted px-2 py-1 bg-chat-surface/30 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </motion.div>
              </div>
              
              {/* Message Text */}
              <motion.p 
                className="text-text-primary text-sm leading-relaxed font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {message.text}
              </motion.p>

              {/* Message Actions */}
              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-2 -right-2 flex space-x-1 bg-chat-surface/90 backdrop-blur-md rounded-full p-1.5 border border-chat-border/30 shadow-lg"
                  >
                    <motion.button
                      onClick={handleCopy}
                      className={cn(
                        "p-2 rounded-full transition-all duration-200 relative",
                        copySuccess 
                          ? "text-green-400 bg-green-500/20" 
                          : "text-text-secondary hover:text-text-primary hover:bg-chat-surface/60"
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Copy message"
                    >
                      <AnimatePresence mode="wait">
                        {copySuccess ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="w-3 h-3"
                          >
                            <CheckSquare className="w-3 h-3" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Copy className="w-3 h-3" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => console.log('Reply to:', message.text)}
                      className="p-2 text-text-secondary hover:text-text-primary hover:bg-chat-surface/60 rounded-full transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Reply to message"
                    >
                      <Reply className="w-3 h-3" />
                    </motion.button>
                    
                    <motion.button
                      onClick={() => onConvertToTask(message)}
                      className="p-2 text-text-secondary hover:text-emerald-400 hover:bg-emerald-500/20 rounded-full transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Convert to task"
                    >
                      <CheckSquare className="w-3 h-3" />
                    </motion.button>
                    
                    <motion.button
                      onClick={() => console.log('Bookmark:', message.text)}
                      className="p-2 text-text-secondary hover:text-yellow-400 hover:bg-yellow-500/20 rounded-full transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Bookmark message"
                    >
                      <Bookmark className="w-3 h-3" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  // User Message
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.4, 0, 0.2, 1] 
      }}
      className="flex justify-end group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-end space-x-3 max-w-[80%]">
        {/* Message Content */}
        <motion.div
          className={cn(
            "relative p-4 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-300",
            message.mode === 'work'
              ? "bg-gradient-to-br from-user-work-bg/20 to-user-work-bg/10 border-user-work-border/30 text-emerald-100"
              : "bg-gradient-to-br from-user-ask-bg/20 to-user-ask-bg/10 border-user-ask-border/30 text-blue-100",
            isHovered && "shadow-xl transform translate-y-[-2px]"
          )}
          whileHover={{ 
            boxShadow: message.mode === 'work' 
              ? "0 15px 30px -10px rgba(20, 184, 166, 0.25)" 
              : "0 15px 30px -10px rgba(139, 92, 246, 0.25)"
          }}
        >
          <div className="flex flex-col space-y-2">
            <motion.p 
              className="text-sm leading-relaxed font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {message.text}
            </motion.p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">
                {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              
              {message.mode && (
                <motion.span 
                  className={cn(
                    "text-xs px-3 py-1 rounded-full font-semibold border backdrop-blur-sm",
                    message.mode === 'work'
                      ? "bg-user-work-bg/30 text-emerald-200 border-user-work-border/40"
                      : "bg-user-ask-bg/30 text-blue-200 border-user-ask-border/40"
                  )}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {message.mode.toUpperCase()}
                </motion.span>
              )}
            </div>
          </div>
        </motion.div>

        {/* User Avatar */}
        <motion.div 
          className="relative flex-shrink-0 mb-1"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={cn(
            "p-2.5 rounded-full border backdrop-blur-sm",
            message.mode === 'work'
              ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30"
              : "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30"
          )}>
            <User className={cn(
              "w-4 h-4",
              message.mode === 'work' ? "text-emerald-400" : "text-blue-400"
            )} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Enhanced Task Modal Component with superior design
const TaskModal = ({ isOpen, onClose, onSave, initialText = '' }) => {
  const [taskTitle, setTaskTitle] = useState(initialText.slice(0, 80));
  const [taskDescription, setTaskDescription] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSave = async () => {
    if (!taskTitle.trim()) return;
    
    setIsAnimating(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate save delay
    
    onSave({
      title: taskTitle,
      description: taskDescription
    });
    
    setTaskTitle('');
    setTaskDescription('');
    setIsAnimating(false);
    onClose();
  };

  const handleClose = () => {
    setTaskTitle('');
    setTaskDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-chat-surface/95 to-chat-surface/90 backdrop-blur-xl border border-chat-border/40 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <motion.div
                className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full border border-emerald-500/30"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <CheckSquare className="w-5 h-5 text-emerald-400" />
              </motion.div>
              <div>
                <h3 className="text-text-primary font-bold text-lg">Görev Olarak Kaydet</h3>
                <p className="text-text-secondary text-sm">AI yanıtını görev olarak ekleyin</p>
              </div>
            </div>
            <motion.button
              onClick={handleClose}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-chat-surface/50 rounded-full transition-all duration-200"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
          
          {/* Form Fields */}
          <div className="space-y-5">
            {/* Task Title */}
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Görev Başlığı
                <span className="text-red-400 ml-1">*</span>
              </label>
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.02 }}
              >
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value.slice(0, 80))}
                  className="w-full bg-chat-background/50 border border-chat-border/30 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  placeholder="Örn: Proje durumu raporu hazırla"
                  maxLength={80}
                />
                <div className="absolute top-3 right-3 text-xs text-text-muted">
                  {taskTitle.length}/80
                </div>
              </motion.div>
            </div>
            
            {/* Task Description */}
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Açıklama
                <span className="text-text-muted text-xs ml-2">(isteğe bağlı)</span>
              </label>
              <motion.textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value.slice(0, 500))}
                className="w-full bg-chat-background/50 border border-chat-border/30 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 resize-none h-24"
                placeholder="Görev hakkında ek detaylar..."
                maxLength={500}
                whileFocus={{ scale: 1.02 }}
              />
              <div className="text-right text-xs text-text-muted mt-1">
                {taskDescription.length}/500
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3 mt-8">
            <motion.button
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-chat-surface/50 text-text-secondary border border-chat-border/30 rounded-xl hover:bg-chat-surface/70 hover:text-text-primary transition-all duration-200 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              İptal
            </motion.button>
            <motion.button
              onClick={handleSave}
              disabled={!taskTitle.trim() || isAnimating}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2",
                !taskTitle.trim() || isAnimating
                  ? "bg-chat-surface/50 text-text-muted cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-emerald-500/25"
              )}
              whileHover={{ scale: !taskTitle.trim() || isAnimating ? 1 : 1.05 }}
              whileTap={{ scale: !taskTitle.trim() || isAnimating ? 1 : 0.95 }}
            >
              {isAnimating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Bot className="w-4 h-4" />
                  </motion.div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Kaydet</span>
                </>
              )}
            </motion.button>
          </div>
          
          {/* Progress indicator */}
          {isAnimating && (
            <motion.div
              className="mt-4 w-full bg-chat-border/20 rounded-full h-1 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Enhanced Typing Indicator Component with sophisticated wave animation
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.95 }}
    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    className="flex justify-start"
  >
    <div className="flex items-start space-x-3 max-w-[70%]">
      {/* AI Avatar with pulse animation */}
      <motion.div 
        className="relative flex-shrink-0 mt-1"
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: [0, 2, -2, 0] 
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-status-typing rounded-full border-2 border-chat-surface"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7] 
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
      </motion.div>

      {/* Enhanced typing bubble */}
      <motion.div
        className="bg-gradient-to-br from-ai-message-bg/80 to-ai-message-bg/60 border border-ai-message-border/40 backdrop-blur-sm rounded-2xl p-4 shadow-xl"
        animate={{
          boxShadow: [
            "0 10px 25px -8px rgba(139, 92, 246, 0.1)",
            "0 15px 35px -10px rgba(139, 92, 246, 0.2)",
            "0 10px 25px -8px rgba(139, 92, 246, 0.1)"
          ]
        }}
        transition={{ 
          duration: 2.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <div className="flex items-center space-x-4">
          {/* Sophisticated wave dots */}
          <div className="flex space-x-1.5">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2.5 h-2.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                animate={{
                  y: [-2, 2, -2],
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.15
                }}
              />
            ))}
          </div>
          
          {/* Animated text with gradient */}
          <motion.span 
            className="text-text-secondary text-sm font-medium bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: "200% 200%"
            }}
            aria-live="polite"
          >
            AI düşünüyor...
          </motion.span>
          
          {/* Additional visual indicator */}
          <motion.div
            className="flex space-x-0.5"
            animate={{
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                className="w-0.5 h-4 bg-gradient-to-t from-purple-500/20 to-purple-400/60 rounded-full"
                animate={{
                  scaleY: [0.3, 1, 0.3],
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.1
                }}
              />
            ))}
          </motion.div>
        </div>
        
        {/* Ambient glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-2xl"
          animate={{
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  </motion.div>
);

// Enhanced Input Bar Component with superior UX
const InputBar = ({ inputValue, setInputValue, currentMode, setCurrentMode, handleSendMessage, isTyping }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const inputRef = useRef(null);
  
  const quickActions = [
    { 
      label: 'Analiz', 
      text: 'Proje durumunu analiz et', 
      icon: Bot,
      color: 'blue'
    },
    { 
      label: 'Rapor', 
      text: 'Detaylı rapor oluştur', 
      icon: CheckSquare,
      color: 'emerald'
    },
    { 
      label: 'Yardım', 
      text: 'Bu konuda yardıma ihtiyacım var', 
      icon: HelpCircle,
      color: 'purple'
    }
  ];

  const suggestions = [
    "Proje ilerlemesini analiz et",
    "Haftalık rapor hazırla",
    "Takım performansını değerlendir",
    "Bütçe durumunu kontrol et"
  ];

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 2);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      setShowSuggestions(false);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const selectSuggestion = (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const toggleVoiceRecording = () => {
    setVoiceRecording(!voiceRecording);
    // Voice recording logic would go here
  };

  return (
    <motion.div 
      className="relative bg-gradient-to-r from-chat-surface/80 to-chat-surface/60 backdrop-blur-xl border border-chat-border/40 rounded-2xl p-4 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && inputValue.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-chat-surface/90 backdrop-blur-xl border border-chat-border/40 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-2">
              <div className="text-xs text-text-muted font-medium mb-2 px-2">Önerilen eylemler:</div>
              {suggestions
                .filter(s => s.toLowerCase().includes(inputValue.toLowerCase()))
                .slice(0, 4)
                .map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-chat-accent/10 rounded-lg transition-all duration-200"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    {suggestion}
                  </motion.button>
                ))
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Section */}
      <div className="flex flex-col space-y-4">
        {/* Input Field with Enhanced Design */}
        <div className="relative">
          <motion.div
            className={cn(
              "relative flex items-center space-x-3 bg-chat-background/50 border rounded-xl transition-all duration-300",
              isFocused 
                ? "border-chat-accent/60 shadow-lg shadow-chat-accent/20" 
                : "border-chat-border/30 hover:border-chat-border/50"
            )}
            animate={{
              boxShadow: isFocused 
                ? "0 0 0 3px rgba(33, 150, 243, 0.1)" 
                : "0 0 0 0px rgba(33, 150, 243, 0)"
            }}
          >
            {/* Mode Indicator */}
            <div className={cn(
              "flex-shrink-0 p-3 rounded-l-xl transition-all duration-300",
              currentMode === 'work' 
                ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400" 
                : "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400"
            )}>
              <motion.div
                animate={{ rotate: isFocused ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                {currentMode === 'work' ? (
                  <Zap className="w-5 h-5" />
                ) : (
                  <HelpCircle className="w-5 h-5" />
                )}
              </motion.div>
            </div>

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={currentMode === 'work' 
                ? 'Görevinizi tanımlayın veya iş süreci başlatın...' 
                : 'Sorunuzu detaylı olarak açıklayın...'
              }
              className="flex-1 bg-transparent text-text-primary placeholder-text-muted py-3 px-4 focus:outline-none text-sm font-medium"
              disabled={isTyping}
              aria-label={`Type your ${currentMode} message here`}
              aria-describedby="input-mode-indicator"
            />

            {/* Input Actions */}
            <div className="flex items-center space-x-2 pr-3">
              {/* Voice Recording Button */}
              <motion.button
                onClick={toggleVoiceRecording}
                className={cn(
                  "p-2 rounded-full transition-all duration-200",
                  voiceRecording 
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                    : "text-text-muted hover:text-text-secondary hover:bg-chat-surface/50"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={voiceRecording ? "Stop recording" : "Start voice recording"}
              >
                {voiceRecording ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </motion.button>

              {/* Attachment Button */}
              <motion.button
                className="p-2 text-text-muted hover:text-text-secondary hover:bg-chat-surface/50 rounded-full transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </motion.button>

              {/* Emoji Button */}
              <motion.button
                className="p-2 text-text-muted hover:text-text-secondary hover:bg-chat-surface/50 rounded-full transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Add emoji"
              >
                <Smile className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Character Count */}
          {inputValue.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-6 right-0 text-xs text-text-muted"
            >
              {inputValue.length}/500
            </motion.div>
          )}
        </div>

        {/* Bottom Actions Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Quick Actions */}
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="text-xs text-text-muted font-medium whitespace-nowrap">Hızlı:</span>
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <motion.button
                  key={action.label}
                  className={cn(
                    "flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200",
                    "bg-chat-surface/30 border-chat-border/30 text-text-secondary",
                    "hover:border-chat-accent/40 hover:text-text-primary hover:bg-chat-accent/10"
                  )}
                  onClick={() => setInputValue(action.text)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent className="w-3 h-3" />
                  <span>{action.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Mode Selector and Send Button */}
          <div className="flex items-center space-x-3">
            {/* Enhanced Mode Selector */}
            <div className="bg-chat-surface/40 backdrop-blur-sm p-1 rounded-full border border-chat-border/30">
              {(['work', 'ask'] as const).map((mode) => (
                <motion.button
                  key={mode}
                  onClick={() => setCurrentMode(mode)}
                  className={cn(
                    "relative px-4 py-2 text-xs font-semibold transition-all duration-300 flex items-center space-x-2 rounded-full",
                    currentMode === mode
                      ? mode === 'work'
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                      : "text-text-secondary hover:text-text-primary hover:bg-chat-surface/50"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-pressed={currentMode === mode}
                  aria-label={`Switch to ${mode} mode`}
                >
                  <motion.div
                    animate={currentMode === mode ? { 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1] 
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {mode === 'work' ? (
                      <Zap className="w-3 h-3" />
                    ) : (
                      <HelpCircle className="w-3 h-3" />
                    )}
                  </motion.div>
                  <span className="uppercase tracking-wider font-bold">
                    {mode === 'work' ? 'Work' : 'Ask'}
                  </span>
                  {currentMode === mode && (
                    <motion.div
                      className="absolute inset-0 bg-white/10 rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Enhanced Send Button */}
            <motion.button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={cn(
                "relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center space-x-2 overflow-hidden",
                !inputValue.trim() || isTyping
                  ? "bg-chat-surface/50 border border-chat-border/30 text-text-muted cursor-not-allowed"
                  : currentMode === 'work'
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-emerald-500/30"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-blue-500/30"
              )}
              whileHover={{ 
                scale: inputValue.trim() && !isTyping ? 1.05 : 1,
                rotateY: inputValue.trim() && !isTyping ? [0, 5, 0] : 0
              }}
              whileTap={{ scale: inputValue.trim() && !isTyping ? 0.95 : 1 }}
              aria-label={`Send ${currentMode} message`}
            >
              {isTyping ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Bot className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ x: inputValue.trim() ? [0, 2, 0] : 0 }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                >
                  <Send className="w-4 h-4" />
                </motion.div>
              )}
              <span className="hidden sm:inline font-bold">
                {isTyping ? 'Gönderiliyor...' : 'Gönder'}
              </span>
              
              {/* Ripple effect */}
              {inputValue.trim() && !isTyping && (
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-xl"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.2], opacity: [0.3, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Voice Recording Indicator */}
      <AnimatePresence>
        {voiceRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-4 right-4 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1 flex items-center space-x-2"
          >
            <motion.div
              className="w-2 h-2 bg-red-500 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs text-red-400 font-medium">Kayıt ediliyor</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main Component
export default function ModernAIChatbot({ workspaceId }: { workspaceId?: string }) {
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
          'X-Workspace-ID': workspaceId && workspaceId.trim() !== '' ? workspaceId : 'workspace-id'
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
      className="h-full w-full flex flex-col p-6"
      style={{
        background: 'linear-gradient(180deg, #071026 0%, #051428 100%)'
      }}
    >
      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 relative scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent">
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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';
import { Zap, HelpCircle } from 'lucide-react';

export type ChatMessage = { id: string; role: "user" | "bot"; text: string; mode?: "work" | "ask" };

// ChatHeader Bileşeni
const ChatHeader = () => {
  return (
    <div className="bg-transparent p-1 mb-2">
      <h1 className="text-sm font-semibold text-gray-300">AI Asistan</h1>
    </div>
  );
};

export function ChatBox({ onModeChange, workspaceId }: { onModeChange: (mode: "work" | "ask") => void; workspaceId?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", role: "user", text: "NYC AI SaaS leadleri bul ve kampanya hazırla" },
    { id: "2", role: "bot", text: "Filtreleniyor… 32 sonuç bulundu." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [mode, setMode] = useState<"work" | "ask">("work");

  const send = async () => {
    if (!input.trim()) return;
    
    // Kullanıcı mesajını ekle
    const userMsg: ChatMessage = { id: String(Date.now()), role: "user", text: input, mode };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      // Webhook payload'ını hazırla
      const payload: any = {
        timestamp: new Date().toISOString()
      };
      
      if (mode === 'work') {
        payload.work = `work:${input}`;
      } else {
        payload.ask = `ask:${input}`;
      }

      // Webhook çağrısı yap
      const response = await fetch('https://n8n.flownests.org/webhook-test/8caf5ac6-9fb5-4e68-9741-3d452248a95e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Workspace-ID': workspaceId && workspaceId.trim() !== '' ? workspaceId : 'workspace-id'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Yanıtı işle
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
      
      // Bot yanıtını ekle
      const botMsg: ChatMessage = { 
        id: String(Date.now() + 1), 
        role: "bot", 
        text: responseText 
      };
      setMessages((m) => [...m, botMsg]);
    } catch (error) {
      console.error('Webhook error:', error);
      
      // Hata mesajını ekle
      const errorMsg: ChatMessage = { 
        id: String(Date.now() + 1), 
        role: "bot", 
        text: 'Üzgünüm, mesajınız işlenirken bir hata oluştu. Lütfen tekrar deneyin.' 
      };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-gray-950 p-4 rounded-xl"
    >
      <ChatHeader mode={mode} setMode={setMode} onModeChange={onModeChange} />
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900/50">
        {messages.map((m) => (
          <motion.div 
            key={m.id} 
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={
                m.role === "user"
                  ? "inline-block px-4 py-3 rounded-2xl rounded-br-md bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm shadow-lg max-w-[80%]"
                  : "inline-block px-4 py-3 rounded-2xl rounded-bl-md bg-gray-800 text-white border border-gray-700 text-sm shadow-lg max-w-[80%]"
              }
            >
              {m.text}
              {m.mode && m.role === "user" && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2 text-[10px] text-blue-200"
                >
                  {m.mode.toUpperCase()}
                </motion.span>
              )}
            </motion.div>
          </motion.div>
        ))}
        {typing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 text-gray-400"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse [animation-delay:120ms]" />
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse [animation-delay:240ms]" />
          </motion.div>
        )}
      </div>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-2 flex flex-col"
      >
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder={`${mode === "work" ? "Work" : "Ask"}…`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none flex-1 min-w-0 rounded-xl px-4 py-2 text-sm shadow-md transition-all duration-200"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={send} 
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            Gönder
          </motion.button>
        </div>
        <div className="flex justify-end mt-1">
          <div className="flex space-x-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setMode("work");
                onModeChange("work");
              }}
              className={`rounded-full flex items-center justify-center w-6 h-6 text-xs transition-all duration-200 ${
                mode === "work"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <Zap className="w-3 h-3" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setMode("ask");
                onModeChange("ask");
              }}
              className={`rounded-full flex items-center justify-center w-6 h-6 text-xs transition-all duration-200 ${
                mode === "ask"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <HelpCircle className="w-3 h-3" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
