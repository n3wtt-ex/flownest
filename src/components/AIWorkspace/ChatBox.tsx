import React, { useState, useEffect, useRef } from 'react';
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

interface ChatBoxTheme {
  primary: string;
  secondary: string;
  surface: string;
  border: string;
  accent: {
    work: string;
    ask: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
}

interface ChatBoxProps {
  messages: Message[];
  workspaceId: string;
  theme?: 'default' | 'professional' | 'minimal';
  variant?: 'sharp' | 'rounded';
  size?: 'compact' | 'standard' | 'expanded';
  animations?: boolean;
}

export function ChatBox({ 
  messages: initialMessages, 
  workspaceId,
  theme = 'professional',
  variant = 'sharp',
  size = 'standard',
  animations = true
}: ChatBoxProps) {
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
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Enhanced animation variants for professional design
  const messageVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      filter: "blur(4px)"
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.02,
      boxShadow: "0 4px 12px rgba(0, 132, 255, 0.2)",
      transition: { duration: 0.15 }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const typingIndicator = {
    animate: {
      opacity: [0.4, 1, 0.4],
      scale: [0.95, 1, 0.95],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  useEffect(() => {
    // Mesaj gönderildiğinde otomatik scroll yapma
  }, [messages, isTyping]); // eslint-disable-line react-hooks/exhaustive-deps

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
      // Moda göre farklı anahtarlar kullanarak webhook'a mesaj gönder
      const payload: any = {
        timestamp: new Date().toISOString()
      };
      
      if (currentMode === 'work') {
        payload.work = `work:${inputValue}`;
      } else {
        payload.ask = `ask:${inputValue}`;
      }

      // Webhook URL'sine mesajı gönder
      const response = await fetch('https://n8n.flownests.org/webhook-test/8caf5ac6-9fb5-4e68-9741-3d452248a95e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Workspace-ID': workspaceId
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // n8n'den gelen yanıtı al
      const responseData = await response.json();
      
      // n8n'den gelen yanıtı sohbet ekranına ekle
      // Yanıt formatına göre farklı alanlardan mesajı al
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
        // JSON objesini string'e çevir ama sadece değeri al
        responseText = JSON.stringify(responseData, null, 2);
      }
      
      // Satır sonlarını işlemeden direkt kullan
      const processedText = responseText;
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: processedText,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Webhook error:', error);
      
      // Hata durumunda fallback mesajı göster
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="chatbox-professional chatbox-responsive w-full h-full flex flex-col overflow-hidden"
        role="chatbox"
        aria-label="AI Assistant Chat Interface"
        onKeyDown={(e) => {
          // Enhanced keyboard navigation
          if (e.key === 'Escape') {
            setInputValue('');
          }
        }}
        tabIndex={-1}
      >
        {/* Professional Header with Status Indicator */}
        <div className="p-4 border-b-2" style={{
          borderBottomColor: 'hsl(var(--chat-border))',
          background: 'hsl(var(--chat-surface))'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: 'hsl(var(--status-online))' }}
                  aria-label="AI Assistant Online"
                ></div>
                <h3 
                  className="font-bold text-lg" 
                  style={{ 
                    color: 'hsl(var(--text-primary))',
                    fontSize: '18px',
                    fontWeight: '700'
                  }}
                >
                  AI Assistant
                </h3>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: 'hsl(var(--status-online))' }}
              ></div>
            </div>
          </div>
          <p 
            className="mt-1" 
            style={{ 
              color: 'hsl(var(--text-secondary))',
              fontSize: '14px',
              fontWeight: '400'
            }}
          >
            Integrated Research Interface
          </p>
        </div>

        {/* Messages Container with Professional Styling */}
        <div 
          className="flex-1 p-4 overflow-y-auto space-y-4"
          style={{
            background: 'hsl(var(--chat-background))',
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--chat-border)) transparent'
          }}
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                layout
                variants={animations ? messageVariants : {}}
                initial={animations ? "hidden" : false}
                animate={animations ? "visible" : {}}
                exit={animations ? "hidden" : {}}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 text-sm leading-relaxed shadow-lg ${
                    message.sender === 'user'
                      ? message.mode === 'work'
                        ? 'message-user-work'
                        : 'message-user-ask'
                      : 'message-ai'
                  }`}
                  style={{ 
                    whiteSpace: 'pre-wrap',
                    fontSize: '15px',
                    lineHeight: '1.5'
                  }}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Professional Typing Indicator */}
          {isTyping && (
            <motion.div
              variants={typingIndicator}
              animate="animate"
              className="flex justify-start"
            >
              <div 
                className="message-ai p-3 shadow-lg"
                style={{
                  background: 'hsl(var(--ai-message-bg))',
                  border: '1px solid hsl(var(--ai-message-border))'
                }}
              >
                <div className="flex items-center space-x-1.5">
                  <div 
                    className="w-2 h-2 rounded-full animate-bounce" 
                    style={{ backgroundColor: 'hsl(var(--status-typing))' }}
                  ></div>
                  <div 
                    className="w-2 h-2 rounded-full animate-bounce" 
                    style={{ 
                      backgroundColor: 'hsl(var(--status-typing))',
                      animationDelay: '0.1s'
                    }}
                  ></div>
                  <div 
                    className="w-2 h-2 rounded-full animate-bounce" 
                    style={{ 
                      backgroundColor: 'hsl(var(--status-typing))',
                      animationDelay: '0.2s'
                    }}
                  ></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Professional Input Area */}
        <div 
          className="p-3 border-t-2 flex-shrink-0" 
          style={{
            borderTopColor: 'hsl(var(--chat-border))',
            background: 'hsl(var(--chat-surface))'
          }}
          role="form"
          aria-label="Message input"
        >
          {/* Mode Selector with Sharp Design */}
          <div className="flex space-x-2 mb-3">
            {['work', 'ask'].map((mode) => (
              <motion.button
                key={mode}
                variants={animations ? buttonVariants : {}}
                whileHover={animations ? "hover" : {}}
                whileTap={animations ? "tap" : {}}
                onClick={() => setCurrentMode(mode as 'work' | 'ask')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCurrentMode(mode as 'work' | 'ask');
                  }
                }}
                className={`mode-button flex-1 py-2 px-3 sm:py-3 sm:px-4 font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                  currentMode === mode
                    ? mode === 'work'
                      ? 'active work'
                      : 'active ask'
                    : ''
                }`}
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  minHeight: '44px' // Touch-friendly minimum
                }}
                aria-pressed={currentMode === mode}
                aria-label={`Switch to ${mode} mode`}
                tabIndex={0}
              >
                {mode === 'work' ? <Zap size={16} /> : <HelpCircle size={16} />}
                <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
              </motion.button>
            ))}
          </div>

          {/* Input Field and Send Button */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setInputValue('');
                }
              }}
              placeholder={currentMode === 'work' ? 'Describe your task...' : 'Ask a question...'}
              className="flex-1 px-4 py-2 sm:py-3 text-sm transition-all border-2 focus:outline-none"
              style={{
                background: 'hsl(var(--chat-background))',
                color: 'hsl(var(--text-primary))',
                borderColor: 'hsl(var(--chat-border))',
                borderRadius: '2px',
                fontSize: '14px',
                minHeight: '44px' // Touch-friendly minimum
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'hsl(var(--chat-accent))';
                e.target.style.boxShadow = '0 0 0 1px hsl(var(--chat-accent))';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'hsl(var(--chat-border))';
                e.target.style.boxShadow = 'none';
              }}
              aria-label={`Type your ${currentMode} message here`}
              aria-describedby="input-instructions"
              autoComplete="off"
            />
            <motion.button
              variants={animations ? buttonVariants : {}}
              whileHover={animations ? "hover" : {}}
              whileTap={animations ? "tap" : {}}
              onClick={() => handleSendMessage()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={!inputValue.trim()}
              className="px-4 py-2 sm:py-3 text-white transition-all duration-200 flex items-center justify-center border-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: inputValue.trim() 
                  ? 'linear-gradient(135deg, hsl(var(--chat-accent)) 0%, hsl(var(--chat-accent-hover)) 100%)'
                  : 'hsl(var(--ai-message-bg))',
                borderColor: inputValue.trim() ? 'hsl(var(--chat-accent))' : 'hsl(var(--chat-border))',
                borderRadius: '2px',
                minWidth: '44px',
                minHeight: '44px'
              }}
              aria-label={`Send ${currentMode} message`}
              tabIndex={0}
            >
              <Send size={16} />
            </motion.button>
          </div>
          
          {/* Hidden accessibility instructions */}
          <div id="input-instructions" className="sr-only">
            Press Enter to send message, Escape to clear input. Use Tab to navigate between mode buttons and input field.
          </div>
        </div>
      </motion.div>
    </>
  );
}