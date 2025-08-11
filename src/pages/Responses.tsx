import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mail, Calendar, Database, X, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface EmailCard {
  id: string;
  sender: string;
  content: string;
  tag: 'İlgili' | 'İlgisiz' | 'Soru Soruyor';
  timestamp: string;
}

const mockEmails: EmailCard[] = [
  {
    id: '1',
    sender: 'john@techcorp.com',
    content: 'Merhaba, ürününüz hakkında daha fazla bilgi almak istiyorum. Fiyatlandırma konusunda görüşebilir miyiz?',
    tag: 'İlgili',
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    sender: 'sarah@innovate.io',
    content: 'Teşekkürler ama şu anda böyle bir çözüme ihtiyacımız yok. İyi günler.',
    tag: 'İlgisiz',
    timestamp: '2024-01-15T11:45:00Z'
  },
  {
    id: '3',
    sender: 'mike@startup.co',
    content: 'İlginç görünüyor. Kaç kullanıcıya kadar destekliyor? Entegrasyon süreci nasıl işliyor?',
    tag: 'Soru Soruyor',
    timestamp: '2024-01-15T14:20:00Z'
  },
  {
    id: '4',
    sender: 'lisa@company.com',
    content: 'Demo talep ediyorum. Bu hafta müsait olduğunuz bir zaman var mı?',
    tag: 'İlgili',
    timestamp: '2024-01-15T15:10:00Z'
  },
  {
    id: '5',
    sender: 'david@business.net',
    content: 'Şu anda başka bir çözüm kullanıyoruz ve memnunuz. Teşekkürler.',
    tag: 'İlgisiz',
    timestamp: '2024-01-15T16:30:00Z'
  },
  {
    id: '6',
    sender: 'anna@enterprise.org',
    content: 'Güvenlik sertifikalarınız neler? GDPR uyumluluğu var mı?',
    tag: 'Soru Soruyor',
    timestamp: '2024-01-15T17:15:00Z'
  }
];

export function Responses() {
  const [emails, setEmails] = useState<EmailCard[]>(mockEmails);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'İlgili': return 'bg-green-100 text-green-800 border-green-200';
      case 'İlgisiz': return 'bg-red-100 text-red-800 border-red-200';
      case 'Soru Soruyor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'İlgili': return <CheckCircle className="w-4 h-4" />;
      case 'İlgisiz': return <X className="w-4 h-4" />;
      case 'Soru Soruyor': return <HelpCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleAction = (emailId: string, action: string) => {
    console.log(`Action: ${action} for email: ${emailId}`);
    // Here you would integrate with n8n or your backend
    setSelectedEmail(null);
    
    // Show success message
    alert(`${action} işlemi başlatıldı!`);
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
          { label: 'İlgili Olarak İşaretle', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-500 hover:bg-green-600' },
          { label: 'İlgisiz Olarak İşaretle', icon: <X className="w-4 h-4" />, color: 'bg-red-500 hover:bg-red-600' },
          { label: 'Yanıt Maili Gönder', icon: <Mail className="w-4 h-4" />, color: 'bg-blue-500 hover:bg-blue-600' }
        ];
      default:
        return [];
    }
  };

  const groupedEmails = emails.reduce((acc, email) => {
    if (!acc[email.tag]) {
      acc[email.tag] = [];
    }
    acc[email.tag].push(email);
    return acc;
  }, {} as Record<string, EmailCard[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4"
          >
            <MessageSquare className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            Yanıt Takibi
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            E-posta yanıtlarını kategorize edin ve uygun aksiyonları alın
          </motion.p>
        </div>

        {/* Email Cards by Category */}
        <div className="space-y-8">
          {Object.entries(groupedEmails).map(([tag, tagEmails]) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Category Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTagIcon(tag)}
                    <h2 className="text-xl font-semibold text-gray-900">{tag}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTagColor(tag)}`}>
                      {tagEmails.length} e-posta
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Cards */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tagEmails.map((email) => (
                    <motion.div
                      key={email.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedEmail(selectedEmail === email.id ? null : email.id)}
                    >
                      {/* Email Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {email.sender}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(email.timestamp).toLocaleDateString('tr-TR')}
                        </div>
                      </div>

                      {/* Email Content */}
                      <div className="text-sm text-gray-700 line-clamp-3 mb-4">
                        {email.content}
                      </div>

                      {/* Action Buttons */}
                      <AnimatePresence>
                        {selectedEmail === email.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 border-t border-gray-200 pt-3"
                          >
                            {getActionButtons(email.tag, email.id).map((action, index) => (
                              <motion.button
                                key={action.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(email.id, action.label);
                                }}
                                className={`w-full flex items-center justify-center space-x-2 px-3 py-2 text-white text-sm font-medium rounded-lg transition-colors duration-200 ${action.color}`}
                              >
                                {action.icon}
                                <span>{action.label}</span>
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Özet İstatistikler</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {groupedEmails['İlgili']?.length || 0}
              </div>
              <div className="text-sm text-gray-600">İlgili Yanıtlar</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {groupedEmails['Soru Soruyor']?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Soru Soranlar</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {groupedEmails['İlgisiz']?.length || 0}
              </div>
              <div className="text-sm text-gray-600">İlgisiz Yanıtlar</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}