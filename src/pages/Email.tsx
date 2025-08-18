import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Settings, Shield, Zap, Plus, ChevronDown, Upload, Sparkles, Edit3, Save, FileText, RefreshCw } from 'lucide-react';

interface EmailAccount {
  id: string;
  email: string;
  emailsSent: number;
  warmupEmails: number;
  healthScore: number;
  status: 'active' | 'warming' | 'paused';
  dailyLimit: number;
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

export function Email() {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>(mockEmailAccounts);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('demo');
  const [editContent, setEditContent] = useState(eventContents[selectedEvent]);
  const [isContentModified, setIsContentModified] = useState(false);
  
  // Kendini Tanıt form states
  const [isIntroductionMode, setIsIntroductionMode] = useState(false);
  const [introName, setIntroName] = useState('');
  const [introCompany, setIntroCompany] = useState('');
  const [isIntroModified, setIsIntroModified] = useState(false);

  // Webhook state
  const [dailyLimit, setDailyLimit] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'warming': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleEventChange = (event: string) => {
    setSelectedEvent(event);
    setEditContent(eventContents[event]);
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
  };

  const handleEventModeClick = () => {
    setIsIntroductionMode(false);
    setSelectedEvent('demo');
    setEditContent(eventContents['demo']);
  };

  const handleIntroNameChange = (value: string) => {
    setIntroName(value);
    setIsIntroModified(true);
  };

  const handleIntroCompanyChange = (value: string) => {
    setIntroCompany(value);
    setIsIntroModified(true);
  };

  const handleSaveIntroduction = () => {
    console.log('Saving introduction:', { name: introName, company: introCompany });
    setIsIntroModified(false);
  };

  const fetchEmailAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://n8n.flownests.org/webhook/c2a80579-f1eb-43dc-a996-068affa17420');
      const data = await response.json();
      
      console.log('Webhook data:', data); // Gelen verileri console'a yazdır
      
      // Gelen verileri filtrele ve EmailAccount formatına dönüştür
      let fetchedDailyLimit = dailyLimit; // Varsayılan değer
      
      // Tüm data array'inde daily_limit değerini ara
      for (const item of data) {
        if (item.daily_limit) {
          fetchedDailyLimit = item.daily_limit;
          setDailyLimit(fetchedDailyLimit); // Global state'i güncelle
          break; // İlk bulunan değeri kullan
        }
      }
      
      const accounts: EmailAccount[] = data.map((item: any, index: number) => ({
        id: `${index + 1}`, // Basit bir ID oluşturma
        email: item.email,
        emailsSent: 0, // Bu veriler webhook'tan gelmiyor, varsayılan değer
        warmupEmails: 0, // Bu veriler webhook'tan gelmiyor, varsayılan değer
        healthScore: parseInt(item.start_warmup_score) || 0, // Sayıya çevir
        status: item.warmup_status === 1 ? 'active' : 'paused',
        dailyLimit: parseInt(item.daily_limit) || fetchedDailyLimit // Sayıya çevir veya global değeri kullan
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
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            Email Hesabı
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            E-posta hesaplarınızı yönetin ve kampanyalarınızı optimize edin
          </motion.p>
        </div>

        {/* Customer Meeting Settings Panel - Improved Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden"
        >
          <div className={`flex ${!isSettingsOpen ? 'h-[76px]' : ''}`}>
            {/* Left Side - Settings Panel (Half Width) */}
            <div className="w-1/2 border-r border-gray-200">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-full p-6 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Customer Meeting Settings</h2>
                </div>
                <motion.div
                  animate={{ rotate: isSettingsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4"
                >
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-6 space-y-6">
                      {/* Event Type Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content Type
                        </label>
                        <div className="space-y-3">
                          <button
                            onClick={handleEventModeClick}
                            className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                              !isIntroductionMode 
                                ? 'border-blue-500 bg-blue-50 text-blue-900' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium">Event Content</div>
                            <div className="text-sm text-gray-600">Demo, E-book, Loom, etc.</div>
                          </button>
                          
                          <button
                            onClick={handleIntroductionClick}
                            className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                              isIntroductionMode 
                                ? 'border-blue-500 bg-blue-50 text-blue-900' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium">Kendini Tanıt</div>
                            <div className="text-sm text-gray-600">Kişisel ve şirket bilgileri</div>
                          </button>
                        </div>
                      </div>

                      {/* Event Dropdown - Only show when not in introduction mode */}
                      {!isIntroductionMode && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Event Type
                          </label>
                          <select
                            value={selectedEvent}
                            onChange={(e) => handleEventChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                          <label className="block text-sm font-medium text-gray-700 mb-3">
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
                              Create with AI
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
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Edit3 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {isIntroductionMode ? 'Introduction Editor' : 'Content Editor'}
                            </h3>
                            <p className="text-sm text-gray-600 capitalize">
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
                                className="block text-sm font-medium text-gray-700 mb-2"
                                title="Emailler kimin adına gönderilsin"
                              >
                                İsim
                              </label>
                              <input
                                type="text"
                                value={introName}
                                onChange={(e) => handleIntroNameChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Adınızı girin..."
                              />
                            </div>
                            
                            <div>
                              <label 
                                className="block text-sm font-medium text-gray-700 mb-2"
                                title="Şirketiniz ve sunduğunuz hizmet hakkında bilgi verin"
                              >
                                İşletmeni Tanıt
                              </label>
                              <textarea
                                value={introCompany}
                                onChange={(e) => handleIntroCompanyChange(e.target.value)}
                                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                placeholder="Şirketiniz ve hizmetleriniz hakkında bilgi girin..."
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              {introName.length + introCompany.length} characters
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleSaveIntroduction}
                              disabled={!isIntroModified}
                              className={`flex items-center px-6 py-2 rounded-lg font-medium transition-all ${
                                isIntroModified
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
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
                              className="w-full h-48 p-4 border-2 border-dashed border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none bg-gray-50 hover:bg-white"
                              placeholder="Enter your content here..."
                            />
                            <div className="absolute top-3 right-3">
                              <FileText className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              {editContent.length} characters
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleSaveContent}
                              disabled={!isContentModified}
                              className={`flex items-center px-6 py-2 rounded-lg font-medium transition-all ${
                                isContentModified
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
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
                <div className="h-full flex items-center justify-center p-6 text-gray-400">
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
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Table Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Email Accounts</h2>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchEmailAccounts}
                disabled={isLoading}
                className="flex items-center justify-center p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
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
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Daily Limit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emailAccounts.map((account, index) => (
                  <motion.tr
                    key={account.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600 mb-2" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {emailAccounts.filter(acc => acc.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Accounts</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-blue-600 mb-2" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {emailAccounts.length}
            </div>
            <div className="text-sm text-gray-600">Total Accounts</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-purple-600 mb-2" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {emailAccounts.length > 0 ? Math.round(emailAccounts.reduce((sum, acc) => sum + acc.healthScore, 0) / emailAccounts.length) : 0}%
            </div>
            <div className="text-sm text-gray-600">Average Health Score</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}