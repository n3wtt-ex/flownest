import React, { useState, useCallback, useEffect } from 'react';
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

interface EmailCard {
  id: string;
  sender: string;
  content: string;
  tag: 'İlgili' | 'İlgisiz' | 'Soru Soruyor';
  timestamp: string;
  subject?: string;
}

const mockEmails: EmailCard[] = [
  {
    id: '1',
    sender: 'john@techcorp.com',
    subject: 'Re: Your insights on cold calling, Nazma',
    content: 'Merhaba, ürününüz hakkında daha fazla bilgi almak istiyorum. Fiyatlandırma konusunda görüşebilir miyiz?',
    tag: 'İlgili',
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    sender: 'sarah@innovate.io',
    subject: 'Re: Your insights on cold calling, Nazma',
    content: 'Teşekkürler ama şu anda böyle bir çözüme ihtiyacımız yok. İyi günler.',
    tag: 'İlgisiz',
    timestamp: '2024-01-15T11:45:00Z'
  },
  {
    id: '3',
    sender: 'mike@startup.co',
    subject: 'Re: Your insights on cold calling, Nazma',
    content: 'İlginç görünüyor. Kaç kullanıcıya kadar destekliyor? Entegrasyon süreci nasıl işliyor?',
    tag: 'Soru Soruyor',
    timestamp: '2024-01-15T14:20:00Z'
  },
  {
    id: '4',
    sender: 'lisa@company.com',
    subject: 'Re: Your insights on cold calling, Nazma',
    content: 'Demo talep ediyorum. Bu hafta müsait olduğunuz bir zaman var mı?',
    tag: 'İlgili',
    timestamp: '2024-01-15T15:10:00Z'
  },
  {
    id: '5',
    sender: 'david@business.net',
    subject: 'Re: Your insights on cold calling, Nazma',
    content: 'Şu anda başka bir çözüm kullanıyoruz ve memnunuz. Teşekkürler.',
    tag: 'İlgisiz',
    timestamp: '2024-01-15T16:30:00Z'
  },
  {
    id: '6',
    sender: 'anna@enterprise.org',
    subject: 'Re: Your insights on cold calling, Nazma',
    content: 'Güvenlik sertifikalarınız neler? GDPR uyumluluğu var mı?',
    tag: 'Soru Soruyor',
    timestamp: '2024-01-15T17:15:00Z'
  }
];

