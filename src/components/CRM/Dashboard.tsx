import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Handshake, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Activity,
  Target,
  Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Deal, Contact, Company } from '../../types';

interface DashboardStats {
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  totalValue: number;
  wonDeals: number;
  openDeals: number;
}

interface StageStats {
  stageName: string;
  count: number;
  value: number;
}

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalCompanies: 0,
    totalDeals: 0,
    totalValue: 0,
    wonDeals: 0,
    openDeals: 0,
  });
  const [stageStats, setStageStats] = useState<StageStats[]>([]);
  const [recentDeals, setRecentDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{contacts: Contact[], companies: Company[], deals: Deal[]}>({
    contacts: [],
    companies: [],
    deals: []
  });
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      handleSearch();
    } else {
      setShowSearchResults(false);
      setSearchResults({ contacts: [], companies: [], deals: [] });
    }
  }, [searchTerm]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const searchQuery = searchTerm.toLowerCase();

      // Search contacts
      const { data: contacts } = await supabase
        .from('contacts')
        .select('*, companies(name)')
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(5);

      // Search companies
      const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,domain.ilike.%${searchQuery}%,industry.ilike.%${searchQuery}%`)
        .limit(5);

      // Search deals
      const { data: deals } = await supabase
        .from('deals')
        .select('*, contacts(full_name), companies(name)')
        .or(`title.ilike.%${searchQuery}%`)
        .limit(5);

      setSearchResults({
        contacts: contacts || [],
        companies: companies || [],
        deals: deals || []
      });
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load basic stats
      const [contactsRes, companiesRes, dealsRes] = await Promise.all([
        supabase.from('contacts').select('id'),
        supabase.from('companies').select('id'),
        supabase.from('deals').select('id, amount, status'),
      ]);

      const totalContacts = contactsRes.data?.length || 0;
      const totalCompanies = companiesRes.data?.length || 0;
      const deals = dealsRes.data || [];
      const totalDeals = deals.length;
      const totalValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
      const wonDeals = deals.filter(deal => deal.status === 'won').length;
      const openDeals = deals.filter(deal => deal.status === 'open').length;

      setStats({
        totalContacts,
        totalCompanies,
        totalDeals,
        totalValue,
        wonDeals,
        openDeals,
      });

      // Load stage statistics
      const { data: stageData } = await supabase
        .from('deals')
        .select(`
          amount,
          pipeline_stages!deals_stage_id_fkey(name)
        `)
        .eq('status', 'open');

      const stageMap = new Map<string, { count: number; value: number }>();
      stageData?.forEach(deal => {
        const stageName = deal.pipeline_stages?.name || 'Belirtilmemiş';
        const current = stageMap.get(stageName) || { count: 0, value: 0 };
        stageMap.set(stageName, {
          count: current.count + 1,
          value: current.value + (deal.amount || 0),
        });
      });

      const stageStatsArray = Array.from(stageMap.entries()).map(([stageName, stats]) => ({
        stageName,
        count: stats.count,
        value: stats.value,
      }));

      setStageStats(stageStatsArray);

      // Load recent deals
      const { data: recentDealsData } = await supabase
        .from('deals')
        .select(`
          *,
          contacts(full_name, email),
          companies(name),
          pipeline_stages!deals_stage_id_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentDeals(recentDealsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    } else {
      // Ana uygulama bağlantısı yoksa event dispatch et
      window.dispatchEvent(new CustomEvent('navigate', { detail: { section } }));
    }
  };

  const handleQuickAction = (action: string) => {
    handleNavigation(action);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Toplam Kişiler',
      value: stats.totalContacts.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      onClick: () => handleQuickAction('contacts'),
    },
    {
      title: 'Şirketler',
      value: stats.totalCompanies.toLocaleString(),
      icon: Building2,
      color: 'bg-green-500',
      change: '+8%',
      onClick: () => handleQuickAction('companies'),
    },
    {
      title: 'Aktif Fırsatlar',
      value: stats.openDeals.toLocaleString(),
      icon: Handshake,
      color: 'bg-orange-500',
      change: '+15%',
      onClick: () => handleQuickAction('deals'),
    },
    {
      title: 'Toplam Değer',
      value: `${stats.totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+23%',
      onClick: () => handleQuickAction('deals'),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header with Search */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
        <p className="text-gray-600">Satış performansınızın genel görünümü</p>
        
        {/* Global Search */}
        <div className="mt-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Kişi, şirket veya fırsat ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && (searchResults.contacts.length > 0 || searchResults.companies.length > 0 || searchResults.deals.length > 0) && (
            <div className="absolute top-full left-0 right-0 max-w-md mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {searchResults.contacts.length > 0 && (
                <div className="p-3 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Kişiler</h4>
                  {searchResults.contacts.map(contact => (
                    <div 
                      key={contact.id} 
                      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        handleNavigation('contacts');
                        setShowSearchResults(false);
                        setSearchTerm('');
                      }}
                    >
                      <Users className="w-4 h-4 text-blue-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{contact.full_name}</p>
                        <p className="text-xs text-gray-500">{contact.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchResults.companies.length > 0 && (
                <div className="p-3 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Şirketler</h4>
                  {searchResults.companies.map(company => (
                    <div 
                      key={company.id} 
                      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        handleNavigation('companies');
                        setShowSearchResults(false);
                        setSearchTerm('');
                      }}
                    >
                      <Building2 className="w-4 h-4 text-green-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{company.name}</p>
                        <p className="text-xs text-gray-500">{company.domain || company.industry}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchResults.deals.length > 0 && (
                <div className="p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Fırsatlar</h4>
                  {searchResults.deals.map(deal => (
                    <div 
                      key={deal.id} 
                      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        handleNavigation('deals');
                        setShowSearchResults(false);
                        setSearchTerm('');
                      }}
                    >
                      <Handshake className="w-4 h-4 text-orange-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                        <p className="text-xs text-gray-500">
                          {deal.contacts?.full_name || deal.companies?.name || 'Bilinmeyen'} - ${deal.amount?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200"
            onClick={card.onClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-green-600 font-medium">{card.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Aşamaları</h3>
          {stageStats.length > 0 ? (
            <div className="space-y-4">
              {stageStats.map((stage, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleNavigation('deals')}
                >
                  <div>
                    <p className="font-medium text-gray-900">{stage.stageName}</p>
                    <p className="text-sm text-gray-600">{stage.count} fırsat</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${stage.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz aktif pipeline aşaması bulunmuyor</p>
              <button
                onClick={() => handleNavigation('deals')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
              >
                İlk fırsatınızı oluşturun
              </button>
            </div>
          )}
        </div>

        {/* Recent Deals */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Son Fırsatlar</h3>
            <button
              onClick={() => handleNavigation('deals')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              Tümünü Gör
            </button>
          </div>
          {recentDeals.length > 0 ? (
            <div className="space-y-4">
              {recentDeals.map((deal) => (
                <div 
                  key={deal.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleNavigation('deals')}
                >
                  <div>
                    <p className="font-medium text-gray-900">{deal.title}</p>
                    <p className="text-sm text-gray-600">
                      {deal.contacts?.full_name || deal.companies?.name || 'Bilinmeyen'}
                    </p>
                    <p className="text-xs text-gray-500">{deal.pipeline_stages?.name || 'Aşama belirtilmemiş'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${deal.amount?.toLocaleString() || '0'}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      deal.status === 'won' 
                        ? 'bg-green-100 text-green-800'
                        : deal.status === 'lost'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {deal.status === 'won' ? 'Kazanıldı' : deal.status === 'lost' ? 'Kaybedildi' : 'Aktif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Handshake className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz fırsat bulunmuyor</p>
              <button
                onClick={() => handleNavigation('deals')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
              >
                İlk fırsatınızı oluşturun
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleNavigation('contacts')}
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group hover:scale-105 transform duration-200"
          >
            <Users className="w-5 h-5 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-blue-900">Yeni Kişi Ekle</span>
          </button>
          <button 
            onClick={() => handleNavigation('companies')}
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group hover:scale-105 transform duration-200"
          >
            <Building2 className="w-5 h-5 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-green-900">Yeni Şirket Ekle</span>
          </button>
          <button 
            onClick={() => handleNavigation('deals')}
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group hover:scale-105 transform duration-200"
          >
            <Handshake className="w-5 h-5 text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-purple-900">Yeni Fırsat Ekle</span>
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performans Özeti</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors" onClick={() => handleNavigation('deals')}>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{((stats.wonDeals / Math.max(stats.totalDeals, 1)) * 100).toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Kazanma Oranı</p>
          </div>
          <div className="text-center cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors" onClick={() => handleNavigation('deals')}>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${stats.totalDeals > 0 ? Math.round(stats.totalValue / stats.totalDeals).toLocaleString() : '0'}
            </p>
            <p className="text-sm text-gray-600">Ortalama Fırsat Değeri</p>
          </div>
          <div className="text-center cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors" onClick={() => handleNavigation('deals')}>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.openDeals}</p>
            <p className="text-sm text-gray-600">Aktif Pipeline</p>
          </div>
        </div>
      </div>
    </div>
  );
}