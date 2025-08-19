import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, Calendar, User, Building2, Edit, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Deal, PipelineStage, Contact, Company } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

export function Deals() {
  const { t, language } = useLanguage();
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

  useEffect(() => {
    loadDeals();
    loadStages();
    loadContacts();
    loadCompanies();
  }, []);

  const loadDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          contacts(full_name, email),
          companies(name),
          pipeline_stages!deals_stage_id_fkey(name, probability)
        `)
        .order('created_at', { ascending: false });
  
      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStages = async () => {
    try {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setStages(data || []);
    } catch (error) {
      console.error('Error loading stages:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const handleAddDeal = async () => {
    try {
      // Önce varsayılan pipeline ID'sini al
      const { data: pipelineData } = await supabase
        .from('pipelines')
        .select('id')
        .eq('is_default', true)
        .single();
  
      const { error } = await supabase
        .from('deals')
        .insert([{
          title: formData.title,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          currency: formData.currency,
          contact_id: formData.contact_id || null,
          company_id: formData.company_id || null,
          pipeline_id: pipelineData?.id, // YENİ: Zorunlu pipeline_id
          stage_id: formData.pipeline_stage_id || null, // DEĞİŞTİ: pipeline_stage_id -> stage_id
          close_date: formData.close_date || null,
          status: formData.status,
          source: formData.source || null,
          notes: formData.description || null // DEĞİŞTİ: description -> notes
        }]);
  
      if (error) throw error;
  
      setShowAddModal(false);
      resetForm();
      loadDeals();
    } catch (error) {
      console.error('Error adding deal:', error);
      alert(language === 'tr' ? 'Fırsat eklenirken hata oluştu!' : 'Error adding deal!');
    }
  };

  const handleEditDeal = async () => {
    if (!editingDeal) return;
  
    try {
      const { error } = await supabase
        .from('deals')
        .update({
          title: formData.title,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          currency: formData.currency,
          contact_id: formData.contact_id || null,
          company_id: formData.company_id || null,
          stage_id: formData.pipeline_stage_id || null, // DEĞİŞTİ: pipeline_stage_id -> stage_id
          close_date: formData.close_date || null,
          status: formData.status,
          source: formData.source || null,
          notes: formData.description || null // DEĞİŞTİ: description -> notes
        })
        .eq('id', editingDeal.id);
  
      if (error) throw error;
  
      setShowEditModal(false);
      setEditingDeal(null);
      resetForm();
      loadDeals();
    } catch (error) {
      console.error('Error updating deal:', error);
      alert(language === 'tr' ? 'Fırsat güncellenirken hata oluştu!' : 'Error updating deal!');
    }
  };

  const handleDeleteDeal = async (deal: Deal) => {
    const confirmMessage = language === 'tr' 
      ? `${deal.title} fırsatını silmek istediğinizden emin misiniz?`
      : `Are you sure you want to delete ${deal.title}?`;
      
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', deal.id);

      if (error) throw error;

      loadDeals();
    } catch (error) {
      console.error('Error deleting deal:', error);
      alert(language === 'tr' ? 'Fırsat silinirken hata oluştu!' : 'Error deleting deal!');
    }
  };

  const openEditModal = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title || '',
      amount: deal.amount?.toString() || '',
      currency: deal.currency || 'USD',
      contact_id: deal.contact_id || '',
      company_id: deal.company_id || '',
      pipeline_stage_id: deal.pipeline_stage_id || '',
      close_date: deal.close_date || '',
      status: deal.status || 'open',
      source: deal.source || '',
      description: deal.description || ''
    });
    setShowEditModal(true);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('crm.deals.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{deals.length} {t('crm.deals.total')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('crm.deals.addNew')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('crm.deals.stats.totalValue')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/30">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('crm.deals.stats.active')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{openDeals.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/30">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('crm.deals.stats.won')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{wonDeals.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300" />
          <input
            type="text"
            placeholder={t('crm.deals.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">{t('crm.deals.allStatuses')}</option>
          <option value="open">{t('crm.deals.status.open')}</option>
          <option value="won">{t('crm.deals.status.won')}</option>
          <option value="lost">{t('crm.deals.status.lost')}</option>
        </select>
      </div>

      {/* Deals Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('crm.deals.table.deal')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('crm.deals.table.contactCompany')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('crm.deals.table.stage')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('crm.deals.table.value')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('crm.deals.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('crm.deals.table.closeDate')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('crm.deals.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{deal.title}</div>
                      {deal.source && (
                        <div className="text-xs text-gray-500 dark:text-gray-300">
                          {t('crm.deals.source')}: {deal.source}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      {deal.contacts && (
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <User className="w-4 h-4 text-gray-400 mr-2 dark:text-gray-300" />
                          {deal.contacts.full_name}
                        </div>
                      )}
                      {deal.companies && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                          <Building2 className="w-4 h-4 text-gray-400 mr-2 dark:text-gray-300" />
                          {deal.companies.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {deal.pipeline_stages?.name || t('crm.deals.stage.notSpecified')}
                      </div>
                      {deal.pipeline_stages?.probability && (
                        <div className="text-xs text-gray-500 dark:text-gray-300">
                          {deal.pipeline_stages.probability}% {t('crm.deals.stage.probability')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${deal.amount?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">{deal.currency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deal.status)} dark:bg-gray-600 dark:text-white`}>
                      {getStatusLabel(deal.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {deal.close_date ? (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-300" />
                        {new Date(deal.close_date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                      </div>
                    ) : (
                      t('crm.deals.closeDate.notSpecified')
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => openEditModal(deal)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDeal(deal)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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

      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4 dark:text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">{t('crm.deals.noDeals')}</h3>
          <p className="text-gray-600 mb-4 dark:text-gray-300">
            {searchTerm || selectedStatus !== 'all' 
              ? t('crm.deals.noDealsSearch')
              : t('crm.deals.noDealsYet')}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('crm.deals.addFirst')}
          </button>
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('crm.deals.addDeal')}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddDeal(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.title')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    {t('crm.deals.value')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    {t('crm.deals.currency')}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="TRY">TRY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.contact')}
                </label>
                <select
                  value={formData.contact_id}
                  onChange={(e) => setFormData({...formData, contact_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.company')}
                </label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.stage')}
                </label>
                <select
                  value={formData.pipeline_stage_id}
                  onChange={(e) => setFormData({...formData, pipeline_stage_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.closeDate')}
                </label>
                <input
                  type="date"
                  value={formData.close_date}
                  onChange={(e) => setFormData({...formData, close_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.status.label')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="open">{t('crm.deals.status.open')}</option>
                  <option value="won">{t('crm.deals.status.won')}</option>
                  <option value="lost">{t('crm.deals.status.lost')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.source')}
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  placeholder={t('crm.deals.source.placeholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  {t('crm.deals.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('crm.deals.editDeal')}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleEditDeal(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.title')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    {t('crm.deals.value')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    {t('crm.deals.currency')}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="TRY">TRY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.contact')}
                </label>
                <select
                  value={formData.contact_id}
                  onChange={(e) => setFormData({...formData, contact_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.company')}
                </label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.stage')}
                </label>
                <select
                  value={formData.pipeline_stage_id}
                  onChange={(e) => setFormData({...formData, pipeline_stage_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.closeDate')}
                </label>
                <input
                  type="date"
                  value={formData.close_date}
                  onChange={(e) => setFormData({...formData, close_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.status.label')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="open">{t('crm.deals.status.open')}</option>
                  <option value="won">{t('crm.deals.status.won')}</option>
                  <option value="lost">{t('crm.deals.status.lost')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.source')}
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  placeholder={t('crm.deals.source.placeholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.deals.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  {t('crm.deals.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
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