export function Responses() {
  const [emails, setEmails] = useState<EmailCard[]>(mockEmails);
  const [selectedEmail, setSelectedEmail] = useState<EmailCard | null>(null);
  const [activeCategory, setActiveCategory] = useState<'İlgili' | 'İlgisiz' | 'Soru Soruyor'>('İlgili');
  const [draggedEmail, setDraggedEmail] = useState<EmailCard | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [completedMeetings, setCompletedMeetings] = useState<Set<string>>(new Set());
  const [crmTransfers, setCrmTransfers] = useState<Set<string>>(new Set());
  const [crmTransferLoading, setCrmTransferLoading] = useState<Set<string>>(new Set());

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
      icon: <CheckCircle className="w-4 h-4" />, 
      color: 'bg-gradient-to-r from-emerald-500 to-green-500',
      shadowColor: 'shadow-emerald-200',
      hoverColor: 'hover:shadow-emerald-300',
      count: emails.filter(e => e.tag === 'İlgili').length
    },
    { 
      key: 'Soru Soruyor' as const, 
      label: 'Soru Soruyor', 
      icon: <HelpCircle className="w-4 h-4" />, 
      color: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      shadowColor: 'shadow-amber-200',
      hoverColor: 'hover:shadow-amber-300',
      count: emails.filter(e => e.tag === 'Soru Soruyor').length
    },
    { 
      key: 'İlgisiz' as const, 
      label: 'İlgisiz', 
      icon: <X className="w-4 h-4" />, 
      color: 'bg-gradient-to-r from-red-500 to-rose-500',
      shadowColor: 'shadow-red-200',
      hoverColor: 'hover:shadow-red-300',
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
      // Update email tag
      const updatedEmails = emails.map(email => 
        email.id === draggedEmail.id ? { ...email, tag: targetTag } : email
      );
      setEmails(updatedEmails);
      showNotification(`E-posta "${targetTag}" kategorisine taşındı!`, 'success');
      
      // If currently selected email was moved and we're not viewing its new category
      if (selectedEmail?.id === draggedEmail.id && activeCategory !== targetTag) {
        setSelectedEmail(null);
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
          { label: 'Teklif Maili Gönder', icon: <Mail className="w-3 h-3" />, color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' },
          { label: 'Toplantı Ayarla', icon: <Calendar className="w-3 h-3" />, color: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' },
          { label: 'CRM\'e Aktar', icon: <Database className="w-3 h-3" />, color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' }
        ];
      case 'İlgisiz':
        return [
          { label: 'Lead Listesinden Çıkar', icon: <X className="w-3 h-3" />, color: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' }
        ];
      case 'Soru Soruyor':
        return [
          { label: 'Yanıt Maili Gönder', icon: <Mail className="w-3 h-3" />, color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-emerald-500/90 text-white border border-emerald-400' 
              : 'bg-red-500/90 text-white border border-red-400'
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

      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-white/20 dark:border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Unibox
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Yanıt Takibi</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              100
            </span>
            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
              Get All Features
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)] relative">
        {/* Main Container with Tab System */}
        <div className="flex-1 flex relative">
          {/* File Tab Style Categories - Left Side */}
          <div className="relative z-20 flex flex-col justify-center space-y-1 ml-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.key}
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div
                  className={`w-32 h-16 rounded-l-xl cursor-pointer transition-all duration-300 ${
                    activeCategory === category.key
                      ? `${category.color} shadow-lg ${category.shadowColor} transform translate-x-2`
                      : `bg-white/60 dark:bg-slate-700/60 shadow-sm hover:shadow-md ${category.hoverColor} backdrop-blur-sm border border-white/30 dark:border-slate-600/30`
                  }`}
                  onClick={() => {
                    setActiveCategory(category.key);
                    setSelectedEmail(null);
                    setExpandedCard(null);
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, category.key)}
                  style={{
                    zIndex: activeCategory === category.key ? 15 : 10 - index
                  }}
                >
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-1">
                      <div className={`${
                        activeCategory === category.key 
                          ? 'text-white' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {category.icon}
                      </div>
                      <div className="writing-mode-vertical text-center">
                        <span className={`text-xs font-bold ${
                          activeCategory === category.key 
                            ? 'text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`} style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                          {category.label}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        activeCategory === category.key
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300'
                      }`}>
                        {category.count}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Email List Container - Enhanced Width */}
          <div className="w-[520px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-2xl border-y border-r border-white/20 dark:border-slate-700/50 relative z-10">
            {/* Container Header */}
            <div className="border-b border-gray-100 dark:border-slate-700/50 p-6 bg-gradient-to-r from-white/50 to-gray-50/50 dark:from-slate-800/50 dark:to-slate-700/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {activeCategory}
                </h2>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredEmails.length} e-posta
                  </span>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Email Cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredEmails.map((email, index) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`group relative bg-white dark:bg-slate-700 rounded-2xl p-5 cursor-pointer transition-all duration-300 border border-gray-100 dark:border-slate-600 ${
                    selectedEmail?.id === email.id
                      ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-100 dark:shadow-blue-900/20 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-700'
                      : 'hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-slate-900/20 hover:border-gray-200 dark:hover:border-slate-500'
                  } ${draggedEmail?.id === email.id ? 'opacity-50 scale-95' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, email)}
                  onClick={() => {
                    setSelectedEmail(email);
                    setExpandedCard(expandedCard === email.id ? null : email.id);
                  }}
                >
                  {/* Email Header */}
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(email.sender)} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white dark:ring-slate-600`}>
                      {getInitials(email.sender)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                          {email.sender}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {new Date(email.timestamp).toLocaleDateString('tr-TR')}
                          </span>
                          <Star className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-yellow-400 transition-colors cursor-pointer" />
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-3 truncate">
                        {email.subject}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {email.content}
                      </div>
                    </div>
                  </div>

                  {/* Tag Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`w-3 h-3 rounded-full ${
                      email.tag === 'İlgili' ? 'bg-emerald-400' :
                      email.tag === 'Soru Soruyor' ? 'bg-amber-400' : 'bg-red-400'
                    } shadow-sm`}></div>
                  </div>

                  {/* Expanded Actions */}
                  <AnimatePresence>
                    {expandedCard === email.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-5 pt-5 border-t border-gray-100 dark:border-slate-600"
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
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: actionIndex * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(email.id, action.label, email.sender);
                                }}
                                disabled={isCompleted || isCrmLoading}
                                className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all duration-200 shadow-lg ${
                                  isCompleted || isCrmLoading
                                    ? 'bg-gray-300 cursor-not-allowed shadow-sm' 
                                    : `${action.color} shadow-lg hover:shadow-xl`
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
          <div className="flex-1 bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-slate-800/90 dark:to-slate-700/90 backdrop-blur-sm">
            {selectedEmail ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full flex flex-col"
              >
                {/* Email Header */}
                <div className="border-b border-gray-100 dark:border-slate-700/50 p-8 bg-gradient-to-r from-white/60 to-gray-50/60 dark:from-slate-800/60 dark:to-slate-700/60">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-5">
                      <div className={`w-16 h-16 bg-gradient-to-br ${getAvatarColor(selectedEmail.sender)} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xl ring-4 ring-white dark:ring-slate-600`}>
                        {getInitials(selectedEmail.sender)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {selectedEmail.sender}
                        </h2>
                        <p className="text-base text-gray-600 dark:text-gray-300 mb-3 font-medium">
                          {selectedEmail.subject}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(selectedEmail.timestamp).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              selectedEmail.tag === 'İlgili' ? 'bg-emerald-400' :
                              selectedEmail.tag === 'Soru Soruyor' ? 'bg-amber-400' : 'bg-red-400'
                            }`}></div>
                            <span className="font-medium">{selectedEmail.tag}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-gradient-to-r from-emerald-400 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        İlgilenmiş
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                  <div className="bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-slate-700/80 dark:to-slate-600/80 rounded-2xl p-8 mb-8 shadow-lg border border-gray-100 dark:border-slate-600">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(selectedEmail.sender)} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                        {getInitials(selectedEmail.sender)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {selectedEmail.sender}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(selectedEmail.timestamp).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          <p className="whitespace-pre-wrap">{selectedEmail.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reply Section */}
                  <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 shadow-lg border border-blue-100 dark:border-blue-800/30">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Send className="w-5 h-5 text-blue-500" />
                      <span>Cevap güncelleme talimatları:</span>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed bg-white/50 dark:bg-slate-700/50 p-4 rounded-xl border border-white/50 dark:border-slate-600/50">
                      Yanıtları iyileştirmek için lütfen giden e-postalarda belirtilen 2 dakikalık demo videosunun bağlantısını verin. 
                      Bu, bir müşteri potansiyeli ilgi gösterdiğinde doğrudan göndermemi sağlayacaktır.
                    </p>
                    
                    <div className="flex space-x-4">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAction(selectedEmail.id, 'Yanıt Maili Gönder', selectedEmail.sender)}
                        className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Send className="w-5 h-5" />
                        <span>Send Reply</span>
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-600 dark:to-slate-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-slate-500 dark:hover:to-slate-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Edit className="w-5 h-5" />
                        <span>Edit Reply</span>
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-3 bg-gradient-to-r from-white to-gray-50 dark:from-slate-700 dark:to-slate-600 hover:from-gray-50 hover:to-gray-100 dark:hover:from-slate-600 dark:hover:to-slate-500 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <ChevronRight className="w-5 h-5" />
                        <span>Forward</span>
                      </motion.button>
                    </div>
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
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <MessageSquare className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Bağlantıda kalın. Unibox'ı her yere götürün.
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    Unibox mobil uygulamasını indirmek için telefonunuzla QR kodunu tarayın.
                  </p>
                  <div className="w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-500">
                    <div className="grid grid-cols-8 gap-1">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-2 h-2 ${
                            Math.random() > 0.5 
                              ? 'bg-gray-800 dark:bg-white' 
                              : 'bg-transparent'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Bir e-posta seçerek başlayın
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .writing-mode-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
        
        @keyframes slideTab {
          from {
            transform: translateX(-10px);
          }
          to {
            transform: translateX(2px);
          }
        }
        
        .tab-active {
          animation: slideTab 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}