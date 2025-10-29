import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Globe, Plus, Filter, Eye, MoreHorizontal, FileText, Trash2, Edit3, Check, X, ChevronDown } from 'lucide-react';
import { Lead as LeadType } from '../types';
import { supabase } from '../lib/supabase';
import { useCampaigns } from '../contexts/CampaignsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useOrganization } from '../contexts/OrganizationContext';

// Refresh icon component
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
);

export function Leads() {
  const { language } = useLanguage();
  const { currentOrganization } = useOrganization();
  const [leads, setLeads] = useState<LeadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<LeadType[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<'apollo' | 'google_maps' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'New' | 'Verified' | 'Skipped' | 'apollo_lead'>('all');
  const [sectorFilter, setSectorFilter] = useState<'all' | string>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<LeadType>>({});
  const [campaignDropdownOpen, setCampaignDropdownOpen] = useState<{ [key: string]: boolean }>({});
  
  const { campaigns, loading: campaignsLoading, error: campaignsError } = useCampaigns();
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(dropdownRefs.current).forEach(leadId => {
        if (dropdownRefs.current[leadId] && !dropdownRefs.current[leadId]!.contains(event.target as Node)) {
          setCampaignDropdownOpen(prev => ({ ...prev, [leadId]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddToCampaign = async (leadId: string, campaignId: string) => {
    try {
      // Close the dropdown
      setCampaignDropdownOpen(prev => ({ ...prev, [leadId]: false }));
      
      // Find the lead object
      const lead = leads.find(l => l.id === leadId);
      if (!lead) {
        throw new Error('Lead not found');
      }
      
      // Send webhook request with all lead information
      const response = await fetch('https://n8n.flownests.org/webhook/f0117984-5614-470c-8e23-a0428357e83c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organization-ID': currentOrganization?.id || 'default-org'
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          lead_id: leadId,
          lead_data: lead
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}`);
      }
      
      const webhookResponse = await response.json();
      const returnedLeadId = webhookResponse.lead_id;
      
      // Update the lead in Supabase
      const { error: updateError } = await supabase
        .from('leads')
        .update({ 
          campaign_id: campaignId,
          lead_id: returnedLeadId
        })
        .eq('id', leadId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      const updatedLeads = leads.map(l => 
        l.id === leadId ? { ...l, campaign_id: campaignId, lead_id: returnedLeadId } : l
      );
      setLeads(updatedLeads);
      
      console.log('Lead successfully added to campaign');
    } catch (err) {
      console.error('Error adding lead to campaign:', err);
      setError('Failed to add lead to campaign');
    }
  };

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
        // Apollo için yeni webhook URL
        webhookUrl = 'https://n8n.flownests.org/webhook-test/f784a0cc-681e-48d4-a08d-268ee71a8546';
      }
      
      const response = await fetch(webhookUrl, {
        method: 'GET', // POST yerine GET methodu
      });
      
      if (response.ok) {
        const rawData = await response.json();
        console.log('Webhook response data:', rawData);
        
        // Provider'a göre veri parse etme
        let parsedLeads = [];
        
        if (selectedProvider === 'google_maps' && Array.isArray(rawData) && rawData.length > 0) {
          // Google Maps verilerini parse et
          parsedLeads = rawData.map((item, index) => {
            // Google Maps veri yapısına göre alanları çıkar
            // Önce item içindeki payload veya direkt alanlara bak
            const data = item.payload || item;
            
            const companyName = data.Name || data.name || data.title || data.company || 'N/A';
            const website = data.web || data.website || null;
            const email = data.mail || data.email || null;
            const phone = data.phone || data.telephone || data.phoneNumber || null;
            const address = data.address || data.location || null;
            const rating = data.rating || null;
            const reviews = data.reviews || null;
            
            return {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + index,
              name: null, // Kişi ismi mevcut değil
              email: email,
              linkedin: null,
              linkedinURL: null,
              jobTitle: null,
              companyName: companyName, // Name yerine company name
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
        } else if (selectedProvider === 'apollo' && Array.isArray(rawData) && rawData.length > 0) {
          // Apollo verilerini parse et
          parsedLeads = rawData.map((item, index) => {
            // Apollo veri yapısına göre alanları çıkar
            const data = item.payload || item;
            
            const firstName = data.firstName || '';
            const lastName = data.lastName || '';
            const fullName = firstName && lastName ? `${firstName} ${lastName}` : (firstName || lastName || 'N/A');
            const emailAddress = data.emailAddress || null;
            const linkedInURL = data.linkedInURL || null;
            const jobTitle = data.jobTitle || null;
            const companyName = data.companyName || 'N/A';
            const location = data.location || null;
            const country = data.country || null;
            const websiteURL = data.websiteURL || null;
            const businessIndustry = data.businessIndustry || null; // Sector olarak kullan
            const seniority = data.seniority || null;
            const number = data.number || null;
            const status = data.status || 'apollo_lead'; // Sabit olarak apollo_lead
            
            return {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + index,
              name: fullName, // firstName + lastName
              email: emailAddress,
              linkedin: null,
              linkedinURL: linkedInURL,
              jobTitle: jobTitle,
              companyName: companyName,
              location: location,
              country: country,
              website: websiteURL,
              sector: businessIndustry, // businessIndustry -> sector
              status: status, // Sabit apollo_lead
              campaign_id: null,
              lead_id: null,
              created_at: new Date().toISOString(),
              // Ekstra alanlar
              seniority: seniority,
              phone: number
            };
          });
        } else {
          // Diğer durumlar için mock data kullan
          if (selectedProvider === 'apollo') {
            parsedLeads = [
              {
                id: '1',
                name: 'John Smith',
                email: 'john@techcorp.com',
                linkedin: null,
                linkedinURL: 'https://linkedin.com/in/johnsmith',
                jobTitle: 'VP of Sales',
                companyName: 'TechCorp Inc.',
                location: 'San Francisco, CA',
                country: 'USA',
                website: 'https://techcorp.com',
                sector: 'Technology',
                status: 'apollo_lead',
                campaign_id: 'campaign-1',
                lead_id: 'lead-1',
                created_at: '2024-01-15T10:30:00Z',
                seniority: 'Executive',
                phone: '(555) 123-4567'
              },
              {
                id: '2',
                name: 'Sarah Johnson',
                email: 'sarah@innovate.io',
                linkedin: null,
                linkedinURL: 'https://linkedin.com/in/sarahjohnson',
                jobTitle: 'Marketing Director',
                companyName: 'Innovate Solutions',
                location: 'New York, NY',
                country: 'USA',
                website: 'https://innovate.io',
                sector: 'Marketing',
                status: 'apollo_lead',
                campaign_id: 'campaign-2',
                lead_id: 'lead-2',
                created_at: '2024-01-15T11:45:00Z',
                seniority: 'Director',
                phone: '(555) 987-6543'
              }
            ];
          } else {
            // Google Maps mock data
            parsedLeads = [
              {
                id: '1',
                name: null,
                email: 'john@techcorp.com',
                linkedin: null,
                linkedinURL: null,
                jobTitle: null,
                companyName: 'TechCorp Inc.',
                location: 'San Francisco, CA',
                country: 'USA',
                website: 'https://techcorp.com',
                sector: null,
                status: 'New',
                campaign_id: 'campaign-1',
                lead_id: 'lead-1',
                created_at: '2024-01-15T10:30:00Z',
                phone: '(555) 123-4567',
                rating: 4.5,
                reviews: 128
              },
              {
                id: '2',
                name: null,
                email: 'sarah@innovate.io',
                linkedin: null,
                linkedinURL: null,
                jobTitle: null,
                companyName: 'Innovate Solutions',
                location: 'New York, NY',
                country: 'USA',
                website: 'https://innovate.io',
                sector: null,
                status: 'Verified',
                campaign_id: 'campaign-2',
                lead_id: 'lead-2',
                created_at: '2024-01-15T11:45:00Z',
                phone: '(555) 987-6543',
                rating: 4.8,
                reviews: 97
              }
            ];
          }
        }
        
        setSearchResults(parsedLeads);
        console.log('Refresh webhook executed successfully');
      } else {
        // Use mock data even if webhook fails
        console.warn('Refresh webhook failed, using mock data:', response.status);
        let mockLeads = [];
        
        if (selectedProvider === 'apollo') {
          mockLeads = [
            {
              id: '1',
              name: 'John Smith',
              email: 'john@techcorp.com',
              linkedin: null,
              linkedinURL: 'https://linkedin.com/in/johnsmith',
              jobTitle: 'VP of Sales',
              companyName: 'TechCorp Inc.',
              location: 'San Francisco, CA',
              country: 'USA',
              website: 'https://techcorp.com',
              sector: 'Technology',
              status: 'apollo_lead',
              campaign_id: 'campaign-1',
              lead_id: 'lead-1',
              created_at: '2024-01-15T10:30:00Z',
              seniority: 'Executive',
              phone: '(555) 123-4567'
            },
            {
              id: '2',
              name: 'Sarah Johnson',
              email: 'sarah@innovate.io',
              linkedin: null,
              linkedinURL: 'https://linkedin.com/in/sarahjohnson',
              jobTitle: 'Marketing Director',
              companyName: 'Innovate Solutions',
              location: 'New York, NY',
              country: 'USA',
              website: 'https://innovate.io',
              sector: 'Marketing',
              status: 'apollo_lead',
              campaign_id: 'campaign-2',
              lead_id: 'lead-2',
              created_at: '2024-01-15T11:45:00Z',
              seniority: 'Director',
              phone: '(555) 987-6543'
            }
          ];
        } else {
          // Google Maps mock data
          mockLeads = [
            {
              id: '1',
              name: null,
              email: 'john@techcorp.com',
              linkedin: null,
              linkedinURL: null,
              jobTitle: null,
              companyName: 'TechCorp Inc.',
              location: 'San Francisco, CA',
              country: 'USA',
              website: 'https://techcorp.com',
              sector: null,
              status: 'New',
              campaign_id: 'campaign-1',
              lead_id: 'lead-1',
              created_at: '2024-01-15T10:30:00Z',
              phone: '(555) 123-4567',
              rating: 4.5,
              reviews: 128
            },
            {
              id: '2',
              name: null,
              email: 'sarah@innovate.io',
              linkedin: null,
              linkedinURL: null,
              jobTitle: null,
              companyName: 'Innovate Solutions',
              location: 'New York, NY',
              country: 'USA',
              website: 'https://innovate.io',
              sector: null,
              status: 'Verified',
              campaign_id: 'campaign-2',
              lead_id: 'lead-2',
              created_at: '2024-01-15T11:45:00Z',
              phone: '(555) 987-6543',
              rating: 4.8,
              reviews: 97
            }
          ];
        }
        
        const newResults = mockLeads.map(lead => ({
          ...lead,
          id: Date.now().toString() + Math.random(),
          status: selectedProvider === 'apollo' ? 'apollo_lead' : 'New',
          created_at: new Date().toISOString()
        }));
        
        setSearchResults(newResults);
      }
    } catch (error) {
      // Use mock data even if webhook fails
      console.warn('Refresh webhook error, using mock data:', error);
      let mockLeads = [];
      
      if (selectedProvider === 'apollo') {
        mockLeads = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john@techcorp.com',
            linkedin: null,
            linkedinURL: 'https://linkedin.com/in/johnsmith',
            jobTitle: 'VP of Sales',
            companyName: 'TechCorp Inc.',
            location: 'San Francisco, CA',
            country: 'USA',
            website: 'https://techcorp.com',
            sector: 'Technology',
            status: 'apollo_lead',
            campaign_id: 'campaign-1',
            lead_id: 'lead-1',
            created_at: '2024-01-15T10:30:00Z',
            seniority: 'Executive',
            phone: '(555) 123-4567'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah@innovate.io',
            linkedin: null,
            linkedinURL: 'https://linkedin.com/in/sarahjohnson',
            jobTitle: 'Marketing Director',
            companyName: 'Innovate Solutions',
            location: 'New York, NY',
            country: 'USA',
            website: 'https://innovate.io',
            sector: 'Marketing',
            status: 'apollo_lead',
            campaign_id: 'campaign-2',
            lead_id: 'lead-2',
            created_at: '2024-01-15T11:45:00Z',
            seniority: 'Director',
            phone: '(555) 987-6543'
          }
        ];
      } else {
        // Google Maps mock data
        mockLeads = [
          {
            id: '1',
            name: null,
            email: 'john@techcorp.com',
            linkedin: null,
            linkedinURL: null,
            jobTitle: null,
            companyName: 'TechCorp Inc.',
            location: 'San Francisco, CA',
            country: 'USA',
            website: 'https://techcorp.com',
            sector: null,
            status: 'New',
            campaign_id: 'campaign-1',
            lead_id: 'lead-1',
            created_at: '2024-01-15T10:30:00Z',
            phone: '(555) 123-4567',
            rating: 4.5,
            reviews: 128
          },
          {
            id: '2',
            name: null,
            email: 'sarah@innovate.io',
            linkedin: null,
            linkedinURL: null,
            jobTitle: null,
            companyName: 'Innovate Solutions',
            location: 'New York, NY',
            country: 'USA',
            website: 'https://innovate.io',
            sector: null,
            status: 'Verified',
            campaign_id: 'campaign-2',
            lead_id: 'lead-2',
            created_at: '2024-01-15T11:45:00Z',
            phone: '(555) 987-6543',
            rating: 4.8,
            reviews: 97
          }
        ];
      }
      
      const newResults = mockLeads.map(lead => ({
        ...lead,
        id: Date.now().toString() + Math.random(),
        status: selectedProvider === 'apollo' ? 'apollo_lead' : 'New',
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
            'X-Organization-ID': currentOrganization?.id || 'default-org'
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
              // Önce item içindeki payload veya direkt alanlara bak
              const data = item.payload || item;
              
              const companyName = data.Name || data.name || data.title || data.company || 'N/A';
              const website = data.web || data.website || null;
              const email = data.mail || data.email || null;
              const phone = data.phone || data.telephone || data.phoneNumber || null;
              const address = data.address || data.location || null;
              const rating = data.rating || null;
              const reviews = data.reviews || null;
              
              return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + index,
                name: null, // Kişi ismi mevcut değil
                email: email,
                linkedin: null,
                linkedinURL: null,
                jobTitle: null,
                companyName: companyName, // Name yerine company name
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
                name: null,
                email: 'john@techcorp.com',
                linkedin: null,
                linkedinURL: null,
                jobTitle: null,
                companyName: 'TechCorp Inc.',
                location: 'San Francisco, CA',
                country: 'USA',
                website: 'https://techcorp.com',
                sector: null,
                status: 'New',
                campaign_id: 'campaign-1',
                lead_id: 'lead-1',
                created_at: '2024-01-15T10:30:00Z',
                phone: '(555) 123-4567',
                rating: 4.5,
                reviews: 128
              },
              {
                id: '2',
                name: null,
                email: 'sarah@innovate.io',
                linkedin: null,
                linkedinURL: null,
                jobTitle: null,
                companyName: 'Innovate Solutions',
                location: 'New York, NY',
                country: 'USA',
                website: 'https://innovate.io',
                sector: null,
                status: 'Verified',
                campaign_id: 'campaign-2',
                lead_id: 'lead-2',
                created_at: '2024-01-15T11:45:00Z',
                phone: '(555) 987-6543',
                rating: 4.8,
                reviews: 97
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
              name: null,
              email: 'john@techcorp.com',
              linkedin: null,
              linkedinURL: null,
              jobTitle: null,
              companyName: 'TechCorp Inc.',
              location: 'San Francisco, CA',
              country: 'USA',
              website: 'https://techcorp.com',
              sector: null,
              status: 'New',
              campaign_id: 'campaign-1',
              lead_id: 'lead-1',
              created_at: '2024-01-15T10:30:00Z',
              phone: '(555) 123-4567',
              rating: 4.5,
              reviews: 128
            },
            {
              id: '2',
              name: null,
              email: 'sarah@innovate.io',
              linkedin: null,
              linkedinURL: null,
              jobTitle: null,
              companyName: 'Innovate Solutions',
              location: 'New York, NY',
              country: 'USA',
              website: 'https://innovate.io',
              sector: null,
              status: 'Verified',
              campaign_id: 'campaign-2',
              lead_id: 'lead-2',
              created_at: '2024-01-15T11:45:00Z',
              phone: '(555) 987-6543',
              rating: 4.8,
              reviews: 97
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
            name: null,
            email: 'john@techcorp.com',
            linkedin: null,
            linkedinURL: null,
            jobTitle: null,
            companyName: 'TechCorp Inc.',
            location: 'San Francisco, CA',
            country: 'USA',
            website: 'https://techcorp.com',
            sector: null,
            status: 'New',
            campaign_id: 'campaign-1',
            lead_id: 'lead-1',
            created_at: '2024-01-15T10:30:00Z',
            phone: '(555) 123-4567',
            rating: 4.5,
            reviews: 128
          },
          {
            id: '2',
            name: null,
            email: 'sarah@innovate.io',
            linkedin: null,
            linkedinURL: null,
            jobTitle: null,
            companyName: 'Innovate Solutions',
            location: 'New York, NY',
            country: 'USA',
            website: 'https://innovate.io',
            sector: null,
            status: 'Verified',
            campaign_id: 'campaign-2',
            lead_id: 'lead-2',
            created_at: '2024-01-15T11:45:00Z',
            phone: '(555) 987-6543',
            rating: 4.8,
            reviews: 97
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
    // Apollo için webhook integration
    else if (selectedProvider === 'apollo') {
      try {
        // Apollo için webhook çağrısı
        const response = await fetch('https://n8n.flownests.org/webhook-test/f784a0cc-681e-48d4-a08d-268ee71a8546', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Organization-ID': currentOrganization?.id || 'default-org'
          },
          body: JSON.stringify({
            query: searchQuery,
            source: 'apollo',
            timestamp: new Date().toISOString()
          }),
        });
        
        if (response.ok) {
          const rawData = await response.json();
          console.log('Apollo search webhook response data:', rawData);
          
          // Apollo verilerini parse et
          let parsedLeads = [];
          
          if (Array.isArray(rawData) && rawData.length > 0) {
            // Apollo verilerini parse et
            parsedLeads = rawData.map((item, index) => {
              // Apollo veri yapısına göre alanları çıkar
              const data = item.payload || item;
              
              const firstName = data.firstName || '';
              const lastName = data.lastName || '';
              const fullName = firstName && lastName ? `${firstName} ${lastName}` : (firstName || lastName || 'N/A');
              const emailAddress = data.emailAddress || null;
              const linkedInURL = data.linkedInURL || null;
              const jobTitle = data.jobTitle || null;
              const companyName = data.companyName || 'N/A';
              const location = data.location || null;
              const country = data.country || null;
              const websiteURL = data.websiteURL || null;
              const businessIndustry = data.businessIndustry || null; // Sector olarak kullan
              const seniority = data.seniority || null;
              const number = data.number || null;
              const status = data.status || 'apollo_lead'; // Sabit olarak apollo_lead
              
              return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + index,
                name: fullName, // firstName + lastName
                email: emailAddress,
                linkedin: null,
                linkedinURL: linkedInURL,
                jobTitle: jobTitle,
                companyName: companyName,
                location: location,
                country: country,
                website: websiteURL,
                sector: businessIndustry, // businessIndustry -> sector
                status: status, // Sabit apollo_lead
                campaign_id: null,
                lead_id: null,
                created_at: new Date().toISOString(),
                // Ekstra alanlar
                seniority: seniority,
                phone: number
              };
            });
          } else {
            // Veri formatı farklıysa mock data kullan
            parsedLeads = [
              {
                id: '1',
                name: 'John Smith',
                email: 'john@techcorp.com',
                linkedin: null,
                linkedinURL: 'https://linkedin.com/in/johnsmith',
                jobTitle: 'VP of Sales',
                companyName: 'TechCorp Inc.',
                location: 'San Francisco, CA',
                country: 'USA',
                website: 'https://techcorp.com',
                sector: 'Technology',
                status: 'apollo_lead',
                campaign_id: 'campaign-1',
                lead_id: 'lead-1',
                created_at: '2024-01-15T10:30:00Z',
                seniority: 'Executive',
                phone: '(555) 123-4567'
              },
              {
                id: '2',
                name: 'Sarah Johnson',
                email: 'sarah@innovate.io',
                linkedin: null,
                linkedinURL: 'https://linkedin.com/in/sarahjohnson',
                jobTitle: 'Marketing Director',
                companyName: 'Innovate Solutions',
                location: 'New York, NY',
                country: 'USA',
                website: 'https://innovate.io',
                sector: 'Marketing',
                status: 'apollo_lead',
                campaign_id: 'campaign-2',
                lead_id: 'lead-2',
                created_at: '2024-01-15T11:45:00Z',
                seniority: 'Director',
                phone: '(555) 987-6543'
              }
            ];
          }
          
          setSearchResults(parsedLeads);
          console.log('Apollo webhook sent successfully');
        } else {
          console.error('Apollo webhook failed:', response.status);
          // Mock data kullan
          const mockLeads = [
            {
              id: '1',
              name: 'John Smith',
              email: 'john@techcorp.com',
              linkedin: null,
              linkedinURL: 'https://linkedin.com/in/johnsmith',
              jobTitle: 'VP of Sales',
              companyName: 'TechCorp Inc.',
              location: 'San Francisco, CA',
              country: 'USA',
              website: 'https://techcorp.com',
              sector: 'Technology',
              status: 'apollo_lead',
              campaign_id: 'campaign-1',
              lead_id: 'lead-1',
              created_at: '2024-01-15T10:30:00Z',
              seniority: 'Executive',
              phone: '(555) 123-4567'
            },
            {
              id: '2',
              name: 'Sarah Johnson',
              email: 'sarah@innovate.io',
              linkedin: null,
              linkedinURL: 'https://linkedin.com/in/sarahjohnson',
              jobTitle: 'Marketing Director',
              companyName: 'Innovate Solutions',
              location: 'New York, NY',
              country: 'USA',
              website: 'https://innovate.io',
              sector: 'Marketing',
              status: 'apollo_lead',
              campaign_id: 'campaign-2',
              lead_id: 'lead-2',
              created_at: '2024-01-15T11:45:00Z',
              seniority: 'Director',
              phone: '(555) 987-6543'
            }
          ];
          
          const newResults = mockLeads.map(lead => ({
            ...lead,
            id: Date.now().toString() + Math.random(),
            status: 'apollo_lead',
            created_at: new Date().toISOString()
          }));
          
          setSearchResults(newResults);
        }
      } catch (error) {
        console.error('Apollo webhook error:', error);
        // Mock data kullan
        const mockLeads = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john@techcorp.com',
            linkedin: null,
            linkedinURL: 'https://linkedin.com/in/johnsmith',
            jobTitle: 'VP of Sales',
            companyName: 'TechCorp Inc.',
            location: 'San Francisco, CA',
            country: 'USA',
            website: 'https://techcorp.com',
            sector: 'Technology',
            status: 'apollo_lead',
            campaign_id: 'campaign-1',
            lead_id: 'lead-1',
            created_at: '2024-01-15T10:30:00Z',
            seniority: 'Executive',
            phone: '(555) 123-4567'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah@innovate.io',
            linkedin: null,
            linkedinURL: 'https://linkedin.com/in/sarahjohnson',
            jobTitle: 'Marketing Director',
            companyName: 'Innovate Solutions',
            location: 'New York, NY',
            country: 'USA',
            website: 'https://innovate.io',
            sector: 'Marketing',
            status: 'apollo_lead',
            campaign_id: 'campaign-2',
            lead_id: 'lead-2',
            created_at: '2024-01-15T11:45:00Z',
            seniority: 'Director',
            phone: '(555) 987-6543'
          }
        ];
        
        const newResults = mockLeads.map(lead => ({
          ...lead,
          id: Date.now().toString() + Math.random(),
          status: 'apollo_lead',
          created_at: new Date().toISOString()
        }));
        
        setSearchResults(newResults);
      }
    }
    
    // Diğer provider'lar için simülasyon
    setTimeout(() => {
      if (selectedProvider !== 'google_maps' && selectedProvider !== 'apollo') {
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
      // Sadece kesinlikle var olan temel alanları gönder
      const insertData = {
        name: lead.name || null,
        email: lead.email || null,
        company_name: lead.companyName || null,
        status: lead.status || 'New',
        created_at: new Date().toISOString()
      };
  
      // Opsiyonel alanları kontrol ederek ekle
      if (lead.linkedinURL) insertData.linkedin_url = lead.linkedinURL;
      if (lead.jobTitle) insertData.job_title = lead.jobTitle;
      if (lead.location) insertData.location = lead.location;
      if (lead.country) insertData.country = lead.country;
      if (lead.website) insertData.website = lead.website;
      if (lead.sector) insertData.sector = lead.sector;
      if (lead.campaign_id) insertData.campaign_id = lead.campaign_id;
      if (lead.lead_id) insertData.lead_id = lead.lead_id;
  
      const { data, error } = await supabase
        .from('leads')
        .insert(insertData)
        .select();
  
      if (error) {
        throw error;
      }
  
      // Local state'i güncelle
      setLeads(prev => [...prev, lead]);
      
      // Search sonuçlarından kaldır
      const updatedResults = searchResults.filter(l => l.id !== lead.id);
      setSearchResults(updatedResults);
      
      console.log('Lead successfully added:', data);
    } catch (err) {
      console.error('Error adding lead:', err);
      
      // Fallback: sadece local state'i güncelle
      setLeads(prev => [...prev, lead]);
      const updatedResults = searchResults.filter(l => l.id !== lead.id);
      setSearchResults(updatedResults);
      
      // Hata mesajını ayarla
      setError(`Failed to save lead: ${err.message}`);
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
      case 'apollo': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'google_maps': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'apify': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'Verified': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'Skipped': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredResults = leads.filter(lead => {
    // Status filter
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    
    // Sector filter
    if (sectorFilter !== 'all' && lead.sector !== sectorFilter) return false;
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (lead.name && lead.name.toLowerCase().includes(query)) ||
        (lead.email && lead.email.toLowerCase().includes(query)) ||
        (lead.companyName && lead.companyName.toLowerCase().includes(query)) ||
        (lead.jobTitle && lead.jobTitle.toLowerCase().includes(query)) ||
        (lead.location && lead.location.toLowerCase().includes(query)) ||
        (lead.country && lead.country.toLowerCase().includes(query)) ||
        (lead.sector && lead.sector.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-background flex items-center justify-center">
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
    <div className="p-6 min-h-screen bg-background">
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
          <h1
            className="text-4xl font-bold text-foreground mb-2"
          >
            {language === 'tr' ? 'Lead Yönetimi' : 'Lead Management'}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Manage and organize your leads
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Area */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">{language === 'tr' ? 'Lead Arama' : 'Search for Leads'}</h2>
            
            {/* Provider Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">{language === 'tr' ? 'Arama Sağlayıcısını Seçin' : 'Choose Search Provider'}</label>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedProvider('apollo')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedProvider === 'apollo'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 dark:bg-blue-900/30">
                    <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="font-semibold text-foreground">Apollo</div>
                  <div className="text-sm text-muted-foreground">{language === 'tr' ? 'B2B Veritabanı' : 'B2B Database'}</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedProvider('google_maps')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedProvider === 'google_maps'
                      ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 dark:bg-green-900/30">
                    <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="font-semibold text-foreground">Google Maps</div>
                  <div className="text-sm text-muted-foreground">Local Businesses</div>
                </motion.button>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                {selectedProvider === 'google_maps' ? (language === 'tr' ? 'Webhook için Mesaj' : 'Message for Webhook') : (language === 'tr' ? 'Arama Sorgusu' : 'Search Query')}
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    selectedProvider === 'apollo' 
                      ? (language === 'tr' ? 'örn., Istanbul\'daki SaaS şirketleri' : 'e.g., SaaS companies in Istanbul') 
                      : selectedProvider === 'google_maps'
                        ? (language === 'tr' ? 'örn., lokasyon: Istanbul anahtar kelimeler: kafe' : 'e.g., location: Istanbul keywords: cafe')
                        : (language === 'tr' ? 'Arama sorgusunu girin' : 'Enter search query')
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFormIconClick}
                  disabled={!selectedProvider}
                  className="px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <label className="block text-sm font-medium text-foreground mb-2">Quick Presets</label>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider === 'apollo' ? (
                    <>
                      <button
                        onClick={() => setSearchQuery('SaaS companies 50-200 employees')}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-800/30"
                      >
                        SaaS Companies
                      </button>
                      <button
                        onClick={() => setSearchQuery('Marketing agencies in California')}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-800/30"
                      >
                        Marketing Agencies
                      </button>
                      <button
                        onClick={() => setSearchQuery(language === 'tr' ? 'Istanbul\'daki e-ticaret şirketleri' : 'e-commerce companies in Istanbul')}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-800/30"
                      >
                        {language === 'tr' ? 'E-ticaret' : 'E-commerce'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setSearchQuery(language === 'tr' ? 'Manhattan\'daki restoranlar' : 'restaurants in Manhattan')}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-800/30"
                      >
                        {language === 'tr' ? 'Restoranlar' : 'Restaurants'}
                      </button>
                      <button
                        onClick={() => setSearchQuery(language === 'tr' ? 'Los Angeles\'taki spor salonlari' : 'gyms in Los Angeles')}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-800/30"
                      >
                        {language === 'tr' ? 'Spor Salonlari' : 'Gyms'}
                      </button>
                      <button
                        onClick={() => setSearchQuery(language === 'tr' ? 'Seattle\'taki kahve dukkanlari' : 'coffee shops in Seattle')}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-800/30"
                      >
                        {language === 'tr' ? 'Kahve Dukkanlari' : 'Coffee Shops'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Search History */}
            {selectedProvider !== 'google_maps' && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="text-sm font-medium text-foreground mb-2">Recent Searches</h3>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">• SaaS companies in San Francisco</div>
                  <div className="text-sm text-muted-foreground">• Marketing agencies 10-50 employees</div>
                  <div className="text-sm text-muted-foreground">• E-commerce startups</div>
                </div>
              </div>
            )}
          </div>

          {/* Results Area */}
          <div className="bg-card rounded-2xl shadow-sm border border-border">
            {/* Results Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Search Results</h2>
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
                    className="px-3 py-1 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="all">{language === 'tr' ? 'Tüm Durumlar' : 'All Status'}</option>
                    <option value="New">{language === 'tr' ? 'Yeni' : 'New'}</option>
                    <option value="Verified">{language === 'tr' ? 'Doğrulanmış' : 'Verified'}</option>
                    <option value="Skipped">{language === 'tr' ? 'Atlanmış' : 'Skipped'}</option>
                  </select>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {searchResults.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {searchResults.length} results found
                </div>
              )}
            </div>

            {/* Results Content */}
            <div className="p-6">
              {isSearching ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <div className="text-muted-foreground">
                    {selectedProvider === 'google_maps' ? 'Sending message...' : 'Searching for leads...'}
                  </div>
                </div>
              ) : isRefreshing && selectedProvider === 'google_maps' ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="text-muted-foreground">Refreshing leads...</div>
                </div>
              ) : selectedProvider === 'google_maps' && !showResults && searchResults.length > 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-green-900/30">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">{language === 'tr' ? 'Mesaj Başarıyla Gönderildi' : 'Message Sent Successfully'}</h3>
                  <p className="text-muted-foreground">{language === 'tr' ? 'Mesajınız n8n aracılığıyla webhook ile gönderildi.' : 'Your message has been sent via webhook to n8n.'}</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">{language === 'tr' ? 'Henüz sonuç yok' : 'No results yet'}</h3>
                  <p className="text-muted-foreground">{language === 'tr' ? 'Potansiyel lead bulmak için bir arama yapın.' : 'Run a search to find potential leads.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{language === 'tr' ? 'İsim' : 'Name'}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{language === 'tr' ? 'Şirket' : 'Company'}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{language === 'tr' ? 'Pozisyon' : 'Title'}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{language === 'tr' ? 'E-posta' : 'Email'}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{language === 'tr' ? 'Telefon' : 'Phone'}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{language === 'tr' ? 'Lokasyon' : 'Location'}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{language === 'tr' ? 'Kaynak' : 'Source'}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{language === 'tr' ? 'Durum' : 'Status'}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{language === 'tr' ? 'İşlemler' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {searchResults.map((lead, index) => (
                        <motion.tr
                          key={lead.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-muted/50"
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                            {lead.name || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            {lead.company_name || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            {lead.job_title || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            {lead.email || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            {lead.phone || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            {lead.location || 'N/A'}
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
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
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
                              <button className="text-muted-foreground hover:text-foreground">
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
            className="mt-8 bg-card rounded-2xl shadow-sm border border-border p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 md:mb-0">Leads</h2>
              
              {/* Search and Filter Section */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="New">New</option>
                  <option value="Verified">Verified</option>
                  <option value="Skipped">Skipped</option>
                  <option value="apollo_lead">Apollo Lead</option>
                </select>
                
                {/* Sector Filter */}
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value as any)}
                  className="px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Sectors</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="E-commerce">E-commerce</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sector</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Campaign</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredResults.map((lead) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: parseInt(lead.id) * 0.05 }}
                      className="hover:bg-muted/50"
                    >
                      {editingLeadId === lead.id ? (
                        // Edit Mode
                        <>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editForm.name || ''}
                              onChange={(e) => handleEditChange('name', e.target.value)}
                              className="w-full px-2 py-1 border border-border rounded bg-background text-foreground"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editForm.companyName || ''}
                              onChange={(e) => handleEditChange('companyName', e.target.value)}
                              className="w-full px-2 py-1 border border-border rounded bg-background text-foreground"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editForm.jobTitle || ''}
                              onChange={(e) => handleEditChange('jobTitle', e.target.value)}
                              className="w-full px-2 py-1 border border-border rounded bg-background text-foreground"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="email"
                              value={editForm.email || ''}
                              onChange={(e) => handleEditChange('email', e.target.value)}
                              className="w-full px-2 py-1 border border-border rounded bg-background text-foreground"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editForm.phone || ''}
                              onChange={(e) => handleEditChange('phone', e.target.value)}
                              className="w-full px-2 py-1 border border-border rounded bg-background text-foreground"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editForm.location || ''}
                              onChange={(e) => handleEditChange('location', e.target.value)}
                              className="w-full px-2 py-1 border border-border rounded bg-background text-foreground"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editForm.sector || ''}
                              onChange={(e) => handleEditChange('sector', e.target.value)}
                              className="w-full px-2 py-1 border border-border rounded bg-background text-foreground"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <select
                              value={editForm.status || 'New'}
                              onChange={(e) => handleEditChange('status', e.target.value)}
                              className="px-2 py-1 border border-border rounded bg-background text-foreground"
                            >
                              <option value="New" className="dark:bg-slate-700 dark:text-white">New</option>
                              <option value="Verified" className="dark:bg-slate-700 dark:text-white">Verified</option>
                              <option value="Skipped" className="dark:bg-slate-700 dark:text-white">Skipped</option>
                              <option value="apollo_lead" className="dark:bg-slate-700 dark:text-white">Apollo Lead</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={saveEdit}
                                className="p-1 text-green-600 hover:bg-green-100 rounded dark:text-green-400 dark:hover:bg-green-900/30"
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1 text-red-600 hover:bg-red-100 rounded dark:text-red-400 dark:hover:bg-red-900/30"
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
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                            {lead.name || 'N/A'}
                            {lead.linkedinURL && (
                              <a 
                                href={lead.linkedinURL} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <span className="sr-only">LinkedIn</span>
                                <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            {lead.companyName || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            {lead.jobTitle || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            {lead.email || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            {lead.phone || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            {lead.location || 'N/A'}{lead.country ? `, ${lead.country}` : ''}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            {lead.sector || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            <div className="relative">
                              {campaignsLoading ? (
                                <div className="px-2 py-1 text-xs text-muted-foreground">
                                  Loading campaigns...
                                </div>
                              ) : campaignsError ? (
                                <div className="px-2 py-1 text-xs text-red-500 dark:text-red-400">
                                  Error loading campaigns
                                </div>
                              ) : lead.campaign_id ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs dark:bg-green-900/30 dark:text-green-200">
                                  {campaigns.find(c => c.id === lead.campaign_id)?.name || 'Unknown Campaign'}
                                </span>
                              ) : (
                                <div className="relative" ref={el => dropdownRefs.current[lead.id] = el}>
                                  <button
                                    onClick={() => setCampaignDropdownOpen(prev => ({ ...prev, [lead.id]: !prev[lead.id] }))}
                                    className="flex items-center px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition-colors dark:bg-green-600 dark:hover:bg-green-700"
                                  >
                                    Add to Campaign
                                    <ChevronDown className="w-3 h-3 ml-1" />
                                  </button>
                                  {campaignDropdownOpen[lead.id] && (
                                    <div className="absolute top-full left-0 mt-1 w-48 bg-card rounded-md shadow-lg z-10 border border-border">
                                      <div className="py-1">
                                        {campaigns.length === 0 ? (
                                          <div className="px-4 py-2 text-sm text-muted-foreground">
                                            No campaigns available
                                          </div>
                                        ) : (
                                          campaigns.map(campaign => (
                                            <button
                                              key={campaign.id}
                                              onClick={() => handleAddToCampaign(lead.id, campaign.id)}
                                              className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                                            >
                                              {campaign.name}
                                            </button>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => startEditing(lead)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:text-blue-400 dark:hover:bg-blue-900/30"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => updateLeadStatus(lead.id, 
                                  lead.status === 'New' ? 'Verified' : 
                                  lead.status === 'Verified' ? 'Skipped' : 
                                  lead.status === 'Skipped' ? 'New' : 'New')}
                                className={`p-1 rounded ${
                                  lead.status === 'New' ? 'text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30' :
                                  lead.status === 'Verified' ? 'text-muted-foreground hover:bg-muted' :
                                  lead.status === 'Skipped' ? 'text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30' :
                                  'text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30'
                                }`}
                                title={lead.status === 'New' ? 'Verify' : lead.status === 'Verified' ? 'Skip' : lead.status === 'Skipped' ? 'Mark as New' : 'Mark as New'}
                              >
                                {lead.status === 'New' ? (
                                  <Check className="w-4 h-4" />
                                ) : lead.status === 'Verified' ? (
                                  <X className="w-4 h-4" />
                                ) : lead.status === 'Skipped' ? (
                                  <Plus className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </button>
                              <button 
                                onClick={() => deleteLead(lead.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded dark:text-red-400 dark:hover:bg-red-900/30"
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
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 dark:text-white">Lead Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-900/30">
              <div className="text-sm text-blue-800 dark:text-blue-200">Total Leads</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{leads.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg dark:bg-green-900/30">
              <div className="text-sm text-green-800 dark:text-green-200">Verified</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {leads.filter(l => l.status === 'Verified').length}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
              <div className="text-sm text-gray-800 dark:text-gray-200">New</div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {leads.filter(l => l.status === 'New').length}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg dark:bg-red-900/30">
              <div className="text-sm text-red-800 dark:text-red-200">Skipped</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {leads.filter(l => l.status === 'Skipped').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}