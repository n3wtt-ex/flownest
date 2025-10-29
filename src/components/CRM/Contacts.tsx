import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Mail, Phone, Building2, Edit, Trash2, Users, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Contact, Company } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

export function Contacts() {
  const { t, language } = useLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    title: '',
    company_id: '',
    lifecycle_stage: 'lead',
    notes: ''
  });

  useEffect(() => {
    loadContacts();
    loadCompanies();
  }, []);

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          companies(name, domain)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
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

  const handleAddContact = async () => {
    try {
      const { error } = await supabase
        .from('contacts')
        .insert([{
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          title: formData.title || null,
          company_id: formData.company_id || null,
          lifecycle_stage: formData.lifecycle_stage,
          notes: formData.notes || null
        }]);

      if (error) throw error;

      setShowAddModal(false);
      resetForm();
      loadContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
      alert(language === 'tr' ? 'Kişi eklenirken hata oluştu!' : 'Error adding contact!');
    }
  };

  const handleEditContact = async () => {
    if (!editingContact) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          title: formData.title || null,
          company_id: formData.company_id || null,
          lifecycle_stage: formData.lifecycle_stage,
          notes: formData.notes || null
        })
        .eq('id', editingContact.id);

      if (error) throw error;

      setShowEditModal(false);
      setEditingContact(null);
      resetForm();
      loadContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
      alert(language === 'tr' ? 'Kişi güncellenirken hata oluştu!' : 'Error updating contact!');
    }
  };

  const handleDeleteContact = async (contact: Contact) => {
    const confirmMessage = language === 'tr' 
      ? `${contact.full_name} kişisini silmek istediğinizden emin misiniz?`
      : `Are you sure you want to delete ${contact.full_name}?`;
      
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contact.id);

      if (error) throw error;

      loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert(language === 'tr' ? 'Kişi silinirken hata oluştu!' : 'Error deleting contact!');
    }
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      full_name: contact.full_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      title: contact.title || '',
      company_id: contact.company_id || '',
      lifecycle_stage: contact.lifecycle_stage || 'lead',
      notes: contact.notes || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      title: '',
      company_id: '',
      lifecycle_stage: 'lead',
      notes: ''
    });
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = selectedStage === 'all' || contact.lifecycle_stage === selectedStage;
    
    return matchesSearch && matchesStage;
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-gray-100 text-gray-800';
      case 'MQL': return 'bg-blue-100 text-blue-800';
      case 'SQL': return 'bg-yellow-100 text-yellow-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'lead': return t('crm.contacts.lead');
      case 'MQL': return t('crm.contacts.mql');
      case 'SQL': return t('crm.contacts.sql');
      case 'customer': return t('crm.contacts.customer');
      default: return stage;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('crm.contacts.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{contacts.length} {t('crm.contacts.total')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('crm.contacts.addNew')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder={t('crm.contacts.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="all">{t('crm.contacts.allStages')}</option>
          <option value="lead">{t('crm.contacts.lead')}</option>
          <option value="MQL">{t('crm.contacts.mql')}</option>
          <option value="SQL">{t('crm.contacts.sql')}</option>
          <option value="customer">{t('crm.contacts.customer')}</option>
        </select>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('crm.contacts.table.contact')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('crm.contacts.table.company')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('crm.contacts.table.stage')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('crm.contacts.table.contactInfo')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('crm.contacts.table.created')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  {t('crm.contacts.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {contact.full_name || t('general.name')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">{contact.email}</div>
                      {contact.title && (
                        <div className="text-xs text-gray-400 dark:text-gray-400">{contact.title}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-gray-400 mr-2 dark:text-gray-300" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {contact.companies?.name || 'Belirtilmemiş'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStageColor(contact.lifecycle_stage)} dark:bg-gray-600 dark:text-white`}>
                      {getStageLabel(contact.lifecycle_stage)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                      {contact.phone && <Phone className="w-4 h-4 text-gray-400 dark:text-gray-300" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(contact.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => openEditModal(contact)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteContact(contact)}
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

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4 dark:text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">{t('crm.contacts.noContacts')}</h3>
          <p className="text-gray-600 mb-4 dark:text-gray-300">
            {searchTerm || selectedStage !== 'all' 
              ? t('crm.contacts.noContactsSearch')
              : t('crm.contacts.noContactsYet')}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('crm.contacts.addFirst')}
          </button>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('crm.contacts.addContact')}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddContact(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.contacts.fullName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.contacts.email')} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.contacts.phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.contacts.titleField')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.contacts.company')}
                </label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">{t('crm.contacts.company')} {t('general.select')}</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.contacts.stage')}
                </label>
                <select
                  value={formData.lifecycle_stage}
                  onChange={(e) => setFormData({...formData, lifecycle_stage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="lead">{t('crm.contacts.lead')}</option>
                  <option value="MQL">{t('crm.contacts.mql')}</option>
                  <option value="SQL">{t('crm.contacts.sql')}</option>
                  <option value="customer">{t('crm.contacts.customer')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.contacts.notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
                  {t('crm.contacts.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  {t('crm.contacts.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {showEditModal && editingContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('crm.contacts.editContact')}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleEditContact(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.contacts.fullName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.contacts.email')} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.contacts.phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.contacts.titleField')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.contacts.company')}
                </label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">{t('crm.contacts.company')} {t('general.select')}</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.contacts.stage')}
                </label>
                <select
                  value={formData.lifecycle_stage}
                  onChange={(e) => setFormData({...formData, lifecycle_stage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="lead">{t('crm.contacts.lead')}</option>
                  <option value="MQL">{t('crm.contacts.mql')}</option>
                  <option value="SQL">{t('crm.contacts.sql')}</option>
                  <option value="customer">{t('crm.contacts.customer')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  {t('crm.contacts.notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
                  {t('crm.contacts.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  {t('crm.contacts.update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}