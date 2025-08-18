import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Campaign {
  id: string;
  name: string;
}

interface CampaignsContextType {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
}

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export const CampaignsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('campaigns')
          .select('id, name')
          .order('name');

        if (error) {
          throw error;
        }

        setCampaigns(data?.sort((a, b) => a.name.localeCompare(b.name)) || []);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to fetch campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <CampaignsContext.Provider value={{ campaigns, loading, error }}>
      {children}
    </CampaignsContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignsContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignsProvider');
  }
  return context;
};