export interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  linkedin: string | null;
  linkedinURL: string | null;
  jobTitle: string | null;
  companyName: string | null;
  location: string | null;
  country: string | null;
  website: string | null;
  sector: string | null;
  status: 'New' | 'Verified' | 'Skipped';
  campaign_id?: string | null;
  lead_id?: string | null;
  created_at: string;
}