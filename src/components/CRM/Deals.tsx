import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, Calendar, User, Building2, Edit, Trash2, X, List, LayoutGrid, MoreHorizontal } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

// Mock data ve types
interface Deal {
  id: string;
  title: string;
  amount: number;
  currency: string;
  contact_id?: string;
  company_id?: string;
  stage_id?: string;
  close_date?: string;
  status: 'open' | 'won' | 'lost';
  source?: string;
  notes?: string;
  contacts?: { full_name: string; email: string };
  companies?: { name: string };
  pipeline_stages?: { name: string; probability: number };
}

interface PipelineStage {
  id: string;
  name: string;
  probability: number;
}

interface Contact {
  id: string;
  full_name: string;
  email: string;
}

interface Company {
  id: string;
  name: string;
}

// Mock translation function
const t = (key: string) => {
  const translations: { [key: string]: string } = {
    'crm.deals.title': 'Deals',
    'crm.deals.total': 'total deals',
    'crm.deals.addNew': 'Add New Deal',
    'crm.deals.stats.totalValue': 'Total Value',
    'crm.deals.stats.active': 'Active Deals',
    'crm.deals.stats.won': 'Won Deals',
    'crm.deals.searchPlaceholder': 'Search deals...',
    'crm.deals.allStatuses': 'All Statuses',
    'crm.deals.status.open': 'Open',
    'crm.deals.status.won': 'Won',
    'crm.deals.status.lost': 'Lost',
    'crm.deals.table.deal': 'Deal',
    'crm.deals.table.contactCompany': 'Contact / Company',
    'crm.deals.table.stage': 'Stage',
    'crm.deals.table.value': 'Value',
    'crm.deals.table.status': 'Status',
    'crm.deals.table.closeDate': 'Close Date',
    'crm.deals.table.actions': 'Actions',
    'crm.deals.noDeals': 'No deals found',
    'crm.deals.noDealsSearch': 'No deals match your search criteria',
    'crm.deals.noDealsYet': 'You haven\'t created any deals yet',
    'crm.deals.addFirst': 'Add your first deal',
    'crm.deals.source': 'Source',
    'crm.deals.stage.notSpecified': 'Not specified',
    'crm.deals.stage.probability': 'probability',
    'crm.deals.closeDate.notSpecified': 'Not specified',
    'crm.deals.addDeal': 'Add Deal',
    'crm.deals.editDeal': 'Edit Deal',
    'crm.deals.dealTitle': 'Title',
    'crm.deals.value': 'Value',
    'crm.deals.currency': 'Currency',
    'crm.deals.contact': 'Contact',
    'crm.deals.company': 'Company',
    'crm.deals.stage': 'Stage',
    'crm.deals.closeDate': 'Close Date',
    'crm.deals.status.label': 'Status',
    'crm.deals.description': 'Description',
    'crm.deals.cancel': 'Cancel',
    'crm.deals.save': 'Save',
    'crm.deals.update': 'Update',
    'crm.deals.contact.select': 'Select contact...',
    'crm.deals.company.select': 'Select company...',
    'crm.deals.stage.select': 'Select stage...',
    'crm.deals.source.placeholder': 'e.g. Website, Referral, Cold Call'
  };
  return translations[key] || key;
};

