import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, Calendar, User, Building2, Edit, Trash2, X, List, LayoutGrid, MoreHorizontal } from 'lucide-react';

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
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Mock data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDeals([
        {
          id: '1',
          title: 'Website Redesign Project',
          amount: 15000,
          currency: 'USD',
          contact_id: '1',
          company_id: '1',
          stage_id: '1',
          close_date: '2023-12-15',
          status: 'open',
          source: 'Website',
          notes: 'Client wants a complete redesign of their website with modern UI/UX.',
          contacts: { full_name: 'John Smith', email: 'john@acme.com' },
          companies: { name: 'Acme Inc' },
          pipeline_stages: { name: 'Proposal', probability: 70 }
        },
        {
          id: '2',
          title: 'Mobile App Development',
          amount: 25000,
          currency: 'USD',
          contact_id: '2',
          company_id: '2',
          stage_id: '2',
          close_date: '2024-01-20',
          status: 'open',
          source: 'Referral',
          notes: 'Develop a cross-platform mobile application for iOS and Android.',
          contacts: { full_name: 'Sarah Johnson', email: 'sarah@globex.com' },
          companies: { name: 'Globex Corp' },
          pipeline_stages: { name: 'Negotiation', probability: 90 }
        },
        {
          id: '3',
          title: 'Cloud Migration Service',
          amount: 35000,
          currency: 'USD',
          contact_id: '3',
          company_id: '3',
          stage_id: '3',
          close_date: '2023-11-30',
          status: 'won',
          source: 'Cold Call',
          notes: 'Migrate existing infrastructure to cloud-based solutions.',
          contacts: { full_name: 'Michael Brown', email: 'michael@initech.com' },
          companies: { name: 'Initech Ltd' },
          pipeline_stages: { name: 'Closed Won', probability: 100 }
        }
      ]);
      
      setStages([
        { id: '1', name: 'Prospecting', probability: 20 },
        { id: '2', name: 'Qualification', probability: 40 },
        { id: '3', name: 'Proposal', probability: 70 },
        { id: '4', name: 'Negotiation', probability: 90 },
        { id: '5', name: 'Closed Won', probability: 100 },
        { id: '6', name: 'Closed Lost', probability: 0 }
      ]);
      
      setContacts([
        { id: '1', full_name: 'John Smith', email: 'john@acme.com' },
        { id: '2', full_name: 'Sarah Johnson', email: 'sarah@globex.com' },
        { id: '3', full_name: 'Michael Brown', email: 'michael@initech.com' }
      ]);
      
      setCompanies([
        { id: '1', name: 'Acme Inc' },
        { id: '2', name: 'Globex Corp' },
        { id: '3', name: 'Initech Ltd' }
      ]);
      
      setLoading(false);
    }, 500);
  }, []);
  
  // Filter deals based on search term and status
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deal.contacts?.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (deal.companies?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || deal.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Calculate stats
  const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const activeDeals = deals.filter(deal => deal.status === 'open').length;
  const wonDeals = deals.filter(deal => deal.status === 'won').length;
  
  // Handle add deal
  const handleAddDeal = (newDeal: Omit<Deal, 'id'>) => {
    const deal: Deal = {
      id: (deals.length + 1).toString(),
      ...newDeal
    };
    setDeals([...deals, deal]);
    setShowAddModal(false);
  };
  
  // Handle edit deal
  const handleEditDeal = (updatedDeal: Deal) => {
    setDeals(deals.map(deal => deal.id === updatedDeal.id ? updatedDeal : deal));
    setShowEditModal(false);
  };
  
  // Handle delete deal
  const handleDeleteDeal = (id: string) => {
    setDeals(deals.filter(deal => deal.id !== id));
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('crm.deals.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {deals.length} {t('crm.deals.total')}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('crm.deals.addNew')}
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3 dark:bg-blue-900/30">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                    {t('crm.deals.stats.totalValue')}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      ${totalValue.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3 dark:bg-green-900/30">
                <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                    {t('crm.deals.stats.active')}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {activeDeals}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3 dark:bg-purple-900/30">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                    {t('crm.deals.stats.won')}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {wonDeals}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder={t('crm.deals.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <select
          className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">{t('crm.deals.allStatuses')}</option>
          <option value="open">{t('crm.deals.status.open')}</option>
          <option value="won">{t('crm.deals.status.won')}</option>
          <option value="lost">{t('crm.deals.status.lost')}</option>
        </select>
      </div>
      
      {/* Deals table */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      {t('crm.deals.table.deal')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      {t('crm.deals.table.contactCompany')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      {t('crm.deals.table.stage')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      {t('crm.deals.table.value')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      {t('crm.deals.table.status')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      {t('crm.deals.table.closeDate')}
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">{t('crm.deals.table.actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredDeals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center dark:text-gray-400">
                        {searchTerm ? t('crm.deals.noDealsSearch') : deals.length === 0 ? t('crm.deals.noDealsYet') : t('crm.deals.noDeals')}
                        {deals.length === 0 && (
                          <div className="mt-2">
                            <button
                              onClick={() => setShowAddModal(true)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:text-blue-300 dark:bg-blue-900/30 dark:hover:bg-blue-800/30"
                            >
                              {t('crm.deals.addFirst')}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredDeals.map((deal, i) => (
                      <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{deal.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{deal.source}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{deal.contacts?.full_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{deal.companies?.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {deal.pipeline_stages?.name || t('crm.deals.stage.notSpecified')}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {deal.pipeline_stages?.probability || 0}% {t('crm.deals.stage.probability')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${deal.amount.toLocaleString()} {deal.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            deal.status === 'open' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                            deal.status === 'won' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                          }`}>
                            {deal.status === 'open' ? t('crm.deals.status.open') :
                             deal.status === 'won' ? t('crm.deals.status.won') :
                             t('crm.deals.status.lost')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {deal.close_date ? new Date(deal.close_date).toLocaleDateString() : t('crm.deals.closeDate.notSpecified')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setShowEditModal(true)}
                            className="text-blue-600 hover:text-blue-900 mr-3 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDeal(deal.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Deal Modal */}
      {showAddModal && (
        <AddDealModal
          stages={stages}
          contacts={contacts}
          companies={companies}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddDeal}
        />
      )}
      
      {/* Edit Deal Modal */}
      {showEditModal && (
        <EditDealModal
          stages={stages}
          contacts={contacts}
          companies={companies}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditDeal}
        />
      )}
    </div>
  );
}

// Add Deal Modal Component
function AddDealModal({ stages, contacts, companies, onClose, onSave }: {
  stages: PipelineStage[];
  contacts: Contact[];
  companies: Company[];
  onClose: () => void;
  onSave: (deal: Omit<Deal, 'id'>) => void;
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [contactId, setContactId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [stageId, setStageId] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [status, setStatus] = useState<'open' | 'won' | 'lost'>('open');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      amount: parseFloat(amount) || 0,
      currency,
      contact_id: contactId || undefined,
      company_id: companyId || undefined,
      stage_id: stageId || undefined,
      close_date: closeDate || undefined,
      status,
      source: source || undefined,
      notes: notes || undefined
    });
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 dark:bg-gray-900/70">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('crm.deals.addDeal')}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('crm.deals.dealTitle')}
              </label>
              <input
                type="text"
                id="title"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('crm.deals.value')}
                </label>
                <input
                  type="number"
                  id="amount"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('crm.deals.currency')}
                </label>
                <select
                  id="currency"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('crm.deals.contact')}
                </label>
                <select
                  id="contact"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                >
                  <option value="">{t('crm.deals.contact.select')}</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id} className="dark:bg-gray-700 dark:text-white">
                      {contact.full_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('crm.deals.company')}
                </label>
                <select
                  id="company"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                >
                  <option value="">{t('crm.deals.company.select')}</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id} className="dark:bg-gray-700 dark:text-white">
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('crm.deals.stage')}
                </label>
                <select
                  id="stage"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={stageId}
                  onChange={(e) => setStageId(e.target.value)}
                >
                  <option value="">{t('crm.deals.stage.select')}</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id} className="dark:bg-gray-700 dark:text-white">
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="closeDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('crm.deals.closeDate')}
                </label>
                <input
                  type="date"
                  id="closeDate"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={closeDate}
                  onChange={(e) => setCloseDate(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('crm.deals.status.label')}
              </label>
              <select
                id="status"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'open' | 'won' | 'lost')}
              >
                <option value="open" className="dark:bg-gray-700 dark:text-white">{t('crm.deals.status.open')}</option>
                <option value="won" className="dark:bg-gray-700 dark:text-white">{t('crm.deals.status.won')}</option>
                <option value="lost" className="dark:bg-gray-700 dark:text-white">{t('crm.deals.status.lost')}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('crm.deals.source')}
              </label>
              <input
                type="text"
                id="source"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t('crm.deals.source.placeholder')}
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('crm.deals.description')}
              </label>
              <textarea
                id="notes"
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              >
                {t('crm.deals.cancel')}
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {t('crm.deals.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Edit Deal Modal Component
function EditDealModal({ stages, contacts, companies, onClose, onSave }: {
  stages: PipelineStage[];
  contacts: Contact[];
  companies: Company[];
  onClose: () => void;
  onSave: (deal: Deal) => void;
}) {
  // For simplicity, we'll use the same form as AddDealModal
  // In a real application, you would pre-fill the form with existing deal data
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [contactId, setContactId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [stageId, setStageId] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [status, setStatus] = useState<'open' | 'won' | 'lost'>('open');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would pass the existing deal ID
    onSave({
      id: '1', // Placeholder ID
      title,
      amount: parseFloat(amount) || 0,
      currency,
      contact_id: contactId || undefined,
      company_id: companyId || undefined,
      stage_id: stageId || undefined,
      close_date: closeDate || undefined,
      status,
      source: source || undefined,
      notes: notes || undefined
    } as Deal);
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 dark:bg-gray-900/70">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('crm.deals.editDeal')}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('crm.deals.dealTitle')}
              </label>
              <input
                type="text"
                id="title"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('crm.deals.value')}
                </label>
                <input
                  type="number"
                  id="amount"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('crm.deals.currency')}
                </label>
                <select
                  id="currency"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD" className="dark:bg-gray-700 dark:text-white">USD</option>
                  <option value="EUR" className="dark:bg-gray-700 dark:text-white">EUR</option>
                  <option value="GBP" className="dark:bg-gray-700 dark:text-white">GBP</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('crm.deals.contact')}
                </label>
                <select
                  id="contact"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                >
                  <option value="" className="dark:bg-gray-700 dark:text-white">{t('crm.deals.contact.select')}</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id} className="dark:bg-gray-700 dark:text-white">
                      {contact.full_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('crm.deals.company')}
                </label>
                <select
                  id="company"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                >
                  <option value="" className="dark:bg-gray-700 dark:text-white">{t('crm.deals.company.select')}</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id} className="dark:bg-gray-700 dark:text-white">
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('crm.deals.stage')}
                </label>
                <select
                  id="stage"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={stageId}
                  onChange={(e) => setStageId(e.target.value)}
                >
                  <option value="" className="dark:bg-gray-700 dark:text-white">{t('crm.deals.stage.select')}</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id} className="dark:bg-gray-700 dark:text-white">
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="closeDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('crm.deals.closeDate')}
                </label>
                <input
                  type="date"
                  id="closeDate"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={closeDate}
                  onChange={(e) => setCloseDate(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('crm.deals.status.label')}
              </label>
              <select
                id="status"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'open' | 'won' | 'lost')}
              >
                <option value="open" className="dark:bg-gray-700 dark:text-white">{t('crm.deals.status.open')}</option>
                <option value="won" className="dark:bg-gray-700 dark:text-white">{t('crm.deals.status.won')}</option>
                <option value="lost" className="dark:bg-gray-700 dark:text-white">{t('crm.deals.status.lost')}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('crm.deals.source')}
              </label>
              <input
                type="text"
                id="source"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t('crm.deals.source.placeholder')}
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('crm.deals.description')}
              </label>
              <textarea
                id="notes"
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              >
                {t('crm.deals.cancel')}
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {t('crm.deals.update')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}