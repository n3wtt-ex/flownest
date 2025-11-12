import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Mail, 
  Calendar, 
  Database, 
  X, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  Send,
  Edit,
  Trash2,
  User,
  Building2,
  Clock,
  ChevronRight,
  Star,
  Archive
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailCard {
  id: string;
  sender: string;
  content: string;
  tag: 'İlgili' | 'İlgisiz' | 'Soru Soruyor';
  timestamp: string;
  subject?: string;
}

export function Responses() {
  const [emails, setEmails] = useState<EmailCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailCard | null>(null);
  const [activeCategory, setActiveCategory] = useState<'İlgili' | 'İlgisiz' | 'Soru Soruyor'>('İlgili');
  const [draggedEmail, setDraggedEmail] = useState<EmailCard | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [completedMeetings, setCompletedMeetings] = useState<Set<string>>(new Set());
  const [crmTransfers, setCrmTransfers] = useState<Set<string>>(new Set());
  const [crmTransferLoading, setCrmTransferLoading] = useState<Set<string>>(new Set());
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Fetch emails from Supabase
  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match EmailCard interface
      const emailCards: EmailCard[] = data.map((email: any) => ({
        id: email.id,
        sender: email.sender,
        content: email.content,
        tag: email.tag,
        timestamp: email.created_at,
        subject: email.subject || `Re: Your insights on cold calling, Nazma`
      }));
      
      setEmails(emailCards);
    } catch (error) {
      console.error('Error fetching emails:', error);
      showNotification('Veriler yüklenirken bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const categories = [
    { 
      key: 'İlgili' as const, 
      label: 'İlgili', 
      icon: <CheckCircle className="w-3 h-3" />, 
      color: 'bg-emerald-500',
      activeColor: 'bg-emerald-600',
      count: emails.filter(e => e.tag === 'İlgili').length
    },
    { 
      key: 'Soru Soruyor' as const, 
      label: 'Soru?', 
      icon: <HelpCircle className="w-3 h-3" />, 
      color: 'bg-amber-500',
      activeColor: 'bg-amber-600',
      count: emails.filter(e => e.tag === 'Soru Soruyor').length
    },
    { 
      key: 'İlgisiz' as const, 
      label: 'İlgisiz', 
      icon: <X className="w-3 h-3" />, 
      color: 'bg-red-500',
      activeColor: 'bg-red-600',
      count: emails.filter(e => e.tag === 'İlgisiz').length
    }
  ];

  const handleDragStart = (e: React.DragEvent, email: EmailCard) => {
    setDraggedEmail(email);
    e.dataTransfer.setData('text/plain', email.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetTag: EmailCard['tag']) => {
    e.preventDefault();
    if (draggedEmail && draggedEmail.tag !== targetTag) {
      try {
        // Update email tag in the database
        const { error } = await supabase
          .from('emails')
          .update({ tag: targetTag })
          .eq('id', draggedEmail.id);

        if (error) throw error;

        // Update email tag in the state
        const updatedEmails = emails.map(email => 
          email.id === draggedEmail.id ? { ...email, tag: targetTag } : email
        );
        setEmails(updatedEmails);
        showNotification(`E-posta "${targetTag}" kategorisine taşındı!`, 'success');
        
        // If currently selected email was moved and we're not viewing its new category
        if (selectedEmail?.id === draggedEmail.id && activeCategory !== targetTag) {
          setSelectedEmail(null);
        }
      } catch (error) {
        console.error('Error updating email tag:', error);
        showNotification('Etiket güncellenirken bir hata oluştu.', 'error');
      }
    }
    setDraggedEmail(null);
  };

  const handleAction = async (emailId: string, action: string, senderEmail?: string) => {
    console.log(`Action: ${action} for email: ${emailId}`);
    
    if (action === 'Toplantı Ayarla') {
      setCompletedMeetings(prev => new Set(prev).add(emailId));
      showNotification('Toplantı daveti gönderildi!', 'success');
    } else if (action === 'Lead Listesinden Çıkar') {
      setCompletedMeetings(prev => new Set(prev).add(emailId));
      showNotification('Lead listesinden çıkarıldı!', 'success');
    } else if (action === 'Teklif Maili Gönder') {
      showNotification('Teklif maili gönderildi!', 'success');
    } else if (action === 'Yanıt Maili Gönder') {
      showNotification('Yanıt maili gönderildi!', 'success');
    } else if (action === 'CRM\'e Aktar') {
      if (crmTransfers.has(emailId)) {
        showNotification('Bu lead zaten CRM\'e aktarılmış!', 'error');
        return;
      }
      setCrmTransferLoading(prev => new Set(prev).add(emailId));
      
      setTimeout(() => {
        setCrmTransfers(prev => new Set(prev).add(emailId));
        setCrmTransferLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(emailId);
          return newSet;
        });
        showNotification('Lead başarıyla CRM\'e aktarıldı!', 'success');
      }, 2000);
    }
    
    setExpandedCard(null);
  };

  const getActionButtons = (tag: string, emailId: string) => {
    switch (tag) {
      case 'İlgili':
        return [
          { label: 'Teklif Maili Gönder', icon: <Mail className="w-3 h-3" />, color: 'bg-blue-500 hover:bg-blue-600' },
          { label: 'Toplantı Ayarla', icon: <Calendar className="w-3 h-3" />, color: 'bg-green-500 hover:bg-green-600' },
          { label: 'CRM\'e Aktar', icon: <Database className="w-3 h-3" />, color: 'bg-purple-500 hover:bg-purple-600' }
        ];
      case 'İlgisiz':
        return [
          { label: 'Lead Listesinden Çıkar', icon: <X className="w-3 h-3" />, color: 'bg-red-500 hover:bg-red-600' }
        ];
      case 'Soru Soruyor':
        return [
          { label: 'Yanıt Maili Gönder', icon: <Mail className="w-3 h-3" />, color: 'bg-blue-500 hover:bg-blue-600' }
        ];
      default:
        return [];
    }
  };

  const filteredEmails = emails
    .filter(email => email.tag === activeCategory)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getInitials = (email: string) => {
    const name = email.split('@')[0];
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (email: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600', 
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600'
    ];
    const index = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Yanıtlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-red-500 text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </motion.div>
      )}

      <div className="flex h-screen relative">
        {/* Page Title - Top Left Corner */}
        <div className="absolute top-6 left-6 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Yanıt Takibi
              </h1>
            </div>
          </div>
        </div>
        {/* Main Container - Shifted Left */}
        <div className="flex-1 flex relative ml-6 pt-20">
          {/* Vertical Tabs - Left Side - Smaller Size & Better Positioning */}
          <div className="flex flex-col justify-start pt-16 space-y-1 mr-2">
            {categories.map((category, index) => (
              <motion.div
                key={category.key}
                className="relative"
                whileHover={{ scale: 1.02 }}
                animate={{
                  x: activeCategory === category.key ? 4 : 0,
                  scale: activeCategory === category.key ? 1.05 : 0.95,
                  zIndex: activeCategory === category.key ? 20 : 10 - index
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20,
                  duration: 0.2 
                }}
              >
                <div
                  className={`w-12 h-16 rounded-l-lg cursor-pointer transition-all duration-300 ${
                    activeCategory === category.key
                      ? `${category.activeColor} shadow-lg`
                      : `${category.color} hover:${category.activeColor} shadow-sm opacity-75`
                  }`}
                  onClick={() => {
                    setActiveCategory(category.key);
                    setSelectedEmail(null);
                    setExpandedCard(null);
                    setIsEditingReply(false);
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e: any) => handleDrop(e, category.key)}
                  style={{
                    zIndex: activeCategory === category.key ? 20 : 10 - index
                  }}
                >
                  <div className="h-full flex flex-col items-center justify-center space-y-1.5 py-2">
                    <div className="text-white">
                      <div className="w-2.5 h-2.5">
                        {React.cloneElement(category.icon, { className: "w-2.5 h-2.5" })}
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-[10px] font-medium text-white whitespace-nowrap transform -rotate-90">
                        {category.label}
                      </span>
                    </div>
                    <div className="w-3.5 h-3.5 bg-white/20 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                      {category.count}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Email List Container - Reduced Width by 15% */}
          <div className="w-[374px] bg-card shadow-lg border border-border rounded-lg">
            {/* Statistics Header */}
            <div className="bg-muted border-b border-border p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">İstatistikler</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">İlgili: {emails.filter(e => e.tag === 'İlgili').length}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Soru: {emails.filter(e => e.tag === 'Soru Soruyor').length}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">İlgisiz: {emails.filter(e => e.tag === 'İlgisiz').length}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Container Header */}
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  {activeCategory}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {filteredEmails.length} e-posta
                </span>
              </div>
            </div>

            {/* Email Cards */}
            <div className="h-full overflow-y-auto p-3 space-y-2">
              {filteredEmails.map((email, index) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className={`group relative bg-background rounded-lg p-3 cursor-pointer transition-all duration-200 border ${
                    selectedEmail?.id === email.id
                      ? 'ring-2 ring-blue-500 border-blue-500 shadow-md'
                      : 'border-border hover:shadow-sm hover:border-gray-300'
                  } ${draggedEmail?.id === email.id ? 'opacity-50 scale-95' : ''}`}
                  draggable
                  onDragStart={(e: any) => handleDragStart(e, email)}
                  onClick={() => {
                    setSelectedEmail(email);
                    setExpandedCard(expandedCard === email.id ? null : email.id);
                  }}
                >
                  {/* Email Header */}
                  <div className="flex items-start space-x-3">
                    <div className={`w-9 h-9 bg-gradient-to-br ${getAvatarColor(email.sender)} rounded-lg flex items-center justify-center text-white font-semibold text-xs`}>
                      {getInitials(email.sender)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground truncate text-sm">
                          {email.sender}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(email.timestamp).toLocaleDateString('tr-TR')}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${
                            email.tag === 'İlgili' ? 'bg-green-400' :
                            email.tag === 'Soru Soruyor' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}></div>
                        </div>
                      </div>
                      <div className="text-sm text-foreground mb-2 truncate">
                        {email.subject}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {email.content}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Actions - Optimized Animation */}
                  <AnimatePresence mode="wait">
                    {expandedCard === email.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ 
                          opacity: 1, 
                          height: 'auto', 
                          marginTop: 12,
                          transition: { 
                            height: { duration: 0.15, ease: "easeOut" },
                            opacity: { duration: 0.1, delay: 0.05 },
                            marginTop: { duration: 0.15, ease: "easeOut" }
                          }
                        }}
                        exit={{ 
                          opacity: 0, 
                          height: 0, 
                          marginTop: 0,
                          transition: { 
                            height: { duration: 0.12, ease: "easeIn" },
                            opacity: { duration: 0.08 },
                            marginTop: { duration: 0.12, ease: "easeIn" }
                          }
                        }}
                        className="pt-3 border-t border-border"
                        style={{ overflow: "hidden" }}
                      >
                        <div className="flex flex-wrap gap-2">
                          {getActionButtons(email.tag, email.id).map((action, actionIndex) => {
                            const isMeetingCompleted = action.label === 'Toplantı Ayarla' && completedMeetings.has(email.id);
                            const isLeadRemoved = action.label === 'Lead Listesinden Çıkar' && completedMeetings.has(email.id);
                            const isCrmTransferredCheck = action.label === 'CRM\'e Aktar' && crmTransfers.has(email.id);
                            const isCrmLoading = action.label === 'CRM\'e Aktar' && crmTransferLoading.has(email.id);
                            const isCompleted = isMeetingCompleted || isLeadRemoved || isCrmTransferredCheck;
                            
                            return (
                              <motion.button
                                key={action.label}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ 
                                  opacity: 1, 
                                  scale: 1,
                                  transition: { 
                                    duration: 0.12, 
                                    delay: actionIndex * 0.03,
                                    ease: "easeOut" 
                                  }
                                }}
                                exit={{
                                  opacity: 0,
                                  scale: 0.95,
                                  transition: { duration: 0.08 }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(email.id, action.label, email.sender);
                                }}
                                disabled={isCompleted || isCrmLoading}
                                className={`flex items-center space-x-1 px-3 py-1 text-xs font-medium text-white rounded-md transition-all duration-200 ${
                                  isCompleted || isCrmLoading
                                    ? 'bg-gray-300 cursor-not-allowed' 
                                    : `${action.color} shadow-sm hover:shadow-md`
                                }`}
                              >
                                {isCrmLoading ? (
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  action.icon
                                )}
                                <span>{action.label}</span>
                                {isCompleted && <CheckCircle className="w-3 h-3" />}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Panel - Detail Area */}
          <div className="flex-1 bg-card border-l border-border">
            {selectedEmail ? (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full flex flex-col"
              >
                {/* Email Header */}
                <div className="border-b border-border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(selectedEmail.sender)} rounded-lg flex items-center justify-center text-white font-semibold shadow-sm`}>
                        {getInitials(selectedEmail.sender)}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground mb-1">
                          {selectedEmail.sender}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-2">
                          {selectedEmail.subject}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(selectedEmail.timestamp).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${
                              selectedEmail.tag === 'İlgili' ? 'bg-green-400' :
                              selectedEmail.tag === 'Soru Soruyor' ? 'bg-yellow-400' : 'bg-red-400'
                            }`}></div>
                            <span>{selectedEmail.tag}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        İlgilenmiş
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-br ${getAvatarColor(selectedEmail.sender)} rounded-lg flex items-center justify-center text-white font-semibold text-sm`}>
                        {getInitials(selectedEmail.sender)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {selectedEmail.sender}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(selectedEmail.timestamp).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300">
                          <p className="whitespace-pre-wrap">{selectedEmail.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reply Section */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Send className="w-4 h-4 text-blue-500" />
                      <span>Cevap güncelleme talimatları:</span>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                      Yanıtları iyileştirmek için lütfen giden e-postalarda belirtilen 2 dakikalık demo videosunun bağlantısını verin. 
                      Bu, bir müşteri potansiyeli ilgi gösterdiğinde doğrudan göndermemi sağlayacaktır.
                    </p>
                    
                    <div className="flex space-x-3">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (isEditingReply && replyText.trim()) {
                            handleAction(selectedEmail.id, 'Yanıt Maili Gönder', selectedEmail.sender);
                            setIsEditingReply(false);
                            setReplyText('');
                          } else {
                            handleAction(selectedEmail.id, 'Yanıt Maili Gönder', selectedEmail.sender);
                          }
                        }}
                        disabled={isEditingReply && !replyText.trim()}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isEditingReply && !replyText.trim() 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>{isEditingReply ? 'Send Custom Reply' : 'Send Reply'}</span>
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setIsEditingReply(!isEditingReply);
                          if (!isEditingReply) {
                            setReplyText('');
                          }
                        }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isEditingReply
                            ? 'bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
                            : 'bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                        <span>{isEditingReply ? 'Cancel Edit' : 'Edit Reply'}</span>
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-2 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                        <span>Forward</span>
                      </motion.button>
                    </div>
                    
                    {/* Edit Reply Section */}
                    <AnimatePresence>
                      {isEditingReply && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ 
                            opacity: 1, 
                            height: 'auto', 
                            marginTop: 24,
                            transition: { 
                              height: { duration: 0.3, ease: "easeOut" },
                              opacity: { duration: 0.2, delay: 0.1 },
                              marginTop: { duration: 0.3, ease: "easeOut" }
                            }
                          }}
                          exit={{ 
                            opacity: 0, 
                            height: 0, 
                            marginTop: 0,
                            transition: { 
                              height: { duration: 0.2, ease: "easeIn" },
                              opacity: { duration: 0.1 },
                              marginTop: { duration: 0.2, ease: "easeIn" }
                            }
                          }}
                          className="border-t border-blue-200 dark:border-blue-800 pt-6"
                        >
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Yanıtınızı yazın:
                              </label>
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Merhaba ${selectedEmail?.sender},

Teşekkür ederiz. Sorularınızla ilgili detaylı bilgi vermek isterim...

En iyi dileklerimle,
Nazma`}
                                className="w-full h-32 px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                autoFocus
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {replyText.length} karakter
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setReplyText('')}
                                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                >
                                  Temizle
                                </button>
                                <button
                                  onClick={() => setReplyText(`Merhaba ${selectedEmail?.sender},

Teşekkür ederiz. Sorularınızla ilgili detaylı bilgi vermek isterim...

En iyi dileklerimle,
Nazma`)}
                                  className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                >
                                  Şablon Yükle
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center p-8">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center max-w-md"
                >
                  <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Bağlantıda kalın. Unibox'ı her yere götürün.
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Unibox mobil uygulamasını indirmek için telefonunuzla QR kodunu tarayın.
                  </p>
                  <div className="w-32 h-32 bg-gray-100 dark:bg-slate-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div className="grid grid-cols-8 gap-1">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1 h-1 ${
                            Math.random() > 0.5 
                              ? 'bg-gray-600 dark:bg-gray-400' 
                              : 'bg-transparent'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Bir e-posta seçerek başlayın
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}