import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Globe, Plus, Filter, Eye, MoreHorizontal, FileText, Trash2, Edit3, Check, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Lead as LeadType } from '../types';

const mockLeads: LeadType[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@techcorp.com',
    linkedin: 'John Smith',
    linkedinURL: 'https://linkedin.com/in/johnsmith',
    jobTitle: 'VP of Sales',
    companyName: 'TechCorp Inc.',
    location: 'San Francisco',
    country: 'USA',
    website: 'https://techcorp.com',
    sector: 'Technology',
    status: 'New',
    campaign_id: 'campaign-1',
    lead_id: 'lead-1',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@innovate.io',
    linkedin: 'Sarah Johnson',
    linkedinURL: 'https://linkedin.com/in/sarahjohnson',
    jobTitle: 'Marketing Director',
    companyName: 'Innovate Solutions',
    location: 'New York',
    country: 'USA',
    website: 'https://innovate.io',
    sector: 'Marketing',
    status: 'Verified',
    campaign_id: 'campaign-2',
    lead_id: 'lead-2',
    created_at: '2024-01-15T11:45:00Z'
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@startup.co',
    linkedin: 'Mike Chen',
    linkedinURL: 'https://linkedin.com/in/mikechen',
    jobTitle: 'Founder',
    companyName: 'Startup Co.',
    location: 'London',
    country: 'UK',
    website: 'https://startup.co',
    sector: 'E-commerce',
    status: 'Skipped',
    campaign_id: 'campaign-3',
    lead_id: 'lead-3',
    created_at: '2024-01-15T14:20:00Z'
  }
];

export function Leads() {
  const [leads, setLeads] = useLocalStorage<LeadType[]>('leads', []);
  const [searchResults, setSearchResults] = useState<LeadType[]>(mockLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'New' | 'Verified' | 'Skipped'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<LeadType>>({});

  useEffect(() => {
    // Initialize with mock data if localStorage is empty
    if (leads.length === 0) {
      setLeads(mockLeads);
    }
  }, [leads.length, setLeads]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const filtered = mockLeads.filter(lead => 
        (lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      setSearchResults(filtered);
      setIsSearching(false);
      setShowResults(true);
    }, 1000);
  };

  const updateLeadStatus = (leadId: string, status: 'New' | 'Verified' | 'Skipped') => {
    const updatedLeads = leads.map(lead => 
      lead.id === leadId ? { ...lead, status } : lead
    );
    setLeads(updatedLeads);
    
    const updatedResults = searchResults.map(lead => 
      lead.id === leadId ? { ...lead, status } : lead
    );
    setSearchResults(updatedResults);
  };

  const deleteLead = (leadId: string) => {
    const updatedLeads = leads.filter(lead => lead.id !== leadId);
    setLeads(updatedLeads);
    
    const updatedResults = searchResults.filter(lead => lead.id !== leadId);
    setSearchResults(updatedResults);
  };

  const startEditing = (lead: LeadType) => {
    setEditingLeadId(lead.id);
    setEditForm({ ...lead });
  };

  const saveEdit = () => {
    if (!editingLeadId) return;
    
    const updatedLeads = leads.map(lead => 
      lead.id === editingLeadId ? { ...lead, ...editForm } as LeadType : lead
    );
    setLeads(updatedLeads);
    
    const updatedResults = searchResults.map(lead => 
      lead.id === editingLeadId ? { ...lead, ...editForm } as LeadType : lead
    );
    setSearchResults(updatedResults);
    
    setEditingLeadId(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingLeadId(null);
    setEditForm({});
  };

  const handleEditChange = (field: keyof LeadType, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
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
            Lead Management
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            Manage and organize your leads
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Search for Leads</h2>
            
            {/* Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Leads
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, company, or job title"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </motion.button>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSearchQuery('Technology')}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  Technology
                </button>
                <button
                  onClick={() => setSearchQuery('Marketing')}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  Marketing
                </button>
                <button
                  onClick={() => setSearchQuery('E-commerce')}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  E-commerce
                </button>
                <button
                  onClick={() => setSearchQuery('USA')}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  USA
                </button>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            {/* Results Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Leads</h2>
                <div className="flex items-center space-x-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-1 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
                  >
                    <option value="all">All Status</option>
                    <option value="New">New</option>
                    <option value="Verified">Verified</option>
                    <option value="Skipped">Skipped</option>
                  </select>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                {leads.length} leads in database
              </div>
            </div>

            {/* Results Content */}
            <div className="p-6">
              {isSearching ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <div className="text-gray-600">Searching for leads...</div>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                  <p className="text-gray-600">Try a different search term or add new leads.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredResults.map((lead) => (
                        <motion.tr
                          key={lead.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: parseInt(lead.id) * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          {editingLeadId === lead.id ? (
                            // Edit Mode
                            <>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={editForm.name || ''}
                                  onChange={(e) => handleEditChange('name', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={editForm.companyName || ''}
                                  onChange={(e) => handleEditChange('companyName', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={editForm.jobTitle || ''}
                                  onChange={(e) => handleEditChange('jobTitle', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <input
                                  type="email"
                                  value={editForm.email || ''}
                                  onChange={(e) => handleEditChange('email', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={editForm.location || ''}
                                  onChange={(e) => handleEditChange('location', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <select
                                  value={editForm.status || 'New'}
                                  onChange={(e) => handleEditChange('status', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded"
                                >
                                  <option value="New">New</option>
                                  <option value="Verified">Verified</option>
                                  <option value="Skipped">Skipped</option>
                                </select>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={saveEdit}
                                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                                    title="Save"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            // View Mode
                            <>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {lead.name || 'N/A'}
                                {lead.linkedinURL && (
                                  <a 
                                    href={lead.linkedinURL} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                  >
                                    <span className="sr-only">LinkedIn</span>
                                    <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                    </svg>
                                  </a>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {lead.companyName || 'N/A'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {lead.jobTitle || 'N/A'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {lead.email || 'N/A'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {lead.location || 'N/A'}{lead.country ? `, ${lead.country}` : ''}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                                  lead.status === 'Verified' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {lead.status}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => startEditing(lead)}
                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                    title="Edit"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => updateLeadStatus(lead.id, 
                                      lead.status === 'New' ? 'Verified' : 
                                      lead.status === 'Verified' ? 'Skipped' : 'New')}
                                    className={`p-1 rounded ${
                                      lead.status === 'New' ? 'text-green-600 hover:bg-green-100' :
                                      lead.status === 'Verified' ? 'text-gray-600 hover:bg-gray-100' :
                                      'text-blue-600 hover:bg-blue-100'
                                    }`}
                                    title={lead.status === 'New' ? 'Verify' : lead.status === 'Verified' ? 'Skip' : 'Mark as New'}
                                  >
                                    {lead.status === 'New' ? (
                                      <Check className="w-4 h-4" />
                                    ) : lead.status === 'Verified' ? (
                                      <X className="w-4 h-4" />
                                    ) : (
                                      <Plus className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button 
                                    onClick={() => deleteLead(lead.id)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lead Details Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lead Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-800">Total Leads</div>
              <div className="text-2xl font-bold text-blue-600">{leads.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-800">Verified</div>
              <div className="text-2xl font-bold text-green-600">
                {leads.filter(l => l.status === 'Verified').length}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-800">New</div>
              <div className="text-2xl font-bold text-gray-600">
                {leads.filter(l => l.status === 'New').length}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-800">Skipped</div>
              <div className="text-2xl font-bold text-red-600">
                {leads.filter(l => l.status === 'Skipped').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}