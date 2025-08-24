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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
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
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Unibox
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Yanıt Takibi</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-bold">
              100
            </span>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
              Get All Features
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)] relative">
        {/* Main Container with Tab System */}
        <div className="flex-1 flex relative ml-4">
          {/* File Tab Style Categories - Left Side */}
          <div className="relative z-20 flex flex-col justify-center space-y-2 mr-1">
            {categories.map((category, index) => (
              <motion.div
                key={category.key}
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div
                  className={`w-20 h-28 rounded-l-lg cursor-pointer transition-all duration-300 ${
                    activeCategory === category.key
                      ? `${category.color} shadow-md transform translate-x-1`
                      : `bg-white/70 dark:bg-slate-700/70 shadow-sm hover:shadow-md backdrop-blur-sm border border-gray-200 dark:border-slate-600`
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
                  <div className="h-full flex flex-col items-center justify-center space-y-2 py-2">
                    <div className={`${
                      activeCategory === category.key 
                        ? 'text-white' 
                        : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {category.icon}
                    </div>
                    <div className="text-center transform rotate-90">
                      <span className={`text-xs font-medium whitespace-nowrap ${
                        activeCategory === category.key 
                          ? 'text-white' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {category.label}
                      </span>
                    </div>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeCategory === category.key
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300'
                    }`}>
                      {category.count}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Email List Container - Reduced Width */}
          <div className="w-[440px] bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 relative z-10 rounded-lg">
            {/* Container Header */}
            <div className="border-b border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {activeCategory}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredEmails.length} e-posta
                  </span>
                </div>
              </div>
            </div>

            {/* Email Cards */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredEmails.map((email, index) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className={`group relative bg-white dark:bg-slate-700 rounded-lg p-4 cursor-pointer transition-all duration-200 border ${
                    selectedEmail?.id === email.id
                      ? 'ring-2 ring-blue-500 border-blue-500 shadow-md'
                      : 'border-gray-200 dark:border-slate-600 hover:shadow-sm hover:border-gray-300 dark:hover:border-slate-500'
                  } ${draggedEmail?.id === email.id ? 'opacity-50 scale-95' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, email)}
                  onClick={() => {
                    setSelectedEmail(email);
                    setExpandedCard(expandedCard === email.id ? null : email.id);
                  }}
                >
                  {/* Email Header */}
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(email.sender)} rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm`}>
                      {getInitials(email.sender)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white truncate text-sm">
                          {email.sender}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(email.timestamp).toLocaleDateString('tr-TR')}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${
                            email.tag === 'İlgili' ? 'bg-green-400' :
                            email.tag === 'Soru Soruyor' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}></div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 truncate">
                        {email.subject}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {email.content}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Actions */}
                  <AnimatePresence>
                    {expandedCard === email.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-600"
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
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: actionIndex * 0.1 }}
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
          <div className="flex-1 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700">
            {selectedEmail ? (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full flex flex-col"
              >
                {/* Email Header */}
                <div className="border-b border-gray-200 dark:border-slate-700 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(selectedEmail.sender)} rounded-lg flex items-center justify-center text-white font-semibold shadow-md`}>
                        {getInitials(selectedEmail.sender)}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                          {selectedEmail.sender}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {selectedEmail.subject}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
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
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Cevap güncelleme talimatları:
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                      Yanıtları iyileştirmek için lütfen giden e-postalarda belirtilen 2 dakikalık demo videosunun bağlantısını verin. 
                      Bu, bir müşteri potansiyeli ilgi gösterdiğinde doğrudan göndermemi sağlayacaktır.
                    </p>
                    
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleAction(selectedEmail.id, 'Yanıt Maili Gönder', selectedEmail.sender)}
                        className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send Reply</span>
                      </button>
                      <button className="flex items-center space-x-2 bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Edit className="w-4 h-4" />
                        <span>Edit Reply</span>
                      </button>
                      <button className="flex items-center space-x-2 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <ChevronRight className="w-4 h-4" />
                        <span>Forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
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
                </div>
              </div>
            )}
          </div></h2>
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
      `}</style>
    </div>
  );
}
    </div>
  );
}