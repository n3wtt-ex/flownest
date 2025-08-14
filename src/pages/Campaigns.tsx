import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Play, Pause, BarChart3, Users, Mail, MousePointer, MessageSquare, DollarSign, Search, Filter, MoreHorizontal, Eye, Send, Trash2, Edit2, Upload, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Switch } from './components/ui/switch';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  sent: number;
  clicks: number;
  replied: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  positiveReplyRate: number;
  opportunities: number;
  conversions: number;
  revenue: number;
  createdAt: string;
}

interface Lead {
  id: string;
  email: string;
  provider: string;
  status: 'completed' | 'pending' | 'failed';
  contact: string;
  company: string;
  expanded?: boolean;
}

interface SequenceStep {
  id: string;
  subject: string;
  body: string;
  variants: number;
}

interface PersonalizedEmail {
  step: number;
  subject: string;
  body: string;
}

interface LeadPersonalization {
  emails: PersonalizedEmail[];
  linkedinStatus: string;
  linkedinMessage: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'SaaS Outreach Q1',
    status: 'completed',
    progress: 100,
    sent: 1250,
    clicks: 89,
    replied: 45,
    openRate: 34.2,
    clickRate: 7.1,
    replyRate: 3.6,
    positiveReplyRate: 2.1,
    opportunities: 12,
    conversions: 3,
    revenue: 15000,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Enterprise Leads',
    status: 'active',
    progress: 67,
    sent: 890,
    clicks: 67,
    replied: 23,
    openRate: 28.9,
    clickRate: 7.5,
    replyRate: 2.6,
    positiveReplyRate: 1.8,
    opportunities: 8,
    conversions: 1,
    revenue: 8500,
    createdAt: '2024-02-01'
  }
];

const mockLeads: Lead[] = [
  {
    id: '1',
    email: 'john@techcorp.com',
    provider: 'Gmail',
    status: 'completed',
    contact: 'John Smith',
    company: 'TechCorp Inc.'
  },
  {
    id: '2',
    email: 'sarah@innovate.io',
    provider: 'Outlook',
    status: 'completed',
    contact: 'Sarah Johnson',
    company: 'Innovate Solutions'
  },
  {
    id: '3',
    email: 'mike@startup.co',
    provider: 'Gmail',
    status: 'pending',
    contact: 'Mike Chen',
    company: 'Startup Co.'
  }
];

const mockSequence: SequenceStep[] = [
  {
    id: '1',
    subject: 'Quick question about {{Company}}',
    body: 'Hi {{FirstName}},\n\nI noticed {{Company}} is doing great work in the {{Industry}} space. I had a quick question about your current approach to {{PainPoint}}.\n\nWould you be open to a brief chat this week?\n\nBest,\n{{SenderName}}',
    variants: 2
  },
  {
    id: '2',
    subject: 'Following up on {{Company}}',
    body: 'Hi {{FirstName}},\n\nI wanted to follow up on my previous email about {{Company}}\'s {{PainPoint}} strategy.\n\nI have some insights that might be valuable for your team. Would you have 15 minutes for a quick call?\n\nBest regards,\n{{SenderName}}',
    variants: 1
  }
];

const mockPersonalization: Record<string, LeadPersonalization> = {
  '1': {
    emails: [
      {
        step: 1,
        subject: 'Quick question about TechCorp',
        body: 'Hi John,\n\nI noticed TechCorp is doing great work in the technology space. I had a quick question about your current approach to digital transformation.\n\nWould you be open to a brief chat this week?\n\nBest,\nSales Team'
      },
      {
        step: 2,
        subject: 'Following up on TechCorp',
        body: 'Hi John,\n\nI wanted to follow up on my previous email about TechCorp\'s digital transformation strategy.\n\nI have some insights that might be valuable for your team. Would you have 15 minutes for a quick call?\n\nBest regards,\nSales Team'
      },
      {
        step: 3,
        subject: 'Final follow-up',
        body: 'Hi John,\n\nThis is my final follow-up regarding our conversation about digital transformation solutions.\n\nIf you\'re interested, please let me know. Otherwise, I\'ll respect your time.\n\nBest,\nSales Team'
      }
    ],
    linkedinStatus: 'Connected',
    linkedinMessage: 'Hi John, I sent you an email about digital transformation solutions for TechCorp. Would love to connect and discuss further!'
  }
};

