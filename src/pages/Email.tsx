import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Settings, Shield, Zap, Plus, ChevronDown, Upload, Sparkles } from 'lucide-react';

interface EmailAccount {
  id: string;
  email: string;
  emailsSent: number;
  warmupEmails: number;
  healthScore: number;
  status: 'active' | 'warming' | 'paused';
}

const mockEmailAccounts: EmailAccount[] = [
  {
    id: '1',
    email: 'john@company.com',
    emailsSent: 1250,
    warmupEmails: 45,
    healthScore: 92,
    status: 'active'
  },
  {
    id: '2',
    email: 'sarah@business.io',
    emailsSent: 890,
    warmupEmails: 32,
    healthScore: 87,
    status: 'warming'
  },
  {
    id: '3',
    email: 'mike@startup.co',
    emailsSent: 567,
    warmupEmails: 28,
    healthScore: 95,
    status: 'active'
  }
];

export function Email() {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>(mockEmailAccounts);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('demo');

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

        {/* Customer Meeting Settings Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden"
        >
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Customer Meeting Settings</h2>
            </div>
            <motion.div
              animate={{ rotate: isSettingsOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
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
                  {/* Event Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type
                    </label>
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="e-book">E-book</option>
                      <option value="demo">Demo</option>
                      <option value="loom">Loom</option>
                      <option value="proposal">Proposal</option>
                      <option value="report">Report</option>
                    </select>
                  </div>

                  {/* Import Section */}
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </motion.button>
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
                    Emails Sent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warmup Emails
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                      <div className="text-sm font-semibold text-gray-900">
                        {account.emailsSent.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {account.warmupEmails}
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
              {emailAccounts.reduce((sum, acc) => sum + acc.emailsSent, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Emails Sent</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-purple-600 mb-2" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(emailAccounts.reduce((sum, acc) => sum + acc.healthScore, 0) / emailAccounts.length)}%
            </div>
            <div className="text-sm text-gray-600">Average Health Score</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}