export function Deals() {
  const language = 'en';
  const { isCollapsed } = useSidebar();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    currency: 'USD',
    contact_id: '',
    company_id: '',
    pipeline_stage_id: '',
    close_date: '',
    status: 'open',
    source: '',
    description: ''
  });

  // Mock data initialization
  useEffect(() => {
    const mockStages: PipelineStage[] = [
      { id: '1', name: 'Lead', probability: 10 },
      { id: '2', name: 'Qualified', probability: 25 },
      { id: '3', name: 'Proposal', probability: 50 },
      { id: '4', name: 'Negotiation', probability: 75 },
      { id: '5', name: 'Closed Won', probability: 100 },
      { id: '6', name: 'Closed Lost', probability: 0 }
    ];

    const mockContacts: Contact[] = [
      { id: '1', full_name: 'John Doe', email: 'john@example.com' },
      { id: '2', full_name: 'Jane Smith', email: 'jane@example.com' },
      { id: '3', full_name: 'Mike Johnson', email: 'mike@example.com' }
    ];

    const mockCompanies: Company[] = [
      { id: '1', name: 'Acme Corp' },
      { id: '2', name: 'TechStart Inc' },
      { id: '3', name: 'Global Solutions' }
    ];

    const mockDeals: Deal[] = [
      {
        id: '1',
        title: 'Enterprise Software License',
        amount: 45000,
        currency: 'USD',
        contact_id: '1',
        company_id: '1',
        stage_id: '3',
        close_date: '2024-12-15',
        status: 'open',
        source: 'Website',
        notes: 'Large enterprise deal with potential for expansion',
        contacts: { full_name: 'John Doe', email: 'john@example.com' },
        companies: { name: 'Acme Corp' },
        pipeline_stages: { name: 'Proposal', probability: 50 }
      },
      {
        id: '2',
        title: 'Consulting Services',
        amount: 15000,
        currency: 'USD',
        contact_id: '2',
        company_id: '2',
        stage_id: '2',
        close_date: '2024-11-30',
        status: 'open',
        source: 'Referral',
        notes: 'Monthly consulting retainer',
        contacts: { full_name: 'Jane Smith', email: 'jane@example.com' },
        companies: { name: 'TechStart Inc' },
        pipeline_stages: { name: 'Qualified', probability: 25 }
      },
      {
        id: '3',
        title: 'Cloud Migration Project',
        amount: 75000,
        currency: 'USD',
        contact_id: '3',
        company_id: '3',
        stage_id: '4',
        close_date: '2025-01-20',
        status: 'open',
        source: 'Cold Call',
        notes: 'Complete cloud infrastructure migration',
        contacts: { full_name: 'Mike Johnson', email: 'mike@example.com' },
        companies: { name: 'Global Solutions' },
        pipeline_stages: { name: 'Negotiation', probability: 75 }
      },
      {
        id: '4',
        title: 'Marketing Automation',
        amount: 25000,
        currency: 'USD',
        contact_id: '1',
        company_id: '1',
        stage_id: '5',
        close_date: '2024-10-15',
        status: 'won',
        source: 'Website',
        notes: 'Successfully closed marketing automation deal',
        contacts: { full_name: 'John Doe', email: 'john@example.com' },
        companies: { name: 'Acme Corp' },
        pipeline_stages: { name: 'Closed Won', probability: 100 }
      }
    ];

    setStages(mockStages);
    setContacts(mockContacts);
    setCompanies(mockCompanies);
    setDeals(mockDeals);
    setLoading(false);
  }, []);

  // Kanban için temel durumlar
  const kanbanColumns = [
    { id: 'interested', title: 'Interested', color: 'bg-blue-50 border-blue-200', deals: deals.filter(d => ['1', '2'].includes(d.stage_id || '')) },
    { id: 'meeting_booked', title: 'Meeting booked', color: 'bg-orange-50 border-orange-200', deals: deals.filter(d => d.stage_id === '3') },
    { id: 'meeting_completed', title: 'Meeting completed', color: 'bg-purple-50 border-purple-200', deals: deals.filter(d => d.stage_id === '4') },
    { id: 'won', title: 'Won', color: 'bg-green-50 border-green-200', deals: deals.filter(d => d.status === 'won') }
  ];

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    
    // Mock update - in real app, you'd update the database
    setDeals(prev => prev.map(deal => {
      if (deal.id === dealId) {
        let newStageId = deal.stage_id;
        let newStatus = deal.status;
        
        switch (columnId) {
          case 'interested':
            newStageId = '2';
            newStatus = 'open';
            break;
          case 'meeting_booked':
            newStageId = '3';
            newStatus = 'open';
            break;
          case 'meeting_completed':
            newStageId = '4';
            newStatus = 'open';
            break;
          case 'won':
            newStageId = '5';
            newStatus = 'won';
            break;
        }
        
        return { ...deal, stage_id: newStageId, status: newStatus };
      }
      return deal;
    }));
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contacts?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || deal.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return t('crm.deals.status.open');
      case 'won': return t('crm.deals.status.won');
      case 'lost': return t('crm.deals.status.lost');
      default: return status;
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      currency: 'USD',
      contact_id: '',
      company_id: '',
      pipeline_stage_id: '',
      close_date: '',
      status: 'open',
      source: '',
      description: ''
    });
  };

  const openEditModal = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title || '',
      amount: deal.amount?.toString() || '',
      currency: deal.currency || 'USD',
      contact_id: deal.contact_id || '',
      company_id: deal.company_id || '',
      pipeline_stage_id: deal.stage_id || '',
      close_date: deal.close_date || '',
      status: deal.status || 'open',
      source: deal.source || '',
      description: deal.notes || ''
    });
    setShowEditModal(true);
  };

  const handleAddDeal = () => {
    const newDeal: Deal = {
      id: (deals.length + 1).toString(),
      title: formData.title,
      amount: formData.amount ? parseFloat(formData.amount) : 0,
      currency: formData.currency,
      contact_id: formData.contact_id || undefined,
      company_id: formData.company_id || undefined,
      stage_id: formData.pipeline_stage_id || '1',
      close_date: formData.close_date || undefined,
      status: formData.status as 'open' | 'won' | 'lost',
      source: formData.source || undefined,
      notes: formData.description || undefined,
      contacts: formData.contact_id ? contacts.find(c => c.id === formData.contact_id) : undefined,
      companies: formData.company_id ? companies.find(c => c.id === formData.company_id) : undefined,
      pipeline_stages: formData.pipeline_stage_id ? stages.find(s => s.id === formData.pipeline_stage_id) : undefined
    };

    setDeals([...deals, newDeal]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditDeal = () => {
    if (!editingDeal) return;

    setDeals(deals.map(deal => {
      if (deal.id === editingDeal.id) {
        return {
          ...deal,
          title: formData.title,
          amount: formData.amount ? parseFloat(formData.amount) : 0,
          currency: formData.currency,
          contact_id: formData.contact_id || undefined,
          company_id: formData.company_id || undefined,
          stage_id: formData.pipeline_stage_id || undefined,
          close_date: formData.close_date || undefined,
          status: formData.status as 'open' | 'won' | 'lost',
          source: formData.source || undefined,
          notes: formData.description || undefined,
          contacts: formData.contact_id ? contacts.find(c => c.id === formData.contact_id) : undefined,
          companies: formData.company_id ? companies.find(c => c.id === formData.company_id) : undefined,
          pipeline_stages: formData.pipeline_stage_id ? stages.find(s => s.id === formData.pipeline_stage_id) : undefined
        };
      }
      return deal;
    }));

    setShowEditModal(false);
    setEditingDeal(null);
    resetForm();
  };

  const handleDeleteDeal = (deal: Deal) => {
    if (confirm(`Are you sure you want to delete ${deal.title}?`)) {
      setDeals(deals.filter(d => d.id !== deal.id));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalValue = filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const openDeals = filteredDeals.filter(deal => deal.status === 'open');
  const wonDeals = filteredDeals.filter(deal => deal.status === 'won');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('crm.deals.title')}</h1>
          <p className="text-gray-600">{deals.length} {t('crm.deals.total')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('crm.deals.addNew')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('crm.deals.stats.totalValue')}</p>
              <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('crm.deals.stats.active')}</p>
              <p className="text-2xl font-bold text-gray-900">{openDeals.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('crm.deals.stats.won')}</p>
              <p className="text-2xl font-bold text-gray-900">{wonDeals.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('crm.deals.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white [&::-webkit-appearance]:none [&::-moz-appearance]:none"
          >
            <option value="all">{t('crm.deals.allStatuses')}</option>
            <option value="open">{t('crm.deals.status.open')}</option>
            <option value="won">{t('crm.deals.status.won')}</option>
            <option value="lost">{t('crm.deals.status.lost')}</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center bg-white border border-gray-300 rounded-lg">
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-2 rounded-l-lg transition-colors ${
              viewMode === 'kanban' 
                ? 'bg-blue-50 text-blue-600 border-r border-blue-200' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Kanban View"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-r-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'kanban' ? (
        /* Kanban View */
        <div className={`kanban-container grid gap-4 transition-all duration-300 ease-in-out ${
          isCollapsed 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        }`}>
          {kanbanColumns.map((column) => (
            <div
              key={column.id}
              className={`kanban-column ${column.color} border-2 border-dashed rounded-lg transition-all duration-300 ease-in-out ${
                isCollapsed ? 'p-4' : 'p-3 lg:p-4'
              } min-h-96`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h3 className={`font-semibold text-gray-900 ${
                    isCollapsed ? 'text-sm' : 'text-xs lg:text-sm'
                  }`}>{column.title}</h3>
                </div>
                <div className={`text-gray-500 ${
                  isCollapsed ? 'text-sm' : 'text-xs lg:text-sm'
                }`}>
                  ${column.deals.reduce((sum, deal) => sum + (deal.amount || 0), 0).toLocaleString()}
                </div>
              </div>

              <div className={`text-gray-500 mb-4 ${
                isCollapsed ? 'text-xs' : 'text-xs'
              }`}>
                {column.deals.length} deals
              </div>

              {/* Deals Cards */}
              <div className="space-y-3">
                {column.deals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    className={`deal-card bg-white rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-all duration-200 ease-in-out ${
                      isCollapsed ? 'p-4' : 'p-3 lg:p-4'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium text-gray-900 leading-tight ${
                        isCollapsed ? 'text-sm' : 'text-xs lg:text-sm'
                      }`}>
                        {deal.title}
                      </h4>
                      <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                        <MoreHorizontal className={`${
                          isCollapsed ? 'w-4 h-4' : 'w-3 h-3 lg:w-4 lg:h-4'
                        }`} />
                      </button>
                    </div>

                    <div className={`flex items-center mb-3 ${
                      isCollapsed ? 'space-x-2' : 'space-x-1 lg:space-x-2'
                    }`}>
                      {deal.contacts && (
                        <div className={`flex items-center text-gray-600 ${
                          isCollapsed ? 'text-xs' : 'text-xs'
                        }`}>
                          <User className={`mr-1 ${
                            isCollapsed ? 'w-3 h-3' : 'w-3 h-3'
                          }`} />
                          <span className="truncate max-w-20">{deal.contacts.full_name}</span>
                        </div>
                      )}
                      {deal.companies && (
                        <div className={`flex items-center text-gray-600 ${
                          isCollapsed ? 'text-xs' : 'text-xs'
                        }`}>
                          <Building2 className={`mr-1 ${
                            isCollapsed ? 'w-3 h-3' : 'w-3 h-3'
                          }`} />
                          <span className="truncate max-w-20">{deal.companies.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className={`font-semibold text-gray-900 ${
                        isCollapsed ? 'text-sm' : 'text-xs lg:text-sm'
                      }`}>
                        ${deal.amount?.toLocaleString() || '0'}
                      </div>
                      {deal.close_date && (
                        <div className={`flex items-center text-gray-500 ${
                          isCollapsed ? 'text-xs' : 'text-xs'
                        }`}>
                          <Calendar className={`mr-1 ${
                            isCollapsed ? 'w-3 h-3' : 'w-3 h-3'
                          }`} />
                          <span className="hidden sm:inline">
                            {new Date(deal.close_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {deal.source && (
                      <div className={`mt-2 text-gray-500 ${
                        isCollapsed ? 'text-xs' : 'text-xs'
                      }`}>
                        <span className="truncate">Source: {deal.source}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <span className={`inline-flex px-2 py-1 font-medium rounded-full ${getStatusColor(deal.status)} ${
                        isCollapsed ? 'text-xs' : 'text-xs'
                      }`}>
                        {getStatusLabel(deal.status)}
                      </span>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => openEditModal(deal)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDeal(deal)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('crm.deals.table.deal')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('crm.deals.table.contactCompany')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('crm.deals.table.stage')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('crm.deals.table.value')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('crm.deals.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('crm.deals.table.closeDate')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('crm.deals.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                        {deal.source && (
                          <div className="text-xs text-gray-500">
                            {t('crm.deals.source')}: {deal.source}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {deal.contacts && (
                          <div className="flex items-center text-sm text-gray-900">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            {deal.contacts.full_name}
                          </div>
                        )}
                        {deal.companies && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            {deal.companies.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {deal.pipeline_stages?.name || t('crm.deals.stage.notSpecified')}
                        </div>
                        {deal.pipeline_stages?.probability && (
                          <div className="text-xs text-gray-500">
                            {deal.pipeline_stages.probability}% {t('crm.deals.stage.probability')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${deal.amount?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-gray-500">{deal.currency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deal.status)}`}>
                        {getStatusLabel(deal.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {deal.close_date ? (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(deal.close_date).toLocaleDateString((language as string) === 'tr' ? 'tr-TR' : 'en-US')}
                        </div>
                      ) : (
                        t('crm.deals.closeDate.notSpecified')
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => openEditModal(deal)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDeal(deal)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('crm.deals.noDeals')}</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedStatus !== 'all' 
              ? t('crm.deals.noDealsSearch')
              : t('crm.deals.noDealsYet')}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('crm.deals.addFirst')}
          </button>
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('crm.deals.addDeal')}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddDeal(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.dealTitle')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('crm.deals.value')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('crm.deals.currency')}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="TRY">TRY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.contact')}
                </label>
                <select
                  value={formData.contact_id}
                  onChange={(e) => setFormData({...formData, contact_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('crm.deals.contact.select')}</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.full_name} ({contact.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.company')}
                </label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('crm.deals.company.select')}</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.stage')}
                </label>
                <select
                  value={formData.pipeline_stage_id}
                  onChange={(e) => setFormData({...formData, pipeline_stage_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('crm.deals.stage.select')}</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name} ({stage.probability}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.closeDate')}
                </label>
                <input
                  type="date"
                  value={formData.close_date}
                  onChange={(e) => setFormData({...formData, close_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.status.label')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="open">{t('crm.deals.status.open')}</option>
                  <option value="won">{t('crm.deals.status.won')}</option>
                  <option value="lost">{t('crm.deals.status.lost')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.source')}
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  placeholder={t('crm.deals.source.placeholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('crm.deals.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('crm.deals.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Deal Modal */}
      {showEditModal && editingDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('crm.deals.editDeal')}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleEditDeal(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.dealTitle')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('crm.deals.value')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('crm.deals.currency')}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="TRY">TRY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.contact')}
                </label>
                <select
                  value={formData.contact_id}
                  onChange={(e) => setFormData({...formData, contact_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('crm.deals.contact.select')}</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.full_name} ({contact.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.company')}
                </label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('crm.deals.company.select')}</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.stage')}
                </label>
                <select
                  value={formData.pipeline_stage_id}
                  onChange={(e) => setFormData({...formData, pipeline_stage_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('crm.deals.stage.select')}</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name} ({stage.probability}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.closeDate')}
                </label>
                <input
                  type="date"
                  value={formData.close_date}
                  onChange={(e) => setFormData({...formData, close_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.status.label')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="open">{t('crm.deals.status.open')}</option>
                  <option value="won">{t('crm.deals.status.won')}</option>
                  <option value="lost">{t('crm.deals.status.lost')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.source')}
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  placeholder={t('crm.deals.source.placeholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('crm.deals.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('crm.deals.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('crm.deals.update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}