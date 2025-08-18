import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Globe, Plus, Filter, Eye, MoreHorizontal, FileText } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Lead {
  id: string;
  name: string | null;
  company: string | null;
  title: string | null;
  email: string | null;
  source: 'apollo' | 'google_maps' | 'apify' | 'manual';
  status: 'new' | 'verified' | 'skipped';
  created_at: string;
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'John Smith',
    company: 'TechCorp Inc.',
    title: 'VP of Sales',
    email: 'john@techcorp.com',
    source: 'apollo',
    status: 'new',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    company: 'Innovate Solutions',
    title: 'Marketing Director',
    email: 'sarah@innovate.io',
    source: 'google_maps',
    status: 'verified',
    created_at: '2024-01-15T11:45:00Z'
  },
  {
    id: '3',
    name: 'Mike Chen',
    company: 'Startup Co.',
    title: 'Founder',
    email: 'mike@startup.co',
    source: 'apollo',
    status: 'new',
    created_at: '2024-01-15T14:20:00Z'
  }
];

// Refresh icon component
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
);

export function Leads() {
  const [leads, setLeads] = useLocalStorage<Lead[]>('leads', []);
  const [searchResults, setSearchResults] = useState<Lead[]>(mockLeads);
  const [selectedProvider, setSelectedProvider] = useState<'apollo' | 'google_maps' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'verified' | 'skipped'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleFormIconClick = () => {
    if (!selectedProvider) return;
    
    const formUrls = {
      google_maps: 'https://n8n.flownests.org/form/ad6f764b-f143-473b-b568-ab33b97bed27',
      apollo: 'https://n8n.flownests.org/form/d941c9da-7759-4603-a9f7-283fa3d2fa90'
    };
    
    const url = formUrls[selectedProvider];
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleWebhookClick = () => {
    if (!selectedProvider) return;
    
    const webhookUrls = {
      google_maps: 'https://n8n.flownests.org/webhook/google-maps-leads',
      apollo: 'https://n8n.flownests.org/webhook/apollo-leads'
    };
    
    const url = webhookUrls[selectedProvider];
    if (url) {
      navigator.clipboard.writeText(url);
      alert(`${selectedProvider.replace('_', ' ')} webhook URL copied to clipboard!`);
    }
  };

  const handleRefreshWebhook = async () => {
    setIsRefreshing(true);
    
    try {
      const response = await fetch('https://n8n.flownests.org/webhook-test/e51a1c60-517e-4473-a70b-ef289cda37b5', {
        method: 'GET',
      });
      
      if (response.ok) {
        // Mock data for demonstration
        const newResults = mockLeads.map(lead => ({
          ...lead,
          id: Date.now().toString() + Math.random(),
          source: 'webhook',
          status: 'new' as const,
          created_at: new Date().toISOString()
        }));
        
        setSearchResults(newResults);
        console.log('Refresh webhook executed successfully');
      } else {
        console.error('Refresh webhook failed:', response.status);
      }
    } catch (error) {
      console.error('Refresh webhook error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedProvider) return;

    setIsSearching(true);
    
    // Google Maps webhook integration
    if (selectedProvider === 'google_maps') {
      try {
        const response = await fetch('https://n8n.flownests.org/webhook-test/c57b89db-80ac-4908-8f2c-4d710690901b', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: searchQuery,
            source: 'google_maps',
            timestamp: new Date().toISOString()
          }),
        });
        
        if (response.ok) {
          console.log('Webhook sent successfully');
        } else {
          console.error('Webhook failed:', response.status);
        }
      } catch (error) {
        console.error('Webhook error:', error);
      }
    }
    
    // Simulate API call for other providers
    setTimeout(() => {
      const newResults = mockLeads.map(lead => ({
        ...lead,
        id: Date.now().toString() + Math.random(),
        source: selectedProvider,
        status: 'new' as const,
        created_at: new Date().toISOString()
      }));
      
      setSearchResults(newResults);
      setIsSearching(false);
    }, 2000);
  };

  const addToLeads = (lead: Lead) => {
    const updatedLead = { ...lead, status: 'verified' as const };
    setLeads(prev => [...prev, updatedLead]);
    setSearchResults(prev => 
      prev.map(l => l.id === lead.id ? updatedLead : l)
    );
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'apollo': return <Search className="w-4 h-4" />;
      case 'google_maps': return <MapPin className="w-4 h-4" />;
      case 'apify': return <Globe className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'apollo': return 'bg-blue-100 text-blue-800';
      case 'google_maps': return 'bg-green-100 text-green-800';
      case 'apify': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'skipped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResults = searchResults.filter(lead => {
    if (statusFilter === 'all') return true;
    return lead.status === statusFilter;
  });

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4"
          >
            <Search className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            Lead Finding
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            Discover potential customers with Apollo and Google Maps
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Search for Leads</h2>
            
            {/* Provider Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Choose Search Provider</label>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedProvider('apollo')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedProvider === 'apollo'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="font-semibold">Apollo</div>
                  <div className="text-sm text-gray-600">B2B Database</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedProvider('google_maps')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedProvider === 'google_maps'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="font-semibold">Google Maps</div>
                  <div className="text-sm text-gray-600">Local Businesses</div>
                </motion.button>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedProvider === 'google_maps' ? 'Message for Webhook' : 'Search Query'}
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    selectedProvider === 'apollo' 
                      ? 'e.g., SaaS companies in San Francisco' 
                      : selectedProvider === 'google_maps'
                        ? 'Enter message to send via webhook'
                        : 'Enter search query'
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFormIconClick}
                  disabled={!selectedProvider}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Open form for selected provider"
                >
                  <FileText className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearch}
                  disabled={!selectedProvider || !searchQuery.trim() || isSearching}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Searching...' : selectedProvider === 'google_maps' ? 'Send Message' : 'Search'}
                </motion.button>
              </div>
            </div>

            {/* Quick Presets */}
            {selectedProvider !== 'google_maps' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider === 'apollo' ? (
                    <>
                      <button
                        onClick={() => setSearchQuery('SaaS companies 50-200 employees')}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        SaaS Companies
                      </button>
                      <button
                        onClick={() => setSearchQuery('Marketing agencies in California')}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        Marketing Agencies
                      </button>
                      <button
                        onClick={() => setSearchQuery('E-commerce startups')}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        E-commerce
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setSearchQuery('restaurants in Manhattan')}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                      >
                        Restaurants
                      </button>
                      <button
                        onClick={() => setSearchQuery('gyms in Los Angeles')}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                      >
                        Gyms
                      </button>
                      <button
                        onClick={() => setSearchQuery('coffee shops in Seattle')}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                      >
                        Coffee Shops
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Search History */}
            {selectedProvider !== 'google_maps' && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h3>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">• SaaS companies in San Francisco</div>
                  <div className="text-sm text-gray-600">• Marketing agencies 10-50 employees</div>
                  <div className="text-sm text-gray-600">• E-commerce startups</div>
                </div>
              </div>
            )}
          </div>

          {/* Results Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            {/* Results Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Search Results</h2>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefreshWebhook}
                    className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm hover:shadow-lg transition-shadow"
                  >
                    <RefreshIcon className="w-4 h-4 mr-1" />
                    Refresh
                  </motion.button>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-1 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="verified">Verified</option>
                    <option value="skipped">Skipped</option>
                  </select>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {filteredResults.length > 0 && (
                <div className="text-sm text-gray-600">
                  {filteredResults.length} results found
                </div>
              )}
            </div>

            {/* Results Content */}
            <div className="p-6">
              {isSearching ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <div className="text-gray-600">
                    {selectedProvider === 'google_maps' ? 'Sending message...' : 'Searching for leads...'}
                  </div>
                </div>
              ) : selectedProvider === 'google_maps' ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Message Sent Successfully</h3>
                  <p className="text-gray-600">Your message has been sent via webhook to n8n.</p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results yet</h3>
                  <p className="text-gray-600">Run a search to find potential leads.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredResults.map((lead, index) => (
                        <motion.tr
                          key={lead.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {lead.name || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.company || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.title || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.email || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getSourceColor(lead.source)}`}>
                              {getSourceIcon(lead.source)}
                              <span className="ml-1 capitalize">{lead.source.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              {lead.status === 'new' && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => addToLeads(lead)}
                                  className="flex items-center px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs hover:shadow-lg transition-shadow"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add to Leads
                                </motion.button>
                              )}
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Added Leads Summary */}
        {leads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  {leads.length} leads added to your campaign
                </h3>
                <p className="text-sm text-green-700">
                  These leads are now available in your Campaigns section.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}