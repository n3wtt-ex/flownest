import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Play, BarChart3, Search, Filter, MoreHorizontal, Eye, Send, Trash2, Edit2, Upload, UserPlus, ChevronDown } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';

import { supabase } from '../lib/supabase';


interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  sent: number;
  clicks: number;
  replied: number;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
  positive_reply_rate: number;
  opportunities: number;
  conversions: number;
  revenue: number;
  created_at: string;
  webhook_campaign_id?: string;
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
  delay: number;
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

const mockLeads: Lead[] = [];

const mockSequence: SequenceStep[] = [
  {
    id: '1',
    subject: 'New Email Step',
    body: 'Enter your email content here...',
    variants: 1,
    delay: 1
  }
];

const initialPersonalizationData: Record<string, LeadPersonalization> = {};

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [errorCampaigns, setErrorCampaigns] = useState<string | null>(null);

  const [leads, setLeads] = useLocalStorage<Lead[]>('leads', mockLeads);
  const [sequences, setSequences] = useLocalStorage<SequenceStep[]>('sequences', mockSequence);
  const [personalizationData, setPersonalizationData] = useLocalStorage<Record<string, LeadPersonalization>>('personalizationData', initialPersonalizationData);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddLeadsModalOpen, setIsAddLeadsModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<SequenceStep | null>(mockSequence[0] || null);
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
  const [onlyText, setOnlyText] = useState(false);
  const [stopOnReply, setStopOnReply] = useState(false);

  // Supabase'den kampanyaları çekme fonksiyonu
  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    setErrorCampaigns(null);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, status, progress, sent, clicks, replied, open_rate, click_rate, reply_rate, positive_reply_rate, opportunities, conversions, revenue, created_at, webhook_campaign_id'); // Sadece UI'da kullanılan sütunları çekiyoruz

      if (error) {
        console.error('Error fetching campaigns:', error);
        setErrorCampaigns(error.message);
        setCampaigns([]);
      } else {
        // Supabase'den gelen veriyi Campaign interface'ine dönüştürüyoruz
        const mappedCampaigns: Campaign[] = data.map(c => ({
          id: c.id,
          name: c.name,
          status: c.status as 'active' | 'paused' | 'completed', // Supabase'den gelen string'i uygun tipe dönüştürüyoruz
          progress: c.progress || 0,
          sent: c.sent || 0,
          clicks: c.clicks || 0,
          replied: c.replied || 0,
          open_rate: c.open_rate || 0,
          click_rate: c.click_rate || 0,
          reply_rate: c.reply_rate || 0,
          positive_reply_rate: c.positive_reply_rate || 0,
          opportunities: c.opportunities || 0,
          conversions: c.conversions || 0,
          revenue: c.revenue || 0,
          created_at: c.created_at,
          webhook_campaign_id: c.webhook_campaign_id || undefined,
        }));
        setCampaigns(mappedCampaigns);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching campaigns:', err);
      setErrorCampaigns(err.message);
      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Sayfa yüklendiğinde kampanyaları çek
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const createCampaign = async () => {
    if (!newCampaignName.trim()) return;

    let webhookCampaignId: string | undefined;

    try {
      const webhookUrl = 'https://n8n.flownests.org/webhook/076869a4-06b2-4d19-8e2b-544306c9b1f7';
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newCampaignName }),
      });

      if (response.ok) {
        const responseData = await response.json();
        // Assuming the webhook returns an array and the campaign_id is in the first element
        if (responseData && responseData.length > 0 && responseData[0].campaign_id) {
          webhookCampaignId = responseData[0].campaign_id;
          console.log('Webhook successful, campaign_id:', webhookCampaignId);
        } else {
          console.warn('Webhook successful but campaign_id not found in response:', responseData);
        }
      } else {
        console.error('Webhook failed with status:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error calling webhook:', error);
    }

    try {
      const { data: createdCampaign, error } = await supabase
        .from('campaigns')
        .insert({
          name: newCampaignName,
          status: 'paused',
          progress: 0,
          sent: 0,
          clicks: 0,
          replied: 0,
          open_rate: 0,
          click_rate: 0,
          reply_rate: 0,
          positive_reply_rate: 0,
          opportunities: 0,
          conversions: 0,
          revenue: 0,
          webhook_campaign_id: webhookCampaignId, // Save the ID from the webhook
        })
        .select();

      if (error) {
        console.error('Error creating campaign in Supabase:', error);
        setErrorCampaigns(error.message);
      } else if (createdCampaign && createdCampaign.length > 0) {
        // Supabase'den dönen veriyi Campaign interface'ine dönüştürüp state'e ekliyoruz
        const newCampaign: Campaign = {
          id: createdCampaign[0].id,
          name: createdCampaign[0].name,
          status: createdCampaign[0].status as 'active' | 'paused' | 'completed',
          progress: createdCampaign[0].progress || 0,
          sent: createdCampaign[0].sent || 0,
          clicks: createdCampaign[0].clicks || 0,
          replied: createdCampaign[0].replied || 0,
          open_rate: createdCampaign[0].open_rate || 0,
          click_rate: createdCampaign[0].click_rate || 0,
          reply_rate: createdCampaign[0].reply_rate || 0,
          positive_reply_rate: createdCampaign[0].positive_reply_rate || 0,
          opportunities: createdCampaign[0].opportunities || 0,
          conversions: createdCampaign[0].conversions || 0,
          revenue: createdCampaign[0].revenue || 0,
          created_at: createdCampaign[0].created_at,
          webhook_campaign_id: createdCampaign[0].webhook_campaign_id || undefined,
        };
        setCampaigns((prev: Campaign[]) => [...prev, newCampaign]);
        setNewCampaignName('');
        setIsCreateModalOpen(false);
      }
    } catch (err: any) {
      console.error('Unexpected error creating campaign:', err);
      setErrorCampaigns(err.message);
    }
  };

  const toggleCampaignStatus = async (campaignId: string) => {
    const campaignToUpdate = campaigns.find(c => c.id === campaignId);
    if (!campaignToUpdate) return;

    const newStatus = campaignToUpdate.status === 'active' ? 'paused' : 'active';
    const action = newStatus === 'active' ? 'active' : 'pause';

    // Webhook call for status change
    if (campaignToUpdate.webhook_campaign_id) {
      try {
        const webhookUrl = 'https://n8n.flownests.org/webhook/99a2cf56-8403-462e-8994-c1a4cbbfcd8b';
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: action,
            campaign_id: campaignToUpdate.webhook_campaign_id,
          }),
        });

        if (response.ok) {
          console.log(`Webhook successful for campaign ID: ${campaignToUpdate.webhook_campaign_id}, action: ${action}`);
        } else {
          console.error('Webhook failed with status:', response.status, await response.text());
        }
      } catch (error) {
        console.error('Error calling webhook for status change:', error);
      }
    }

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaignId)
        .select();

      if (error) {
        console.error('Error updating campaign status in Supabase:', error);
        setErrorCampaigns(error.message);
      } else if (data && data.length > 0) {
        setCampaigns((prev: Campaign[]) => prev.map((campaign: Campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status: newStatus }
            : campaign
        ));
        if (selectedCampaign && selectedCampaign.id === campaignId) {
          setSelectedCampaign((prev: Campaign | null) => prev ? {
            ...prev,
            status: newStatus
          } : null);
        }
      }
    } catch (err: any) {
      console.error('Unexpected error toggling campaign status:', err);
      setErrorCampaigns(err.message);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    const campaignToDelete = campaigns.find(c => c.id === campaignId);
    if (!campaignToDelete) return;

    // Webhook call for single delete (existing functionality)
    if (campaignToDelete.webhook_campaign_id) {
      try {
        const webhookUrl = 'https://n8n.flownests.org/webhook/5c383936-cd76-439f-8db4-e22033ed59a0';
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ campaign_ids: [campaignToDelete.webhook_campaign_id] }),
        });
        if (response.ok) {
          console.log('Single delete webhook successful for ID:', campaignToDelete.webhook_campaign_id);
        } else {
          console.error('Single delete webhook failed with status:', response.status, await response.text());
        }
      } catch (error) {
        console.error('Error calling single delete webhook:', error);
      }
    }

    // Delete from Supabase
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) {
        console.error('Error deleting campaign from Supabase:', error);
        setErrorCampaigns(error.message);
      } else {
        setCampaigns((prev: Campaign[]) => prev.filter((campaign: Campaign) => campaign.id !== campaignId));
        setOpenDropdown(null);
        if (selectedCampaign && selectedCampaign.id === campaignId) {
          setSelectedCampaign(null);
        }
      }
    } catch (err: any) {
      console.error('Unexpected error deleting campaign:', err);
      setErrorCampaigns(err.message);
    }
  };

  const deleteSelectedCampaigns = async () => {
    const campaignsToDelete = campaigns.filter((campaign: Campaign) => selectedCampaigns.includes(campaign.id));
    const webhookCampaignIds = campaignsToDelete.map(c => c.webhook_campaign_id).filter(Boolean); // Get only existing webhook IDs

    if (webhookCampaignIds.length > 0) {
      try {
        const webhookUrl = 'https://n8n.flownests.org/webhook/5c383936-cd76-439f-8db4-e22033ed59a0';
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ campaign_ids: webhookCampaignIds }), // Send an array of IDs
        });

        if (response.ok) {
          console.log('Delete selected campaigns webhook successful for IDs:', webhookCampaignIds);
        } else {
          console.error('Delete selected campaigns webhook failed with status:', response.status, await response.text());
        }
      } catch (error) {
        console.error('Error calling delete selected campaigns webhook:', error);
      }
    }

    // Delete from Supabase
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .in('id', selectedCampaigns); // Delete multiple by ID

      if (error) {
        console.error('Error deleting selected campaigns from Supabase:', error);
        setErrorCampaigns(error.message);
      } else {
        setCampaigns((prev: Campaign[]) => prev.filter((campaign: Campaign) => !selectedCampaigns.includes(campaign.id)));
        setSelectedCampaigns([]);
        setSelectedCampaign(null); // Clear selected campaign if it was deleted
      }
    } catch (err: any) {
      console.error('Unexpected error deleting selected campaigns:', err);
      setErrorCampaigns(err.message);
    }
  };

  const deleteSelectedLeads = () => {
    setLeads((prev: Lead[]) => prev.filter((lead: Lead) => !selectedLeads.includes(lead.id)));
    setSelectedLeads([]);
  };

  const startEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign.id);
    setEditName(campaign.name);
    setOpenDropdown(null);
  };

  const saveEditCampaign = async () => {
    if (!editName.trim() || !editingCampaign) return;

    const campaignToEdit = campaigns.find(c => c.id === editingCampaign);
    if (!campaignToEdit) return;

    let updatedWebhookCampaignId = campaignToEdit.webhook_campaign_id;

    try {
      const webhookUrl = 'https://n8n.flownests.org/webhook/8c7a0c8e-fb2c-4e91-894b-acf536bb1c33';
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_name: editName,
          campaign_id: campaignToEdit.webhook_campaign_id, // Send existing ID (snake_case)
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData && responseData.length > 0 && responseData[0].campaign_id) {
          updatedWebhookCampaignId = responseData[0].campaign_id; // Update with new ID from webhook
          console.log('Rename webhook successful, updated campaign_id:', updatedWebhookCampaignId);
        } else {
          console.warn('Rename webhook successful but campaign_id not found in response:', responseData);
        }
      } else {
        console.error('Rename webhook failed with status:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error calling rename webhook:', error);
    }
    
    // Update in Supabase
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update({ name: editName, webhook_campaign_id: updatedWebhookCampaignId }) // Use snake_case
        .eq('id', editingCampaign)
        .select();

      if (error) {
        console.error('Error updating campaign name in Supabase:', error);
        setErrorCampaigns(error.message);
      } else if (data && data.length > 0) {
        setCampaigns((prev: Campaign[]) => prev.map((campaign: Campaign) => 
          campaign.id === editingCampaign 
            ? { ...campaign, name: editName, webhook_campaign_id: updatedWebhookCampaignId }
            : campaign
        ));
        setEditingCampaign(null);
        setEditName('');
        if (selectedCampaign && selectedCampaign.id === editingCampaign) {
          setSelectedCampaign((prev: Campaign | null) => prev ? {
            ...prev,
            name: editName,
            webhook_campaign_id: updatedWebhookCampaignId
          } : null);
        }
      }
    } catch (err: any) {
      console.error('Unexpected error saving edited campaign:', err);
      setErrorCampaigns(err.message);
    }
  };

  const cancelEditCampaign = () => {
    setEditingCampaign(null);
    setEditName('');
  };

  const toggleCampaignSelection = (campaignId: string) => {
    setSelectedCampaigns((prev: string[]) => 
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads((prev: string[]) => 
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const toggleAllCampaigns = () => {
    if (selectedCampaigns.length === campaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(campaigns.map((c: Campaign) => c.id));
    }
  };

  const toggleAllLeads = () => {
    const filteredLeads = leads.filter((lead: Lead) => 
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((l: Lead) => l.id));
    }
  };

  const toggleLeadExpansion = (leadId: string) => {
    setLeads((prev: Lead[]) => prev.map((lead: Lead) => 
      lead.id === leadId 
        ? { ...lead, expanded: !lead.expanded }
        : lead
    ));
  };

  const handlePersonalize = async (leadId: string, leadEmail: string) => {
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
        const rawResponseData = await response.json();
        const responseData = rawResponseData[0]; // n8n output is an array, take the first item

        if (!responseData) {
          console.warn('Personalization webhook returned no data for:', leadEmail);
          return; // Exit if no data is returned
        }

        const transformedData: LeadPersonalization = {
          emails: [],
          linkedinStatus: responseData?.linkedin_kontak || 'Not connected',
          linkedinMessage: responseData?.linkedin_mesaj || 'No message available',
        };

        if (responseData.generated_subject && responseData.generated_body) {
          transformedData.emails.push({
            step: 1,
            subject: responseData.generated_subject,
            body: responseData.generated_body,
          });
        }
        if (responseData.generated_subject_step2 && responseData.generated_body_step2) {
          transformedData.emails.push({
            step: 2,
            subject: responseData.generated_subject_step2,
            body: responseData.generated_body_step2,
          });
        }
        if (responseData.generated_subject_step3 && responseData.generated_body_step3) {
          transformedData.emails.push({
            step: 3,
            subject: responseData.generated_subject_step3,
            body: responseData.generated_body_step3,
          });
        }

        setPersonalizationData(prevData => ({
          ...prevData,
          [leadId]: transformedData
        }));
        console.log('Personalization webhook triggered successfully for:', leadEmail, transformedData);
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

    setLeads((prev: Lead[]) => [...prev, newLead]);
    setNewLeadEmail('');
    setNewLeadName('');
    setNewLeadCompany('');
    setIsAddLeadsModalOpen(false);
  };

const addSequenceStep = async () => {
  const newStep: SequenceStep = {
    id: Date.now().toString(),
    subject: 'New Email Step',
    body: 'Enter your email content here...',
    variants: 1,
    delay: 1
  };

  const newPosition = sequences.length + 1;

  if (selectedCampaign?.webhook_campaign_id) {
    console.log('Attempting to call add step webhook for campaign ID:', selectedCampaign.webhook_campaign_id);
    try {
      const response = await fetch('https://n8n.flownests.org/webhook/instantly-step-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_step',
          campaign_id: selectedCampaign.webhook_campaign_id,
          step_data: {
            position: newPosition,
            delay: newStep.delay,
            subject: newStep.subject,
            body: newStep.body
          }
        })
      });
      if (!response.ok) {
        console.error('Add step webhook failed with status:', response.status, await response.text());
      } else {
        console.log('Add step webhook successful.');
      }
    } catch (error) {
      console.error('Error adding step via webhook:', error);
    }
  } else {
    console.warn('Add step webhook not called: selectedCampaign or webhook_campaign_id is missing.');
  }

  setSequences((prev: SequenceStep[]) => [...prev, newStep]);
  setSelectedStep(newStep);
};

