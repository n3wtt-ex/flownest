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
  ChevronRight
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
      icon: <CheckCircle className="w-5 h-5" />, 
      color: 'bg-green-500',
      count: emails.filter(e => e.tag === 'İlgili').length
    },
    { 
      key: 'Soru Soruyor' as const, 
      label: 'Soru Soruyor', 
      icon: <HelpCircle className="w-5 h-5" />, 
      color: 'bg-yellow-500',
      count: emails.filter(e => e.tag === 'Soru Soruyor').length
    },
    { 
      key: 'İlgisiz' as const, 
      label: 'İlgisiz', 
      icon: <X className="w-5 h-5" />, 
      color: 'bg-red-500',
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
          { label: 'Teklif Maili Gönder', icon: <Mail className="w-4 h-4" />, color: 'bg-blue-500 hover:bg-blue-600' },
          { label: 'Toplantı Ayarla', icon: <Calendar className="w-4 h-4" />, color: 'bg-green-500 hover:bg-green-600' },
          { label: 'CRM\'e Aktar', icon: <Database className="w-4 h-4" />, color: 'bg-purple-500 hover:bg-purple-600' }
        ];
      case 'İlgisiz':
        return [
          { label: 'Lead Listesinden Çıkar', icon: <X className="w-4 h-4" />, color: 'bg-red-500 hover:bg-red-600' }
        ];
      case 'Soru Soruyor':
        return [
          { label: 'Yanıt Maili Gönder', icon: <Mail className="w-4 h-4" />, color: 'bg-blue-500 hover:bg-blue-600' }
        ];
      default:
        return [];
    }
  };

  const filteredEmails = emails
    .filter(email => email.tag === activeCategory)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unibox</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Yanıt Takibi</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">100</span>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">
              Get All Features
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col">
          {/* Categories */}
          <div className="p-4">
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.key}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeCategory === category.key
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => {
                    setActiveCategory(category.key);
                    setSelectedEmail(null);
                    setExpandedCard(null);
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, category.key)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${category.color} rounded flex items-center justify-center text-white`}>
                      {category.icon}
                    </div>
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <span className="bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {activeCategory} ({filteredEmails.length} e-posta)
              </h2>
              <div className="space-y-2">
                {filteredEmails.map((email) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedEmail?.id === email.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 bg-white dark:bg-slate-700'
                    } ${draggedEmail?.id === email.id ? 'opacity-50' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, email)}
                    onClick={() => {
                      setSelectedEmail(email);
                      setExpandedCard(expandedCard === email.id ? null : email.id);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getInitials(email.sender)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {email.sender}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(email.timestamp).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
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
                          className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600"
                        >
                          <div className="flex flex-wrap gap-2">
                            {getActionButtons(email.tag, email.id).map((action) => {
                              const isMeetingCompleted = action.label === 'Toplantı Ayarla' && completedMeetings.has(email.id);
                              const isLeadRemoved = action.label === 'Lead Listesinden Çıkar' && completedMeetings.has(email.id);
                              const isCrmTransferredCheck = action.label === 'CRM\'e Aktar' && crmTransfers.has(email.id);
                              const isCrmLoading = action.label === 'CRM\'e Aktar' && crmTransferLoading.has(email.id);
                              const isCompleted = isMeetingCompleted || isLeadRemoved || isCrmTransferredCheck;
                              
                              return (
                                <button
                                  key={action.label}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction(email.id, action.label, email.sender);
                                  }}
                                  disabled={isCompleted || isCrmLoading}
                                  className={`flex items-center space-x-1 px-3 py-1 text-xs font-medium text-white rounded-md transition-all duration-200 ${
                                    isCompleted || isCrmLoading
                                      ? 'bg-gray-300 cursor-not-allowed' 
                                      : action.color
                                  }`}
                                >
                                  {isCrmLoading ? (
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    action.icon
                                  )}
                                  <span>{action.label}</span>
                                  {isCompleted && <CheckCircle className="w-3 h-3" />}
                                </button>
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
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
          {selectedEmail ? (
            <>
              {/* Email Header */}
              <div className="border-b border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-lg font-medium text-gray-700 dark:text-gray-300">
                      {getInitials(selectedEmail.sender)}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedEmail.sender}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {selectedEmail.subject}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(selectedEmail.timestamp).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={`w-2 h-2 rounded-full ${
                            selectedEmail.tag === 'İlgili' ? 'bg-green-500' :
                            selectedEmail.tag === 'Soru Soruyor' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></span>
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
              <div className="flex-1 p-6">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
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
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Bağlantıda kalın. Unibox'ı her yere götürün.
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Unibox mobil uygulamasını indirmek için telefonunuzla QR kodunu tarayın.
                </p>
                <div className="w-32 h-32 bg-gray-100 dark:bg-slate-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <div className="text-xs text-gray-400 dark:text-gray-500">QR Code</div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Bir e-posta seçerek başlayın
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}