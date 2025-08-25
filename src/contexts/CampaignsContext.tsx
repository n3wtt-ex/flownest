import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  metrics: { sent: number; clicks: number; replied: number };
  created_at: string;
}

interface CampaignsContextType {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  refreshCampaigns: () => Promise<void>;
}

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      // Map the data to our Campaign type
      const mappedCampaigns: Campaign[] = data.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        progress: campaign.progress,
        metrics: campaign.metrics,
        created_at: campaign.created_at
      }));

      setCampaigns(mappedCampaigns);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const refreshCampaigns = async () => {
    await fetchCampaigns();
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <CampaignsContext.Provider value={{ campaigns, loading, error, refreshCampaigns }}>
      {children}
    </CampaignsContext.Provider>
  );
}

export function useCampaigns() {
  const context = useContext(CampaignsContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignsProvider');
  }
  return context;
}