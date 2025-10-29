import React, { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Settings, Shield, Zap, Plus, ChevronDown, Upload, Sparkles, Edit3, Save, FileText, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface EmailAccount {
  id: string;
  email: string;
  emailsSent: number;
  warmupEmails: number;
  healthScore: number;
  status: 'active' | 'warming' | 'paused';
  dailyLimit: number;
}

// Supabase company_info tablosu için interface
interface CompanyInfo {
  id: number;
  company: string;
  name: string;
  info: string;
  event: string;
  event_type: string;
  created_at: string;
}

const mockEmailAccounts: EmailAccount[] = [];

// Mock content for different event types
const eventContents = {
  'demo': 'Join us for an exclusive product demonstration where we\'ll showcase the latest features and capabilities of our platform. This interactive session will give you hands-on experience with our tools.',
  'e-book': 'Download our comprehensive guide that covers industry best practices, expert insights, and actionable strategies to help you succeed in your business endeavors.',
  'loom': 'Watch our detailed video walkthrough that explains step-by-step processes and provides visual demonstrations of key concepts and workflows.',
  'proposal': 'Our tailored business proposal outlines strategic solutions designed specifically for your organization\'s needs and objectives.',
  'report': 'Access our latest industry report featuring market analysis, trends, and data-driven insights that will inform your business decisions.'
};

// Event type labels
const eventLabels = {
  'demo': 'Demo',
  'e-book': 'E-book',
  'loom': 'Loom',
  'proposal': 'Proposal',
  'report': 'Report'
};

export function Email() {
  const { language } = useLanguage();
  const { currentOrganization } = useOrganization();
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>(mockEmailAccounts);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('demo');
  const [editContent, setEditContent] = useState(eventContents[selectedEvent]);
  const [isContentModified, setIsContentModified] = useState(false);
  
  // Kendini Tanıt form states
  const [isIntroductionMode, setIsIntroductionMode] = useState(false);
  const [introName, setIntroName] = useState('');
  const [introCompanyName, setIntroCompanyName] = useState(''); // Yeni state için şirket adı
  const [introCompany, setIntroCompany] = useState('');
  const [isIntroModified, setIsIntroModified] = useState(false);

  // Event Content states
  const [eventContent, setEventContent] = useState('');
  const [isEventModified, setIsEventModified] = useState(false);

  // Webhook state
  const [dailyLimit, setDailyLimit] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'warming': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'paused': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleEventChange = async (event: string) => {
    setSelectedEvent(event);
    
    // Önce Supabase'ten bu event için kaydedilmiş içeriği çekmeyi dene
    try {
      const { data, error } = await supabase
        .from('company_info')
        .select('event, event_type')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      // Eğer Supabase'te veri varsa ve bu event için içerik kaydedilmişse, onu kullan
      if (data && data.length > 0 && data[0].event_type === event) {
        setEditContent(data[0].event || '');
        setIsContentModified(false);
        return;
      }
    } catch (error) {
      console.error('Error fetching event content from Supabase:', error);
    }
    
    // Supabase'te veri yoksa veya hata oluştuysa, webhook'tan veri çek
    try {
      const response = await fetch(`https://n8n.flownests.org/webhook/e9756c48-e3b4-4c59-ad5f-5afaad1b49e8?eventType=${event}`);
      const data = await response.json();
      
      if (data.content) {
        setEditContent(data.content);
      } else {
        // Eğer bu event için kaydedilmiş bir içerik yoksa, varsayılan içeriği kullan
        setEditContent(eventContents[event] || '');
      }
    } catch (error) {
      console.error('Error fetching event content:', error);
      // Hata durumunda varsayılan içeriği kullan
      setEditContent(eventContents[event] || '');
    }
    
    setIsContentModified(false);
  };

  const handleContentChange = (content: string) => {
    setEditContent(content);
    setIsContentModified(content !== eventContents[selectedEvent]);
  };

  const handleSaveContent = () => {
    // Here you would typically save to a backend
    console.log('Saving content for', selectedEvent, ':', editContent);
    setIsContentModified(false);
    // You could also update the eventContents object if needed
  };

  const handleIntroductionClick = () => {
    setIsIntroductionMode(true);
    setSelectedEvent('introduction');
    fetchIntroductionData(); // Verileri tekrar çek
  };

  const handleEventModeClick = () => {
    setIsIntroductionMode(false);
    setSelectedEvent('demo');
    setEditContent(eventContents['demo']);
    fetchEventContentData(); // Verileri tekrar çek
  };

    const handleSaveIntroduction = () => {
    console.log('Saving introduction:', { name: introName, companyName: introCompanyName, company: introCompany });
    setIsIntroModified(false);
  };

  const handleIntroNameChange = (value: string) => {
    setIntroName(value);
    setIsIntroModified(true);
  };

  const handleIntroCompanyNameChange = (value: string) => {
    setIntroCompanyName(value);
    setIsIntroModified(true);
  };

  const handleIntroCompanyChange = (value: string) => {
    setIntroCompany(value);
    setIsIntroModified(true);
  };

  // Yeni eklenen fonksiyonlar
  const fetchIntroductionData = async () => {
    try {
      // Önce Supabase'ten veri çekmeyi dene
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      // Eğer Supabase'te veri varsa, onu kullan
      if (data && data.length > 0) {
        const companyInfo = data[0];
        setIntroName(companyInfo.name || '');
        setIntroCompanyName(companyInfo.company || '');
        setIntroCompany(companyInfo.info || '');
        return;
      }
      
      // Supabase'te veri yoksa, webhook'tan veri çek
      const response = await fetch('https://n8n.flownests.org/webhook/c9deff5f-039f-4fb0-8a84-1868063e9e65');
      const webhookData = await response.json();
      
      // Gelen verileri state'lere ata
      if (webhookData.name) setIntroName(webhookData.name);
      if (webhookData.companyName) setIntroCompanyName(webhookData.companyName);
      if (webhookData.company) setIntroCompany(webhookData.company);
    } catch (error) {
      console.error('Error fetching introduction data:', error);
    }
  };

  const fetchEventContentData = async () => {
    try {
      // Önce Supabase'ten veri çekmeyi dene
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      // Eğer Supabase'te veri varsa, onu kullan
      if (data && data.length > 0) {
        const companyInfo = data[0];
        setEventContent(companyInfo.event || '');
        setEditContent(companyInfo.event || '');
        // Event tipini de ayarla (eğer varsa)
        if (companyInfo.event_type) {
          setSelectedEvent(companyInfo.event_type);
        } else if (companyInfo.event) {
          // Eski veriler için backward compatibility
          setSelectedEvent(companyInfo.event);
        }
        return;
      }
      
      // Supabase'te veri yoksa, webhook'tan veri çek
      const response = await fetch('https://n8n.flownests.org/webhook/e9756c48-e3b4-4c59-ad5f-5afaad1b49e8');
      const webhookData = await response.json();
      
      // Gelen verileri state'e ata
      if (webhookData.content) {
        setEventContent(webhookData.content);
        setEditContent(webhookData.content); // Event content'ini de editContent state'ine ata
      }
      
      // Event tipini de ayarla
      if (webhookData.eventType) {
        setSelectedEvent(webhookData.eventType);
      }
    } catch (error) {
      console.error('Error fetching event content data:', error);
    }
  };

  const saveIntroductionToSupabase = async () => {
    try {
      // Önce mevcut veri olup olmadığını kontrol et
      const { data: existingData, error: fetchError } = await supabase
        .from('company_info')
        .select('*')
        .limit(1);
      
      if (fetchError) {
        throw fetchError;
      }
      
      const companyInfo = {
        name: introName,
        company: introCompanyName,
        info: introCompany,
        // Event content'ini de kaydet
        event: editContent,
        // Mevcut event_type değerini koru
        event_type: existingData && existingData.length > 0 ? existingData[0].event_type : ''
      };
      
      let result;
      if (existingData && existingData.length > 0) {
        // Veri varsa güncelle
        const id = existingData[0].id;
        result = await supabase
          .from('company_info')
          .update(companyInfo)
          .eq('id', id);
      } else {
        // Veri yoksa yeni oluştur
        result = await supabase
          .from('company_info')
          .insert([companyInfo]);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      console.log('Introduction data saved successfully to Supabase');
      setIsIntroModified(false);
    } catch (error) {
      console.error('Error saving introduction data to Supabase:', error);
      // Fallback olarak webhook'a gönder
      saveIntroductionToWebhook();
    }
  };

  const saveEventContentToSupabase = async () => {
    try {
      // Önce mevcut veri olup olmadığını kontrol et
      const { data: existingData, error: fetchError } = await supabase
        .from('company_info')
        .select('*')
        .limit(1);
      
      if (fetchError) {
        throw fetchError;
      }
      
      const companyInfo = {
        // Mevcut verileri koru
        name: existingData && existingData.length > 0 ? existingData[0].name : '',
        company: existingData && existingData.length > 0 ? existingData[0].company : '',
        info: existingData && existingData.length > 0 ? existingData[0].info : '',
        // Event content'ini güncelle
        event: editContent,
        // Event type'ı güncelle
        event_type: selectedEvent
      };
      
      let result;
      if (existingData && existingData.length > 0) {
        // Veri varsa güncelle
        const id = existingData[0].id;
        result = await supabase
          .from('company_info')
          .update(companyInfo)
          .eq('id', id);
      } else {
        // Veri yoksa yeni oluştur
        result = await supabase
          .from('company_info')
          .insert([companyInfo]);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      console.log('Event content data saved successfully to Supabase');
      setIsContentModified(false);
    } catch (error) {
      console.error('Error saving event content data to Supabase:', error);
      // Fallback olarak webhook'a gönder
      saveEventContentToWebhook();
    }
  };

  // Fallback webhook fonksiyonları
  const saveIntroductionToWebhook = async () => {
    try {
      const response = await fetch('https://n8n.flownests.org/webhook/c9deff5f-039f-4fb0-8a84-1868063e9e65', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organization-ID': currentOrganization?.id || 'default-org'
        },
        body: JSON.stringify({
          name: introName,
          companyName: introCompanyName,
          company: introCompany
        }),
      });
      
      if (response.ok) {
        console.log('Introduction data saved successfully to webhook');
        setIsIntroModified(false);
      } else {
        console.error('Failed to save introduction data to webhook');
      }
    } catch (error) {
      console.error('Error saving introduction data to webhook:', error);
    }
  };

  const saveEventContentToWebhook = async () => {
    try {
      const response = await fetch('https://n8n.flownests.org/webhook/e9756c48-e3b4-4c59-ad5f-5afaad1b49e8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organization-ID': currentOrganization?.id || 'default-org'
        },
        body: JSON.stringify({
          content: editContent,
          eventType: selectedEvent
        }),
      });
      
      if (response.ok) {
        console.log('Event content data saved successfully to webhook');
        setIsContentModified(false);
      } else {
        console.error('Failed to save event content data to webhook');
      }
    } catch (error) {
      console.error('Error saving event content data to webhook:', error);
    }
  };

    const fetchEmailAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://n8n.flownests.org/webhook/c2a80579-f1eb-43dc-a996-068affa17420');
      const rawData = await response.json();
      
      console.log('Raw webhook data:', rawData); // Gelen ham verileri console'a yazdır
      
      // n8n'den gelen veriler doğru formatta değil, doğru formata getirmemiz gerekiyor
      // Verinin "items" array'inde olduğunu varsayalım
      let data = [];
      if (rawData && Array.isArray(rawData) && rawData.length > 0) {
        // Eğer rawData doğrudan array ise ve içinde items varsa
        if (rawData[0].items) {
          data = rawData[0].items;
        } else {
          // Eğer rawData doğrudan items array'ini içeriyorsa
          data = rawData;
        }
      }
      
      console.log('Processed data:', data); // İşlenmiş verileri console'a yazdır
      
      // Gelen verileri filtrele ve EmailAccount formatına dönüştür
      let fetchedDailyLimit = dailyLimit; // Varsayılan değer
      
      // Tüm data array'inde daily_limit değerini ara
      for (const item of data) {
        if (item.warmup && item.warmup.limit) {
          fetchedDailyLimit = item.warmup.limit;
          setDailyLimit(fetchedDailyLimit); // Global state'i güncelle
          break; // İlk bulunan değeri kullan
        }
      }
      
      const accounts: EmailAccount[] = data.map((item: any, index: number) => ({
        id: `${index + 1}`, // Basit bir ID oluşturma
        email: item.email,
        emailsSent: 0, // Bu veriler webhook'tan gelmiyor, varsayılan değer
        warmupEmails: 0, // Bu veriler webhook'tan gelmiyor, varsayılan değer
        healthScore: parseInt(item.stat_warmup_score) || 0, // Sayıya çevir
        status: item.warmup_status === 1 ? 'active' : 'paused',
        dailyLimit: parseInt(item.warmup && item.warmup.limit ? item.warmup.limit : fetchedDailyLimit) // Sayıya çevir veya global değeri kullan
      }));
      
      console.log('Processed accounts:', accounts); // İşlenmiş hesapları console'a yazdır
      setEmailAccounts(accounts);
    } catch (error) {
      console.error('Error fetching email accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Bileşen yüklendiğinde verileri al
  useEffect(() => {
    fetchEmailAccounts();
    fetchIntroductionData();
    fetchEventContentData();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4"
          >
            <Mail className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Email Hesabı
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300 text-lg"
          >
            E-posta hesaplarınızı yönetin ve kampanyalarınızı optimize edin
          </motion.p>
        </div>

        {/* Customer Meeting Settings Panel - Improved Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden"
        >
          <div className={`flex ${!isSettingsOpen ? 'h-[76px]' : ''}`}>
            {/* Left Side - Settings Panel (Half Width) */}
            <div className="w-1/2 border-r border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-full p-6 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{language === 'tr' ? 'Müşteri Toplantısı Ayarları' : 'Customer Meeting Settings'}</h2>
                </div>
                <motion.div
                  animate={{ rotate: isSettingsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4"
                >
                  <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6 space-y-6">
                      {/* Event Type Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Content Type
                        </label>
                        <div className="space-y-3">
                          <button
                            onClick={handleEventModeClick}
                            className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                              !isIntroductionMode 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                            }`}
                          >
                            <div className="font-medium text-gray-900 dark:text-white">Event Content</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Demo, E-book, Loom, etc.</div>
                          </button>
                          
                          <button
                            onClick={handleIntroductionClick}
                            className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                              isIntroductionMode 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                            }`}
                          >
                            <div className="font-medium text-gray-900 dark:text-white">Kendini Tanıt</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Kişisel ve şirket bilgileri</div>
                          </button>
                        </div>
                      </div>

                      {/* Event Dropdown - Only show when not in introduction mode */}
                      {!isIntroductionMode && (
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            {language === 'tr' ? 'Etkinlik Türü' : 'Event Type'}
                          </label>
                          <select
                            value={selectedEvent}
                            onChange={(e) => {
                              setSelectedEvent(e.target.value);
                              // Eğer bu event için önceden kaydedilmiş bir içerik varsa, onu yükle
                              if (eventContents[e.target.value]) {
                                setEditContent(eventContents[e.target.value]);
                              }
                            }}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="e-book">E-book</option>
                            <option value="demo">Demo</option>
                            <option value="loom">Loom</option>
                            <option value="proposal">Proposal</option>
                            <option value="report">Report</option>
                          </select>
                        </div>
                      )}

                      {/* Import Section - Only show when not in introduction mode */}
                      {!isIntroductionMode && (
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Import Options
                          </label>
                          <div className="flex space-x-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Import
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                            >
                              <Sparkles className="w-4 h-4 mr-2" />
                              {language === 'tr' ? 'AI ile Oluştur' : 'Create with AI'}
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side - Content Editor (Half Width) */}
            <div className="w-1/2">
              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {/* Content Editor Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Edit3 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {isIntroductionMode ? 'Introduction Editor' : 'Content Editor'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              Editing: {isIntroductionMode ? 'Kendini Tanıt' : selectedEvent}
                            </p>
                          </div>
                        </div>
                        {((isIntroductionMode && isIntroModified) || (!isIntroductionMode && isContentModified)) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-orange-500 rounded-full"
                          />
                        )}
                      </div>
                    </div>

                    {/* Content Editor Body */}
                    <div className="p-6 space-y-4">
                      {isIntroductionMode ? (
                        // Introduction Form
                        <>
                          <div className="space-y-4">
                            <div>
                              <label 
                                className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                                title={language === 'tr' ? 'Emailler kimin adina gonderilsin' : 'Who should emails be sent from'}
                              >
                                {language === 'tr' ? 'Isim' : 'Name'}
                              </label>
                              <input
                                type="text"
                                value={introName}
                                onChange={(e) => handleIntroNameChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder={language === 'tr' ? 'Adinizi girin...' : 'Enter your name...'}
                              />
                            </div>
                            
                            <div>
                              <label 
                                className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                                title={language === 'tr' ? 'Sirketinizin adi' : 'Your company name'}
                              >
                                {language === 'tr' ? 'Sirket Adi' : 'Company Name'}
                              </label>
                              <input
                                type="text"
                                value={introCompanyName}
                                onChange={(e) => handleIntroCompanyNameChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder={language === 'tr' ? 'Sirket adinizi girin...' : 'Enter your company name...'}
                              />
                            </div>
                            
                            <div>
                              <label 
                                className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                                title="Şirketiniz ve sunduğunuz hizmet hakkında bilgi verin"
                              >
                                İşletmeni Tanıt
                              </label>
                              <textarea
                                value={introCompany}
                                onChange={(e) => handleIntroCompanyChange(e.target.value)}
                                className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                placeholder={language === 'tr' ? 'Sirketiniz ve hizmetleriniz hakkinda bilgi girin...' : 'Enter information about your company and services...'}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {introName.length + introCompanyName.length + introCompany.length} {language === 'tr' ? 'karakter' : 'characters'}
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={saveIntroductionToSupabase}
                              disabled={!isIntroModified}
                              className={`flex items-center px-6 py-2 rounded-lg font-medium transition-all ${
                                isIntroModified
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </motion.button>
                          </div>

                          {isIntroModified && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-orange-50 border border-orange-200 rounded-lg p-3"
                            >
                              <p className="text-sm text-orange-800">
                                You have unsaved changes. Don't forget to save!
                              </p>
                            </motion.div>
                          )}
                        </>
                      ) : (
                        // Regular Content Editor
                        <>
                          <div className="relative">
                            <textarea
                              value={editContent}
                              onChange={(e) => handleContentChange(e.target.value)}
                              className="w-full h-48 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all resize-none bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Enter your content here..."
                            />
                            <div className="absolute top-3 right-3">
                              <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {editContent.length} {language === 'tr' ? 'karakter' : 'characters'}
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={saveEventContentToSupabase}
                              disabled={!isContentModified}
                              className={`flex items-center px-6 py-2 rounded-lg font-medium transition-all ${
                                isContentModified
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </motion.button>
                          </div>

                          {isContentModified && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-orange-50 border border-orange-200 rounded-lg p-3"
                            >
                              <p className="text-sm text-orange-800">
                                You have unsaved changes. Don't forget to save!
                              </p>
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Placeholder when settings are closed */}
              {!isSettingsOpen && (
                <div className="h-full flex items-center justify-center p-6 text-gray-400 dark:text-gray-500">
                  <div className="text-center">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Open settings to edit content</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Email Accounts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Table Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email Accounts</h2>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchEmailAccounts}
                disabled={isLoading}
                className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-600 dark:border-gray-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </motion.button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Health Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Daily Limit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {emailAccounts.map((account, index) => (
                  <motion.tr
                      key={account.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {account.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${getHealthScoreColor(account.healthScore)}`}>
                        {account.healthScore}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(account.status)}`}>
                        {account.status === 'active' ? 'Active' : 
                         account.status === 'warming' ? 'Warming' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {account.dailyLimit}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"
        >
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600 mb-2" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {emailAccounts.filter(acc => acc.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Accounts</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-blue-600 mb-2" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {emailAccounts.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Accounts</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-purple-600 mb-2" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {emailAccounts.length > 0 ? Math.round(emailAccounts.reduce((sum, acc) => sum + acc.healthScore, 0) / emailAccounts.length) : 0}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Average Health Score</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}