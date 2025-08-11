import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Play, Pause, BarChart3, Users, Mail, MousePointer, MessageSquare, DollarSign, Search, Filter, MoreHorizontal, Eye, Send } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';

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
}

interface SequenceStep {
  id: string;
  subject: string;
  body: string;
  variants: number;
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

export function Campaigns() {
  const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>('campaigns', mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<SequenceStep>(mockSequence[0]);
  const [activeTab, setActiveTab] = useState('analytics');

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
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Mail className="w-8 h-8 text-blue-500 mb-2" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{selectedCampaign.sent}</div>
                  <div className="text-sm text-gray-600">Sequence Started</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Eye className="w-8 h-8 text-green-500 mb-2" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{selectedCampaign.openRate}%</div>
                  <div className="text-sm text-gray-600">Open Rate</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <MousePointer className="w-8 h-8 text-purple-500 mb-2" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{selectedCampaign.clickRate}%</div>
                  <div className="text-sm text-gray-600">Click Rate</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <MessageSquare className="w-8 h-8 text-orange-500 mb-2" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{selectedCampaign.replyRate}%</div>
                  <div className="text-sm text-gray-600">Reply Rate</div>
                </div>
              </div>

              {/* Opportunities and Conversions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Opportunities</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{selectedCampaign.opportunities}</div>
                  <div className="text-sm text-gray-600">Positive replies converted to opportunities</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversions</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{selectedCampaign.conversions}</div>
                  <div className="text-sm text-gray-600">${selectedCampaign.revenue.toLocaleString()} revenue generated</div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Over Time</h3>
                  <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                    <option>Last 4 weeks</option>
                    <option>Last 8 weeks</option>
                    <option>Last 12 weeks</option>
                  </select>
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
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                  </div>
                  <button className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Leads
                  </button>
                </div>

                {/* Leads Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input type="checkbox" className="rounded" />
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
                      {mockLeads.map((lead, index) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input type="checkbox" className="rounded" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.email}</td>
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
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
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
                    {mockSequence.map((step, index) => (
                      <div
                        key={step.id}
                        onClick={() => setSelectedStep(step)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedStep.id === step.id 
                            ? 'bg-blue-50 border-2 border-blue-300' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-gray-900">Step {index + 1}</div>
                        <div className="text-sm text-gray-600 truncate">{step.subject}</div>
                        <div className="text-xs text-gray-500 mt-1">{step.variants} variant(s)</div>
                      </div>
                    ))}
                    <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Email subject..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
                      <textarea
                        value={selectedStep.body}
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
                      <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow">
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
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
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
                        defaultValue="50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sending Window</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          defaultValue="09:00"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          defaultValue="17:00"
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
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Click Tracking</div>
                        <div className="text-sm text-gray-600">Track link clicks in emails</div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Reply Tracking</div>
                        <div className="text-sm text-gray-600">Track email replies</div>
                      </div>
                      <Switch defaultChecked />
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
              className="text-4xl font-bold text-gray-900 mb-2"
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
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
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

        {/* Campaign List */}
        <div className="space-y-4">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCampaign(campaign)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{campaign.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                      {getStatusLabel(campaign.status)}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm text-gray-600">{campaign.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${campaign.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* KPI Metrics */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{campaign.sent}</div>
                      <div className="text-sm text-gray-600">Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{campaign.clicks}</div>
                      <div className="text-sm text-gray-600">Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{campaign.replied}</div>
                      <div className="text-sm text-gray-600">Replied</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{campaign.replyRate}%</div>
                      <div className="text-sm text-gray-600">Reply Rate</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 ml-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCampaignStatus(campaign.id);
                    }}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      campaign.status === 'active'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {campaign.status === 'active' ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
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
      </div>
    </div>
  );
}