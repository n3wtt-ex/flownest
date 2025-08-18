import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Globe, Plus, Filter, Eye, MoreHorizontal, FileText, Trash2, Edit3, Check, X } from 'lucide-react';
import { Lead as LeadType } from '../types';
import { supabase } from '../lib/supabase';

// Refresh icon component
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
);

export function Leads() {
  const [leads, setLeads] = useState<LeadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<LeadType[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<'apollo' | 'google_maps' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'New' | 'Verified' | 'Skipped'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<LeadType>>({});

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Map Supabase data to our Lead type
      const mappedLeads: LeadType[] = data.map(lead => ({
        id: lead.id.toString(),
        name: lead.name,
        email: lead.email,
        linkedin: lead.linkedin,
        linkedinURL: lead.linkedin_url,
        jobTitle: lead.job_title,
        companyName: lead.company_name,
        location: lead.location,
        country: lead.country,
        website: lead.website,
        sector: lead.sector,
        status: lead.status as 'New' | 'Verified' | 'Skipped',
        campaign_id: lead.campaign_id,
        lead_id: lead.lead_id,
        created_at: lead.created_at
      }));

      setLeads(mappedLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

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
      // Provider'a göre farklı webhook URL'leri kullan
      let webhookUrl = 'https://n8n.flownests.org/webhook-test/e51a1c60-517e-4473-a70b-ef289cda37b5';
      
      if (selectedProvider === 'google_maps') {
        // Google Maps için aynı URL'yi kullanabiliriz veya farklı bir URL verebilirsiniz
        webhookUrl = 'https://n8n.flownests.org/webhook-test/e51a1c60-517e-4473-a70b-ef289cda37b5';
      } else if (selectedProvider === 'apollo') {
        // Apollo için farklı bir URL verebilirsiniz
        // webhookUrl = 'https://n8n.flownests.org/webhook/apollo-refresh';
      }
      
      const response = await fetch(webhookUrl, {
        method: 'GET', // POST yerine GET methodu
      });
      
      if (response.ok) {
        const rawData = await response.json();
        console.log('Webhook response data:', rawData);
        
        // Google Maps verilerini parse et
        let parsedLeads = [];
        
        if (selectedProvider === 'google_maps' && Array.isArray(rawData) && rawData.length > 0) {
          // Google Maps verilerini parse et
          parsedLeads = rawData.map((item, index) => {
            // Google Maps veri yapısına göre alanları çıkar
            const name = item.name || item.title || 'N/A';
            const website = item.website || item.web || null;
            const email = item.email || null;
            const phone = item.phone || item.telephone || null;
            const address = item.address || null;
            const rating = item.rating || null;
            const reviews = item.reviews || null;
            
            return {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + index,
              name: name,
              email: email,
              linkedin: null,
              linkedinURL: null,
              jobTitle: null,
              companyName: name,
              location: address, // Address'i location olarak kullan
              country: null,
              website: website,
              sector: null,
              status: 'New',
              campaign_id: null,
              lead_id: null,
              created_at: new Date().toISOString(),
              // Ekstra alanlar (isteğe bağlı)
              phone: phone,
              rating: rating,
              reviews: reviews
            };
          });
        } else {
          // Diğer provider'lar için veya veri formatı farklıysa mock data kullan
          parsedLeads = [
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
            }
          ];
        }
        
        setSearchResults(parsedLeads);
        console.log('Refresh webhook executed successfully');
      } else {
        // Use mock data even if webhook fails
        console.warn('Refresh webhook failed, using mock data:', response.status);
        const mockLeads = [
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
          }
        ];
        
        const newResults = mockLeads.map(lead => ({
          ...lead,
          id: Date.now().toString() + Math.random(),
          status: 'New' as const,
          created_at: new Date().toISOString()
        }));
        
        setSearchResults(newResults);
      }
    } catch (error) {
      // Use mock data even if webhook fails
      console.warn('Refresh webhook error, using mock data:', error);
      const mockLeads = [
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
        }
      ];
      
      const newResults = mockLeads.map(lead => ({
        ...lead,
        id: Date.now().toString() + Math.random(),
        status: 'New' as const,
        created_at: new Date().toISOString()
      }));
      
      setSearchResults(newResults);
    } finally {
      setIsRefreshing(false);
      setShowResults(true);
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
          const rawData = await response.json();
          console.log('Search webhook response data:', rawData);
          
          // Google Maps verilerini parse et
          let parsedLeads = [];
          
          if (Array.isArray(rawData) && rawData.length > 0) {
            // Google Maps verilerini parse et
            parsedLeads = rawData.map((item, index) => {
              // Google Maps veri yapısına göre alanları çıkar
              const name = item.name || item.title || 'N/A';
              const website = item.website || item.web || null;
              const email = item.email || null;
              const phone = item.phone || item.telephone || null;
              const address = item.address || null;
              const rating = item.rating || null;
              const reviews = item.reviews || null;
              
              return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + index,
                name: name,
                email: email,
                linkedin: null,
                linkedinURL: null,
                jobTitle: null,
                companyName: name,
                location: address, // Address'i location olarak kullan
                country: null,
                website: website,
                sector: null,
                status: 'New',
                campaign_id: null,
                lead_id: null,
                created_at: new Date().toISOString(),
                // Ekstra alanlar (isteğe bağlı)
                phone: phone,
                rating: rating,
                reviews: reviews
              };
            });
          } else {
            // Veri formatı farklıysa mock data kullan
            parsedLeads = [
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
              }
            ];
          }
          
          setSearchResults(parsedLeads);
          console.log('Webhook sent successfully');
        } else {
          console.error('Webhook failed:', response.status);
          // Mock data kullan
          const mockLeads = [
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
            }
          ];
          
          const newResults = mockLeads.map(lead => ({
            ...lead,
            id: Date.now().toString() + Math.random(),
            status: 'New' as const,
            created_at: new Date().toISOString()
          }));
          
          setSearchResults(newResults);
        }
      } catch (error) {
        console.error('Webhook error:', error);
        // Mock data kullan
        const mockLeads = [
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
          }
        ];
        
        const newResults = mockLeads.map(lead => ({
          ...lead,
          id: Date.now().toString() + Math.random(),
          status: 'New' as const,
          created_at: new Date().toISOString()
        }));
        
        setSearchResults(newResults);
      }
    }
    
    // Apollo için simülasyon
    setTimeout(() => {
      if (selectedProvider !== 'google_maps') {
        const mockLeads = [
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
          }
        ];
        
        const newResults = mockLeads.map(lead => ({
          ...lead,
          id: Date.now().toString() + Math.random(),
          status: 'New' as const,
          created_at: new Date().toISOString()
        }));
        
        setSearchResults(newResults);
      }
      
      setIsSearching(false);
      
      // Show results for Google Maps after search
      if (selectedProvider === 'google_maps') {
        setShowResults(true);
      }
    }, 2000);
  };

  const addToLeads = async (lead: LeadType) => {
    try {
      // Supabase'e lead ekle
      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: lead.name,
          email: lead.email,
          linkedin: lead.linkedin,
          linkedin_url: lead.linkedinURL,
          job_title: lead.jobTitle,
          company_name: lead.companyName,
          location: lead.location,
          country: lead.country,
          website: lead.website,
          sector: lead.sector,
          status: lead.status,
          campaign_id: lead.campaign_id,
          lead_id: lead.lead_id,
          created_at: lead.created_at
        })
        .select();

      if (error) {
        throw error;
      }

      // localStorage'ı güncelle
      setLeads(prev => [...prev, lead]);
      
      // Search sonuçlarından kaldır
      const updatedResults = searchResults.filter(l => l.id !== lead.id);
      setSearchResults(updatedResults);
    } catch (err) {
      console.error('Error adding lead to Supabase:', err);
      // localStorage'ı yine de güncelle
      setLeads(prev => [...prev, lead]);
      
      // Search sonuçlarından kaldır
      const updatedResults = searchResults.filter(l => l.id !== lead.id);
      setSearchResults(updatedResults);
    }
  };

  const updateLeadStatus = async (leadId: string, status: 'New' | 'Verified' | 'Skipped') => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadId);

      if (error) {
        throw error;
      }

      // Update local state
      const updatedLeads = leads.map(lead => 
        lead.id === leadId ? { ...lead, status } : lead
      );
      setLeads(updatedLeads);
    } catch (err) {
      console.error('Error updating lead status:', err);
      setError('Failed to update lead status');
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) {
        throw error;
      }

      // Update local state
      const updatedLeads = leads.filter(lead => lead.id !== leadId);
      setLeads(updatedLeads);
    } catch (err) {
      console.error('Error deleting lead:', err);
      setError('Failed to delete lead');
    }
  };

  const startEditing = (lead: LeadType) => {
    setEditingLeadId(lead.id);
    setEditForm({ ...lead });
  };

  const saveEdit = async () => {
    if (!editingLeadId) return;
    
    try {
      // Map editForm to Supabase column names
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        linkedin: editForm.linkedin,
        linkedin_url: editForm.linkedinURL,
        job_title: editForm.jobTitle,
        company_name: editForm.companyName,
        location: editForm.location,
        country: editForm.country,
        website: editForm.website,
        sector: editForm.sector,
        status: editForm.status,
        campaign_id: editForm.campaign_id,
        lead_id: editForm.lead_id
      };

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', editingLeadId);

      if (error) {
        throw error;
      }

      // Update local state
      const updatedLeads = leads.map(lead => 
        lead.id === editingLeadId ? { ...lead, ...editForm } as LeadType : lead
      );
      setLeads(updatedLeads);
      
      setEditingLeadId(null);
      setEditForm({});
    } catch (err) {
      console.error('Error updating lead:', err);
      setError('Failed to update lead');
    }
  };

  const cancelEdit = () => {
    setEditingLeadId(null);
    setEditForm({});
  };

  const handleEditChange = (field: keyof LeadType, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
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
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Skipped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResults = leads.filter(lead => {
    if (statusFilter === 'all') return true;
    return lead.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={fetchLeads}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                    <option value="New">New</option>
                    <option value="Verified">Verified</option>
                    <option value="Skipped">Skipped</option>
                  </select>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {searchResults.length > 0 && (
                <div className="text-sm text-gray-600">
                  {searchResults.length} results found
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
              ) : isRefreshing && selectedProvider === 'google_maps' ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="text-gray-600">Refreshing leads...</div>
                </div>
              ) : selectedProvider === 'google_maps' && !showResults && searchResults.length > 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Message Sent Successfully</h3>
                  <p className="text-gray-600">Your message has been sent via webhook to n8n.</p>
                </div>
              ) : searchResults.length === 0 ? (
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone/Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {searchResults.map((lead, index) => (
                        <motion.tr
                          key={lead.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {lead.name || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.companyName || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.jobTitle || lead.phone || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.email || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getSourceColor(selectedProvider || 'apollo')}`}>
                              {getSourceIcon(selectedProvider || 'apollo')}
                              <span className="ml-1 capitalize">{selectedProvider ? selectedProvider.replace('_', ' ') : 'apollo'}</span>
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              {lead.status === 'New' && (
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
            className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Leads</h2>
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
          </motion.div>
        )}

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