const deleteSequenceStep = async (stepId: string, position: number) => {
  if (selectedCampaign?.webhook_campaign_id) {
    try {
      const response = await fetch('https://n8n.flownests.org/webhook/instantly-step-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_step',
          campaign_id: selectedCampaign.webhook_campaign_id,
          step_data: { position }
        })
      });
      if (!response.ok) console.error('Remove step webhook failed');
    } catch (error) {
      console.error('Error removing step via webhook:', error);
    }
  }

  setSequences((prev: SequenceStep[]) => prev.filter((step: SequenceStep) => step.id !== stepId));
  if (selectedStep.id === stepId && sequences.length > 1) {
    const remainingSteps = sequences.filter((step: SequenceStep) => step.id !== stepId);
    setSelectedStep(remainingSteps[0]);
  }
};

  const saveSequenceStep = async () => {
    if (!selectedStep) return;
    
    setSequences((prev: SequenceStep[]) => prev.map((step: SequenceStep) => 
      step.id === selectedStep.id ? selectedStep : step
    ));

    if (selectedCampaign?.webhook_campaign_id) {
      const stepIndex = sequences.findIndex(step => step.id === selectedStep.id);
      if (stepIndex === -1) {
        console.error('Selected step not found in sequences array.');
        return;
      }

      const payload = {
        campaign_id: selectedCampaign.webhook_campaign_id,
        step_index: stepIndex,
        delay: selectedStep.delay,
        subject: selectedStep.subject,
        body: `<div>${selectedStep.body}</div>` // Wrap body in <div> as per documentation
      };

      try {
        const response = await fetch('https://n8n.flownests.org/webhook/instantly-step-edit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          console.error('Instantly step edit webhook failed with status:', response.status, await response.text());
        } else {
          const result = await response.json();
          console.log('Instantly step edit webhook successful:', result);
        }
      } catch (error) {
        console.error('Error calling instantly step edit webhook:', error);
      }
    }
    
    // Reset unsaved changes flag
    setHasUnsavedChanges(false);
  };

  const updateSelectedStep = (field: keyof SequenceStep, value: string | number) => {
    if (!selectedStep) return;
    
    setSelectedStep((prev: SequenceStep) => {
      const updatedStep = { ...prev, [field]: value };
      // Set unsaved changes flag when delay, subject, or body changes
      if (field === 'delay' || field === 'subject' || field === 'body') {
        setHasUnsavedChanges(true);
        
        // Update sequences without auto-saving
        setSequences((currentSequences: SequenceStep[]) => 
          currentSequences.map((step: SequenceStep) => 
            step.id === updatedStep.id ? updatedStep : step
          )
        );
      }
      return updatedStep;
    });
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev: string[]) => 
      prev.includes(day) 
        ? prev.filter((d: string) => d !== day)
        : [...prev, day]
    );
    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
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

  const saveAsDraft = async () => {
    if (!selectedCampaign) {
      console.error('No campaign selected');
      return;
    }

    // Create schedule name based on selected days
    let scheduleName = 'Custom Schedule';
    if (selectedDays.length === 5 && 
        selectedDays.includes('Mon') && 
        selectedDays.includes('Tue') && 
        selectedDays.includes('Wed') && 
        selectedDays.includes('Thu') && 
        selectedDays.includes('Fri') && 
        !selectedDays.includes('Sat') && 
        !selectedDays.includes('Sun')) {
      scheduleName = 'İş Günleri Programı';
    } else if (selectedDays.length === 7) {
      scheduleName = 'Tüm Günler Programı';
    } else if (selectedDays.length === 0) {
      scheduleName = 'Hiçbir Gün Programı';
    }

    // Create the payload
    const payload = {
      campaign_id: selectedCampaign.webhook_campaign_id,
      schedule_name: scheduleName,
      timing_from: startTime,
      timing_to: endTime,
      monday: selectedDays.includes('Mon'),
      tuesday: selectedDays.includes('Tue'),
      wednesday: selectedDays.includes('Wed'),
      thursday: selectedDays.includes('Thu'),
      friday: selectedDays.includes('Fri'),
      saturday: selectedDays.includes('Sat'),
      sunday: selectedDays.includes('Sun'),
      daily_limit: dailyLimit,
      text_only: onlyText,
      stop_on_reply: stopOnReply,
      open_tracking: openTracking,
      link_tracking: clickTracking
    };

    try {
      const response = await fetch('https://n8n.flownests.org/webhook-test/instantly-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Draft saved successfully');
        // You might want to show a success message to the user
        // Reset the unsaved changes flag after successful save
        setHasUnsavedChanges(false);
      } else {
        console.error('Failed to save draft', await response.text());
        // You might want to show an error message to the user
      }
    } catch (error) {
      console.error('Error saving draft', error);
      // You might want to show an error message to the user
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
        return ''; // Required for other browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Also handle navigation within the app
  const handleNavigationAway = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm("Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?");
      if (confirmLeave) {
        setHasUnsavedChanges(false);
        return true;
      }
      return false;
    }
    return true;
  };

  if (selectedCampaign) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => {
                  if (handleNavigationAway()) {
                    setSelectedCampaign(null);
                  }
                }}
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
          <Tabs value={activeTab} onValueChange={(value) => {
            if (handleNavigationAway()) {
              setActiveTab(value);
            }
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="sequences">Sequences</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              {/* Summary Stats */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
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
                    <div className="text-2xl font-bold text-green-600">{selectedCampaign.open_rate}%</div>
                    <div className="text-sm text-gray-600">Open Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedCampaign.click_rate}%</div>
                    <div className="text-sm text-gray-600">Click Rate</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{selectedCampaign.reply_rate}%</div>
                    <div className="text-sm text-gray-600">Reply Rate</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{selectedCampaign.positive_reply_rate}%</div>
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
                      <span className="font-semibold">{Math.round(selectedCampaign.sent * selectedCampaign.open_rate / 100)}</span>
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

              {/* Chart Placeholder */}
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
                {/* Search and Filter moved to top */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
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
                      {filteredLeads.map((lead: Lead, index: number) => (
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
                                onClick={() => handlePersonalize(lead.id, lead.email)}
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
                                    {(personalizationData[lead.id]?.emails || []).map((email: PersonalizedEmail) => (
                                      <div key={email.step} className="bg-white p-4 rounded-lg border">
                                        <h5 className="font-medium text-gray-900 mb-2">Email Step {email.step}</h5>
                                        <div className="text-sm text-gray-600 mb-2">
                                          <strong>Subject:</strong> {email.subject}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          <strong>Body:</strong>
                                          <div className="mt-1 p-2 bg-gray-50 rounded text-xs max-h-32 overflow-y-auto">
                                            {email.body}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {(personalizationData[lead.id]?.emails || []).length === 0 && (
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
                                        {personalizationData[lead.id]?.linkedinStatus || 'Not connected'}
                                      </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border">
                                      <h5 className="font-medium text-gray-900 mb-2">LinkedIn Message</h5>
                                      <div className="text-sm text-gray-600 max-h-24 overflow-y-auto">
                                        {personalizationData[lead.id]?.linkedinMessage || 'No message available'}
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
                    {sequences.map((step: SequenceStep, index: number) => (
                      <div
                        key={step.id}
                        onClick={() => {
                          if (handleNavigationAway()) {
                            setSelectedStep(step);
                          }
                        }}
                        className={`relative p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedStep && selectedStep.id === step.id 
                            ? 'bg-blue-50 border-2 border-blue-300' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSequenceStep(step.id, index + 1);
                        }}
                        className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="font-medium text-gray-900">Step {index + 1}</div>
                        <div className="text-sm text-gray-600 truncate pr-8">{step.subject}</div>
                        <div className="text-xs text-gray-500 mt-1">{step.variants} variant(s)</div>
                        
                        {/* Delay Input */}
                        {index < sequences.length - 1 && (
                          <div className="mt-2 flex items-center space-x-2">
                            <label className="text-xs text-gray-600 whitespace-nowrap">
                              Next step delay (days):
                            </label>
                              <input
                                type="number"
                                min="0"
                                value={step.delay}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  const newDelay = parseInt(e.target.value) || 0;
                                  updateSelectedStep('delay', newDelay);
                                  
                                  // Webhook for delay update
                                  if (selectedCampaign?.webhook_campaign_id) {
                                    fetch('https://n8n.flownests.org/webhook/instantly-step-sync', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        action: 'update_step_delay',
                                        campaign_id: selectedCampaign.webhook_campaign_id,
                                        step_data: {
                                          position: index + 1,
                                          delay: newDelay
                                        }
                                      })
                                    }).catch(error => console.error('Error updating delay:', error));
                                  }
                                }}
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                          </div>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        if (handleNavigationAway()) {
                          addSequenceStep();
                        }
                      }}
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

                  {selectedStep ? (
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
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-gray-500">Düzenlemek için bir adım seçin veya yeni bir adım ekleyin</p>
                    </div>
                  )}
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
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day: string) => (
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
                        onChange={(e) => {
                          setDailyLimit(Number(e.target.value));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sending Window</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => {
                            setStartTime(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => {
                            setEndTime(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
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
                      <div 
                        onClick={() => {
                          setOpenTracking(!openTracking);
                          setHasUnsavedChanges(true);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                          openTracking ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      >
                        <span 
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                            openTracking ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Link Tracking</div>
                        <div className="text-sm text-gray-600">Track link clicks in emails</div>
                      </div>
                      <div 
                        onClick={() => {
                          setClickTracking(!clickTracking);
                          setHasUnsavedChanges(true);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                          clickTracking ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      >
                        <span 
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                            clickTracking ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-gray-900 mb-2">Reply Handling</div>
                      <div className="text-sm text-gray-600 mb-3">Choose how to handle replies</div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Only Text</span>
                          <div 
                            onClick={() => {
                              setOnlyText(!onlyText);
                              setHasUnsavedChanges(true);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                              onlyText ? 'bg-indigo-600' : 'bg-gray-300'
                            }`}
                          >
                            <span 
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                                onlyText ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Stop on Reply</span>
                          <div 
                            onClick={() => {
                              setStopOnReply(!stopOnReply);
                              setHasUnsavedChanges(true);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                              stopOnReply ? 'bg-indigo-600' : 'bg-gray-300'
                            }`}
                          >
                            <span 
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                                stopOnReply ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button 
                        onClick={saveAsDraft}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Save as Draft
                      </button>
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
                    {campaigns.map((campaign: Campaign, index: number) => (
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
                    <div className="text-sm text-gray-500">{campaign.reply_rate}%</div>
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

        {loadingCampaigns && (
          <div className="text-center py-12">
            <p className="text-gray-600">Campaigns yükleniyor...</p>
          </div>
        )}

        {errorCampaigns && (
          <div className="text-center py-12 text-red-500">
            <p>Kampanyalar yüklenirken bir hata oluştu: {errorCampaigns}</p>
          </div>
        )}

        {!loadingCampaigns && !errorCampaigns && campaigns.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-4">Create your first email campaign to get started.</p>
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
