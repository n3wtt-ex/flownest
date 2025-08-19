import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mail, Calendar, Database, X, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  const [draggedEmail, setDraggedEmail] = useState<EmailCard | null>(null);
  const [completedMeetings, setCompletedMeetings] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [crmTransfers, setCrmTransfers] = useState<Set<string>>(new Set()); // CRM aktarılanlar
  const [crmTransferLoading, setCrmTransferLoading] = useState<Set<string>>(new Set()); // CRM aktarım yüklemeleri

  // Debug: Log dragged email changes
  useEffect(() => {
    if (draggedEmail) {
      console.log('Dragging email:', draggedEmail);
    }
  }, [draggedEmail]);

  // Fetch emails from Supabase on component mount
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
      
      if (data) {
        setEmails(data.map((email: any) => ({
          id: email.id,
          sender: email.sender,
          content: email.content,
          tag: email.tag,
          timestamp: email.created_at
        })));
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      showNotification('Veriler yüklenirken bir hata oluştu. Mock veriler kullanılıyor.', 'error');
      // Use mock data as fallback
      setEmails(mockEmails);
    } finally {
      setLoading(false);
    }
  };

  const updateEmailTag = async (emailId: string, newTag: string) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ tag: newTag })
        .eq('id', emailId);
      
      if (error) throw error;
      
      // Update local state
      const updatedEmails = emails.map(email => 
        email.id === emailId ? { ...email, tag: newTag as EmailCard['tag'] } : email
      );
      setEmails(updatedEmails);
      showNotification(`E-posta "${newTag}" olarak işaretlendi!`, 'success');
    } catch (error) {
      console.error('Error updating email tag:', error);
      showNotification('Etiket güncellenirken bir hata oluştu!', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const isCrmTransferred = (emailId: string) => {
    return crmTransfers.has(emailId);
  };

  const addEmail = async (email: Omit<EmailCard, 'id' | 'timestamp'>) => {
    try {
      const { data, error } = await supabase
        .from('emails')
        .insert([
          {
            sender: email.sender,
            content: email.content,
            tag: email.tag
          }
        ])
        .select();
      
      if (error) throw error;
      
      if (data) {
        // Add new email to local state
        const newEmail: EmailCard = {
          id: data[0].id,
          sender: data[0].sender,
          content: data[0].content,
          tag: data[0].tag,
          timestamp: data[0].created_at
        };
        setEmails(prev => [newEmail, ...prev]);
        showNotification('E-posta başarıyla eklendi!', 'success');
      }
    } catch (error) {
      console.error('Error adding email:', error);
      showNotification('E-posta eklenirken bir hata oluştu!', 'error');
    }
  };

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

  const handleDragStart = (e: React.DragEvent, email: EmailCard) => {
    setDraggedEmail(email);
    e.dataTransfer.setData('text/plain', email.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetTag: string) => {
    e.preventDefault();
    if (draggedEmail && draggedEmail.tag !== targetTag) {
      console.log('Dropping email:', draggedEmail.id, 'to', targetTag);
      // Update email tag in Supabase
      await updateEmailTag(draggedEmail.id, targetTag);
    }
    setDraggedEmail(null);
    e.currentTarget.classList.remove('bg-gray-100');
  };

  const handleAction = async (emailId: string, action: string, senderEmail?: string) => {
    console.log(`Action: ${action} for email: ${emailId}`);
    
    // Special handling for "Toplantı Ayarla" action
    if (action === 'Toplantı Ayarla') {
      try {
        const response = await fetch('https://n8n.flownests.org/webhook-test/47106e41-34f6-4518-8273-556b7e10b471', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailId,
            action,
            senderEmail,
            timestamp: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          // Mark meeting as completed
          setCompletedMeetings(prev => new Set(prev).add(emailId));
          showNotification('Toplantı daveti gönderildi!', 'success');
        } else {
          throw new Error('Webhook call failed');
        }
      } catch (error) {
        console.error('Error calling webhook:', error);
        showNotification('Toplantı ayarlanırken bir hata oluştu!', 'error');
      }
    } 
    // Special handling for "Lead Listesinden Çıkar" action
    else if (action === 'Lead Listesinden Çıkar') {
      try {
        const response = await fetch('https://n8n.flownests.org/webhook-test/260f85a2-a478-443d-a8a5-2a5412e138e4', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailId,
            action,
            senderEmail,
            timestamp: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          // Mark lead as removed
          setCompletedMeetings(prev => new Set(prev).add(emailId));
          showNotification('Lead listesinden çıkarıldı!', 'success');
        } else {
          throw new Error('Webhook call failed');
        }
      } catch (error) {
        console.error('Error calling webhook:', error);
        showNotification('Lead çıkarılırken bir hata oluştu!', 'error');
      }
    }
    // Special handling for "Teklif Maili Gönder" action
    else if (action === 'Teklif Maili Gönder') {
      try {
        const response = await fetch('https://n8n.flownests.org/webhook-test/e41fc640-be71-470b-8848-2b9b03cd8f68', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailId,
            action,
            senderEmail,
            timestamp: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          showNotification('Teklif maili gönderildi!', 'success');
        } else {
          throw new Error('Webhook call failed');
        }
      } catch (error) {
        console.error('Error calling webhook:', error);
        showNotification('Teklif maili gönderilirken bir hata oluştu!', 'error');
      }
    }
    // Special handling for "Yanıt Maili Gönder" action
    else if (action === 'Yanıt Maili Gönder') {
      try {
        const response = await fetch('https://n8n.flownests.org/webhook-test/aea5a37f-4c2f-46c0-a8e5-647b707827dc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailId,
            action,
            senderEmail,
            timestamp: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          showNotification('Yanıt maili gönderildi!', 'success');
        } else {
          throw new Error('Webhook call failed');
        }
      } catch (error) {
        console.error('Error calling webhook:', error);
        showNotification('Yanıt maili gönderilirken bir hata oluştu!', 'error');
      }
    }
    // Special handling for "CRM'e Aktar" action
    else if (action === 'CRM\'e Aktar') {
      try {
        // Önce lead zaten CRM'e aktarılmış mı diye kontrol et
        if (isCrmTransferred(emailId)) {
          showNotification('Bu lead zaten CRM\'e aktarılmış!', 'error');
          return;
        }

        // Yükleme durumunu başlat
        setCrmTransferLoading(prev => new Set(prev).add(emailId));
        
        // Önce lead bilgilerini al
        const email = emails.find(e => e.id === emailId);
        if (!email) {
          throw new Error('Email not found');
        }

        // 1. Şirket ekle veya varsa bul
        let companyId = null;
        let companyName = '';
        
        // Email adresinden şirket adı çıkar
        const emailParts = email.sender.split('@');
        if (emailParts.length === 2) {
          const domain = emailParts[1];
          // Domain'den şirket adını çıkar (örn: company.com -> Company)
          companyName = domain.split('.')[0];
          companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
        } else {
          companyName = 'Bilinmeyen Şirket';
        }

        // Önce aynı domain'e sahip bir şirket var mı diye bak
        const { data: existingCompanies, error: companySearchError } = await supabase
          .from('companies')
          .select('id')
          .ilike('domain', email.sender.split('@')[1])
          .limit(1);

        if (companySearchError) {
          console.error('Error searching company:', companySearchError);
        } else if (existingCompanies && existingCompanies.length > 0) {
          // Şirket zaten var
          companyId = existingCompanies[0].id;
        } else {
          // Yeni şirket ekle
          const { data: newCompany, error: companyError } = await supabase
            .from('companies')
            .insert([
              {
                name: companyName,
                domain: email.sender.split('@')[1],
                industry: 'Bilinmeyen',
                location: 'Bilinmeyen'
              }
            ])
            .select()
            .single();

          if (companyError) throw companyError;
          companyId = newCompany.id;
        }

        // 2. Kişi ekle veya varsa bul
        let contactId = null;
        
        // Önce aynı email adresine sahip bir kişi var mı diye bak
        const { data: existingContacts, error: contactSearchError } = await supabase
          .from('contacts')
          .select('id')
          .eq('email', email.sender)
          .limit(1);

        if (contactSearchError) {
          console.error('Error searching contact:', contactSearchError);
        } else if (existingContacts && existingContacts.length > 0) {
          // Kişi zaten var
          contactId = existingContacts[0].id;
        } else {
          // Yeni kişi ekle
          // Email adresinden kişi adını çıkar
          let contactName = email.sender.split('@')[0];
          // Adı daha düzgün hale getir (nokta, tire gibi karakterleri boşlukla değiştir)
          contactName = contactName.replace(/[.\-_]/g, ' ');
          // Kelimelerin ilk harflerini büyük yap
          contactName = contactName.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');

          const { data: newContact, error: contactError } = await supabase
            .from('contacts')
            .insert([
              {
                full_name: contactName,
                email: email.sender,
                company_id: companyId,
                lifecycle_stage: 'lead',
                notes: `Otomatik olarak ${email.tag} kategorisinden CRM'e aktarıldı.`
              }
            ])
            .select()
            .single();

          if (contactError) throw contactError;
          contactId = newContact.id;
        }

        // 3. Fırsat ekle - Önce aynı kişi ve şirket için fırsat olup olmadığını kontrol et
        const { data: existingDeals, error: dealSearchError } = await supabase
          .from('deals')
          .select('id')
          .eq('contact_id', contactId)
          .eq('company_id', companyId)
          .limit(1);

        if (dealSearchError) {
          console.error('Error searching deals:', dealSearchError);
        } else if (existingDeals && existingDeals.length > 0) {
          // Zaten aynı kişi ve şirket için fırsat var
          showNotification('Bu kişi ve şirket için zaten bir fırsat oluşturulmuş!', 'error');
          // CRM aktarımını state'e ekle
          setCrmTransfers(prev => new Set(prev).add(emailId));
          return;
        }

        // Yeni fırsat ekle
        // Önce varsayılan pipeline ID'sini al
        const { data: pipelineData, error: pipelineError } = await supabase
          .from('pipelines')
          .select('id')
          .eq('is_default', true)
          .single();

        if (pipelineError) {
          console.error('Error fetching default pipeline:', pipelineError);
          throw new Error('Default pipeline not found');
        }

        // Pipeline stage ID'sini al (ilk stage)
        const { data: stageData, error: stageError } = await supabase
          .from('pipeline_stages')
          .select('id')
          .eq('pipeline_id', pipelineData?.id)
          .order('order_index', { ascending: true })
          .limit(1)
          .single();

        if (stageError) {
          console.error('Error fetching pipeline stage:', stageError);
          throw new Error('Pipeline stage not found');
        }

        // Fırsat başlığını daha anlamlı hale getir
        const dealTitle = `${email.sender.split('@')[0]} ile görüşme fırsatı`;

        const { data: newDeal, error: dealError } = await supabase
          .from('deals')
          .insert([
            {
              title: dealTitle,
              amount: 0,
              currency: 'USD',
              contact_id: contactId,
              company_id: companyId,
              pipeline_id: pipelineData.id,
              stage_id: stageData.id,
              status: 'open',
              source: 'Email Yanıt Takibi',
              notes: `Otomatik olarak ${email.tag} kategorisinden oluşturuldu.

Email içeriği:
${email.content}`
            }
          ])
          .select()
          .single();

        if (dealError) throw dealError;

        showNotification('Lead başarıyla CRM\'e aktarıldı!', 'success');
        // CRM aktarımını state'e ekle
        setCrmTransfers(prev => new Set(prev).add(emailId));
      } catch (error) {
        console.error('Error transferring to CRM:', error);
        showNotification('CRM\'e aktarılırken bir hata oluştu: ' + (error as Error).message, 'error');
      } finally {
        // Yükleme durumunu kaldır
        setCrmTransferLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(emailId);
          return newSet;
        });
      }
    }
    // Handle tag change actions
    else if (action === 'İlgili Olarak İşaretle') {
      await updateEmailTag(emailId, 'İlgili');
    } else if (action === 'İlgisiz Olarak İşaretle') {
      await updateEmailTag(emailId, 'İlgisiz');
    } else {
      // Here you would integrate with n8n or your backend for other actions
      showNotification(`${action} işlemi başlatıldı!`, 'success');
    }
    
    setSelectedEmail(null);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
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

        {/* Summary Stats - Moved to top */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
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

        {/* Email Cards by Category */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
          {Object.entries(groupedEmails).map(([tag, tagEmails]) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Category Header */}
              <div 
                className="p-6 border-b border-gray-200"
                onDragOver={handleDragOver}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('bg-gray-100');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('bg-gray-100');
                }}
                onDrop={(e) => handleDrop(e, tag)}
              >
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
                      className={`relative bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer ${
                        draggedEmail?.id === email.id ? 'opacity-50' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, email)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedEmail && draggedEmail.id !== email.id) {
                          e.currentTarget.classList.add('border-2', 'border-dashed', 'border-blue-500');
                        }
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('border-2', 'border-dashed', 'border-blue-500');
                      }}
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
                            {getActionButtons(email.tag, email.id).map((action, index) => {
                              const isMeetingCompleted = action.label === 'Toplantı Ayarla' && completedMeetings.has(email.id);
                              const isLeadRemoved = action.label === 'Lead Listesinden Çıkar' && completedMeetings.has(email.id);
                              const isCrmTransferredCheck = action.label === 'CRM\'e Aktar' && isCrmTransferred(email.id);
                              const isCrmLoading = action.label === 'CRM\'e Aktar' && crmTransferLoading.has(email.id);
                              const isCompleted = isMeetingCompleted || isLeadRemoved || isCrmTransferredCheck;
                              
                              return (
                                <motion.button
                                  key={action.label}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction(email.id, action.label, email.sender);
                                  }}
                                  disabled={isCompleted || isCrmLoading}
                                  className={`w-full flex items-center justify-center space-x-2 px-3 py-2 text-white text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isCompleted || isCrmLoading
                                      ? 'bg-gray-300 cursor-not-allowed' 
                                      : action.color
                                  } relative ${
                                    !isCompleted && !isCrmLoading ? 'hover:shadow-md' : ''
                                  }`}
                                  title={isCrmTransferredCheck ? 'Lead zaten CRM\'e aktarıldı' : ''}
                                >
                                  {isCrmLoading ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      <span>Aktarılıyor...</span>
                                    </>
                                  ) : (
                                    <>
                                      {action.icon}
                                      <span>{action.label}</span>
                                      {isCompleted && (
                                        <CheckCircle className="absolute right-3 w-5 h-5 text-green-600" />
                                      )}
                                    </>
                                  )}
                                </motion.button>
                              );
                            })}
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
      )}
      </div>
    </div>
  );
}