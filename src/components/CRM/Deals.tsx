import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, Calendar, User, Building2, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Deal, PipelineStage } from '../../types';

export function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadDeals();
    loadStages();
  }, []);

  const loadDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          contacts(full_name, email),
          companies(name),
          pipeline_stages(name, probability)
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
      case 'open': return 'Aktif';
      case 'won': return 'Kazanıldı';
      case 'lost': return 'Kaybedildi';
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
          <h1 className="text-2xl font-bold text-gray-900">Fırsatlar</h1>
          <p className="text-gray-600">{deals.length} toplam fırsat</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Fırsat
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
              <p className="text-sm font-medium text-gray-600">Toplam Değer</p>
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
              <p className="text-sm font-medium text-gray-600">Aktif Fırsatlar</p>
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
              <p className="text-sm font-medium text-gray-600">Kazanılan</p>
              <p className="text-2xl font-bold text-gray-900">{wonDeals.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Fırsat, kişi veya şirket ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="open">Aktif</option>
          <option value="won">Kazanıldı</option>
          <option value="lost">Kaybedildi</option>
        </select>
      </div>

      {/* Deals Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fırsat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kişi/Şirket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aşama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Değer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kapanış Tarihi
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
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
                        <div className="text-xs text-gray-500">Kaynak: {deal.source}</div>
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
                      <div className="text-sm text-gray-900">{deal.stage?.name}</div>
                      <div className="text-xs text-gray-500">
                        {deal.stage?.probability}% olasılık
                      </div>
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
                        {new Date(deal.close_date).toLocaleDateString('tr-TR')}
                      </div>
                    ) : (
                      'Belirtilmemiş'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
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
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Fırsat bulunamadı</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedStatus !== 'all' 
              ? 'Arama kriterlerinize uygun fırsat bulunamadı.'
              : 'Henüz hiç fırsat eklenmemiş.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            İlk Fırsatı Ekle
          </button>
        </div>
      )}
    </div>
  );
}