export function Campaigns() {
  const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>('campaigns', mockCampaigns);
  const [leads, setLeads] = useLocalStorage<Lead[]>('leads', mockLeads);
  const [sequences, setSequences] = useLocalStorage<SequenceStep[]>('sequences', mockSequence);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddLeadsModalOpen, setIsAddLeadsModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<SequenceStep>(mockSequence[0]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [addLeadMethod, setAddLeadMethod] = useState<'manual' | 'import'>('manual');

  // Scheduling options state
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [dailyLimit, setDailyLimit] = useState(50);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [openTracking, setOpenTracking] = useState(true);
  const [clickTracking, setClickTracking] = useState(true);
  const [replyTracking, setReplyTracking] = useState(true);

  const createCampaign = () => {
    if (!newCampaignName.trim()) return;

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaignName,
      status: 'paused',
      progress: 0,
      sent: 0,
      clicks: 0,
      replied: 0,
      openRate: 0,
      clickRate: 0,
      replyRate: 0,
      positiveReplyRate: 0,
      opportunities: 0,
      conversions: 0,
      revenue: 0,
      createdAt: new Date().toISOString()
    };

    setCampaigns(prev => [...prev, newCampaign]);
    setNewCampaignName('');
    setIsCreateModalOpen(false);
  };

  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' }
        : campaign
    ));
    
    // Update selected campaign if it's the one being toggled
    if (selectedCampaign && selectedCampaign.id === campaignId) {
      setSelectedCampaign(prev => prev ? {
        ...prev,
        status: prev.status === 'active' ? 'paused' : 'active'
      } : null);
    }
  };

  const deleteCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
    setOpenDropdown(null);
  };

  const deleteSelectedCampaigns = () => {
    setCampaigns(prev => prev.filter(campaign => !selectedCampaigns.includes(campaign.id)));
    setSelectedCampaigns([]);
  };

  const deleteSelectedLeads = () => {
    setLeads(prev => prev.filter(lead => !selectedLeads.includes(lead.id)));
    setSelectedLeads([]);
  };

  const startEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign.id);
    setEditName(campaign.name);
    setOpenDropdown(null);
  };

  const saveEditCampaign = () => {
    if (!editName.trim()) return;
    
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === editingCampaign 
        ? { ...campaign, name: editName }
        : campaign
    ));
    setEditingCampaign(null);
    setEditName('');
  };

  const cancelEditCampaign = () => {
    setEditingCampaign(null);
    setEditName('');
  };

  const toggleCampaignSelection = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const toggleAllCampaigns = () => {
    if (selectedCampaigns.length === campaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(campaigns.map(c => c.id));
    }
  };

  const toggleAllLeads = () => {
    const filteredLeads = leads.filter(lead => 
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  const toggleLeadExpansion = (leadId: string) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, expanded: !lead.expanded }
        : lead
    ));
  };

  const handlePersonalize = async (leadEmail: string) => {
    try {
      const response = await fetch('https://n8n.flownests.org/webhook/ec3cae8c-e51b-46cc-806d-bad0ad47820e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: leadEmail,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        console.log('Personalization webhook triggered successfully for:', leadEmail);
      }
    } catch (error) {
      console.error('Error triggering personalization webhook:', error);
    }
  };

  const addManualLead = () => {
    if (!newLeadEmail.trim() || !newLeadName.trim() || !newLeadCompany.trim()) return;

    const newLead: Lead = {
      id: Date.now().toString(),
      email: newLeadEmail,
      provider: newLeadEmail.includes('@gmail.com') ? 'Gmail' : 'Outlook',
      status: 'pending',
      contact: newLeadName,
      company: newLeadCompany
    };

    setLeads(prev => [...prev, newLead]);
    setNewLeadEmail('');
    setNewLeadName('');
    setNewLeadCompany('');
    setIsAddLeadsModalOpen(false);
  };

  const addSequenceStep = () => {
    const newStep: SequenceStep = {
      id: Date.now().toString(),
      subject: 'New Email Step',
      body: 'Enter your email content here...',
      variants: 1
    };

    setSequences(prev => [...prev, newStep]);
    setSelectedStep(newStep);
  };

  const deleteSequenceStep = (stepId: string) => {
    setSequences(prev => prev.filter(step => step.id !== stepId));
    if (selectedStep.id === stepId && sequences.length > 1) {
      const remainingSteps = sequences.filter(step => step.id !== stepId);
      setSelectedStep(remainingSteps[0]);
    }
  };

  const saveSequenceStep = () => {
    setSequences(prev => prev.map(step => 
      step.id === selectedStep.id ? selectedStep : step
    ));
  };

  const updateSelectedStep = (field: keyof SequenceStep, value: string | number) => {
    setSelectedStep(prev => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'paused': return 'Paused';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedCampaign) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Campaigns
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{selectedCampaign.name}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCampaign.status)}`}>
                {getStatusLabel(selectedCampaign.status)}
              </span>
              <button
                onClick={() => toggleCampaignStatus(selectedCampaign.id)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                {selectedCampaign.status === 'active' ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Campaign Progress</span>
              <span className="text-sm text-gray-500">{selectedCampaign.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${selectedCampaign.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Campaign Detail Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="sequences">Sequences</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              {/* Summary Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Campaign Overview</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCampaign.status)}`}>
                      {getStatusLabel(selectedCampaign.status)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedCampaign.sent}</div>
                    <div className="text-sm text-gray-600">Sequence Started</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedCampaign.openRate}%</div>
                    <div className="text-sm text-gray-600">Open Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedCampaign.clickRate}%</div>
                    <div className="text-sm text-gray-600">Click Rate</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{selectedCampaign.replyRate}%</div>
                    <div className="text-sm text-gray-600">Reply Rate</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{selectedCampaign.positiveReplyRate}%</div>
                    <div className="text-sm text-gray-600">Positive Reply Rate</div>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Emails Sent</span>
                      <span className="font-semibold">{selectedCampaign.sent}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Opens</span>
                      <span className="font-semibold">{Math.round(selectedCampaign.sent * selectedCampaign.openRate / 100)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Clicks</span>
                      <span className="font-semibold">{selectedCampaign.clicks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Replies</span>
                      <span className="font-semibold">{selectedCampaign.replied}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Opportunities</span>
                      <span className="font-semibold text-blue-600">{selectedCampaign.opportunities}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Conversions</span>
                      <span className="font-semibold text-green-600">{selectedCampaign.conversions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Revenue Generated</span>
                      <span className="font-semibold text-purple-600">${selectedCampaign.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Conversion Rate</span>
                      <span className="font-semibold">{((selectedCampaign.conversions / selectedCampaign.sent) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Placeholder - Fixed dropdown positioning */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Over Time</h3>
                  <div className="relative">
                    <select className="pl-3 pr-8 py-1 border border-gray-300 rounded-lg text-sm bg-white appearance-none cursor-pointer min-w-[140px]">
                      <option>Last 4 weeks</option>
                      <option>Last 8 weeks</option>
                      <option>Last 12 weeks</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-600">Chart visualization would appear here</div>
                    <div className="text-sm text-gray-500 mt-2">
                      Sent (blue) • Opens (yellow) • Clicks (lime) • Replies (green)
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="leads" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                {/* Leads Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setFilterOpen(!filterOpen)}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </button>
                      {filterOpen && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <div className="p-3">
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input type="checkbox" className="rounded mr-2" />
                                <span className="text-sm">Completed</span>
                              </label>
                              <label className="flex items-center">
                                <input type="checkbox" className="rounded mr-2" />
                                <span className="text-sm">Pending</span>
                              </label>
                              <label className="flex items-center">
                                <input type="checkbox" className="rounded mr-2" />
                                <span className="text-sm">Failed</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedLeads.length > 0 && (
                      <button 
                        onClick={deleteSelectedLeads}
                        className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete ({selectedLeads.length})
                      </button>
                    )}
                    <Dialog open={isAddLeadsModalOpen} onOpenChange={setIsAddLeadsModalOpen}>
                      <DialogTrigger asChild>
                        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Leads
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Leads</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setAddLeadMethod('manual')}
                              className={`flex-1 px-4 py-2 rounded-lg ${addLeadMethod === 'manual' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                              <UserPlus className="w-4 h-4 inline mr-2" />
                              Manual Entry
                            </button>
                            <button
                              onClick={() => setAddLeadMethod('import')}
                              className={`flex-1 px-4 py-2 rounded-lg ${addLeadMethod === 'import' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                              <Upload className="w-4 h-4 inline mr-2" />
                              Import CSV
                            </button>
                          </div>
                          
                          {addLeadMethod === 'manual' ? (
                            <div className="space-y-3">
                              <input
                                type="email"
                                placeholder="Email address"
                                value={newLeadEmail}
                                onChange={(e) => setNewLeadEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <input
                                type="text"
                                placeholder="Contact name"
                                value={newLeadName}
                                onChange={(e) => setNewLeadName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <input
                                type="text"
                                placeholder="Company name"
                                value={newLeadCompany}
                                onChange={(e) => setNewLeadCompany(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600">Drop your CSV file here or click to browse</p>
                              <input type="file" accept=".csv" className="hidden" />
                            </div>
                          )}
                          
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setIsAddLeadsModalOpen(false)}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={addManualLead}
                              disabled={addLeadMethod === 'manual' && (!newLeadEmail || !newLeadName || !newLeadCompany)}
                              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
                            >
                              {addLeadMethod === 'manual' ? 'Add Lead' : 'Import'}
                            </button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Leads Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input 
                            type="checkbox" 
                            className="rounded"
                            checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                            onChange={toggleAllLeads}
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Provider</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLeads.map((lead, index) => (
                        <React.Fragment key={lead.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input 
                                type="checkbox" 
                                className="rounded"
                                checked={selectedLeads.includes(lead.id)}
                                onChange={() => toggleLeadSelection(lead.id)}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                            <td 
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer hover:text-blue-600"
                              onClick={() => toggleLeadExpansion(lead.id)}
                            >
                              {lead.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.provider}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                lead.status === 'completed' ? 'bg-green-100 text-green-800' :
                                lead.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.contact}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.company}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button 
                                onClick={() => handlePersonalize(lead.email)}
                                className="px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors"
                              >
                                Personalize
                              </button>
                            </td>
                          </tr>
                          {lead.expanded && (
                            <tr>
                              <td colSpan={8} className="px-6 py-4 bg-gray-50">
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-gray-900">Personalized Content</h4>
                                  
                                  {/* Email Steps */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {mockPersonalization[lead.id]?.emails.map((email) => (
                                      <div key={email.step} className="bg-white p-4 rounded-lg border">
                                        <h5 className="font-medium text-gray-900 mb-2">Email Step {email.step}</h5>
                                        <div className="text-sm text-gray-600 mb-2">
                                          <strong>Subject:</strong> {email.subject}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          <strong>Body:</strong>
                                          <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                                            {email.body.substring(0, 100)}...
                                          </div>
                                        </div>
                                      </div>
                                    )) || (
                                      <div className="col-span-3 text-center text-gray-500 py-4">
                                        No personalized emails available
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* LinkedIn Section */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg border">
                                      <h5 className="font-medium text-gray-900 mb-2">LinkedIn Status</h5>
                                      <div className="text-sm text-gray-600">
                                        {mockPersonalization[lead.id]?.linkedinStatus || 'Not connected'}
                                      </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border">
                                      <h5 className="font-medium text-gray-900 mb-2">LinkedIn Message</h5>
                                      <div className="text-sm text-gray-600">
                                        {mockPersonalization[lead.id]?.linkedinMessage || 'No message available'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sequences" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Steps List */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sequence Steps</h3>
                  <div className="space-y-3">
                    {sequences.map((step, index) => (
                      <div
                        key={step.id}
                        onClick={() => setSelectedStep(step)}
                        className={`relative p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedStep.id === step.id 
                            ? 'bg-blue-50 border-2 border-blue-300' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSequenceStep(step.id);
                          }}
                          className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="font-medium text-gray-900">Step {index + 1}</div>
                        <div className="text-sm text-gray-600 truncate pr-8">{step.subject}</div>
                        <div className="text-xs text-gray-500 mt-1">{step.variants} variant(s)</div>
                      </div>
                    ))}
                    <button 
                      onClick={addSequenceStep}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      + Add Step
                    </button>
                  </div>
                </div>

                {/* Step Editor */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Step</h3>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <input
                        type="text"
                        value={selectedStep.subject}
                        onChange={(e) => updateSelectedStep('subject', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Email subject..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
                      <textarea
                        value={selectedStep.body}
                        onChange={(e) => updateSelectedStep('body', e.target.value)}
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Email body..."
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <button className="text-sm text-blue-600 hover:text-blue-800">AI Tools</button>
                        <button className="text-sm text-blue-600 hover:text-blue-800">Templates</button>
                        <button className="text-sm text-blue-600 hover:text-blue-800">Variables</button>
                        <button className="text-sm text-blue-600 hover:text-blue-800">Formatting</button>
                      </div>
                      <button 
                        onClick={saveSequenceStep}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="options" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scheduling */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduling</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
                      <div className="flex space-x-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                              selectedDays.includes(day)
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Daily Send Limit</label>
                      <input
                        type="number"
                        value={dailyLimit}
                        onChange={(e) => setDailyLimit(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sending Window</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tracking & Settings */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking & Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Open Rate Tracking</div>
                        <div className="text-sm text-gray-600">Track when emails are opened</div>
                      </div>
                      <Switch 
                        checked={openTracking}
                        onCheckedChange={setOpenTracking}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Click Tracking</div>
                        <div className="text-sm text-gray-600">Track link clicks in emails</div>
                      </div>
                      <Switch 
                        checked={clickTracking}
                        onCheckedChange={setClickTracking}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Reply Tracking</div>
                        <div className="text-sm text-gray-600">Track email replies</div>
                      </div>
                      <Switch 
                        checked={replyTracking}
                        onCheckedChange={setReplyTracking}
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button className="w-full mb-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow">
                        Manage Senders
                      </button>
                      <div className="flex space-x-2">
                        <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                          Save as Draft
                        </button>
                        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          Publish
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Campaigns
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600"
            >
              {campaigns.filter(c => c.status === 'active').length} active, {campaigns.filter(c => c.status === 'paused').length} paused campaigns
            </motion.p>
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedCampaigns.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={deleteSelectedCampaigns}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedCampaigns.length})
              </motion.button>
            )}
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Campaign
                </motion.button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="Enter campaign name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && createCampaign()}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createCampaign}
                      className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Campaign List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
                    onChange={toggleAllCampaigns}
                  />
                </div>
                <div className="grid grid-cols-7 gap-4 flex-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div>NAME</div>
                  <div>STATUS</div>
                  <div>PROGRESS</div>
                  <div>SENT</div>
                  <div>CLICK</div>
                  <div>REPLIED</div>
                  <div>OPPORTUNITIES</div>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Rows */}
          <div className="divide-y divide-gray-200">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectedCampaigns.includes(campaign.id)}
                    onChange={() => toggleCampaignSelection(campaign.id)}
                  />
                </div>
                <div 
                  className="grid grid-cols-7 gap-4 flex-1 items-center cursor-pointer"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  {/* Name */}
                  <div>
                    {editingCampaign === campaign.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') saveEditCampaign();
                            if (e.key === 'Escape') cancelEditCampaign();
                          }}
                          onBlur={saveEditCampaign}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                    )}
                  </div>
                  
                  {/* Status */}
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                      {getStatusLabel(campaign.status)}
                    </span>
                  </div>
                  
                  {/* Progress */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${campaign.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 min-w-[40px]">{campaign.progress}%</span>
                    </div>
                  </div>

                  {/* Sent */}
                  <div>
                    <div className="font-semibold text-gray-900">{campaign.sent}</div>
                  </div>

                  {/* Click */}
                  <div>
                    <div className="font-semibold text-gray-900">{campaign.clicks}</div>
                  </div>

                  {/* Replied */}
                  <div>
                    <div className="font-semibold text-gray-900">{campaign.replied}</div>
                    <div className="text-sm text-gray-500">{campaign.replyRate}%</div>
                  </div>

                  {/* Opportunities */}
                  <div>
                    <div className="font-semibold text-gray-900">{campaign.opportunities}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCampaignStatus(campaign.id);
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </motion.button>
                  
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === campaign.id ? null : campaign.id);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </motion.button>
                    
                    {openDropdown === campaign.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditCampaign(campaign);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Rename Campaign
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCampaign(campaign.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Campaign
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </div>

        {campaigns.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-4">Create your first email campaign to get started.</p>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Campaign
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="Enter campaign name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && createCampaign()}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createCampaign}
                      className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Click outside to close dropdown */}
        {(openDropdown || filterOpen) && (
          <div 
            className="fixed inset-0 z-5" 
            onClick={() => {
              setOpenDropdown(null);
              setFilterOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}