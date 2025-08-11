export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Contact {
  id: string;
  email: string;
  full_name?: string;
  title?: string;
  company_id?: string;
  owner_id?: string;
  lifecycle_stage: 'lead' | 'MQL' | 'SQL' | 'customer';
  reply_status?: 'interested' | 'not_interested' | 'question';
  reply_summary?: string;
  phone?: string;
  linkedin_url?: string;
  website?: string;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface Company {
  id: string;
  name: string;
  domain?: string;
  website?: string;
  linkedin?: string;
  location?: string;
  size?: string;
  industry?: string;
  created_at: string;
  updated_at: string;
}

export interface Pipeline {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  stages?: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  order_index: number;
  probability: number;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  title: string;
  contact_id?: string;
  company_id?: string;
  pipeline_id: string;
  stage_id: string;
  amount?: number;
  currency: string;
  close_date?: string;
  status: 'open' | 'won' | 'lost';
  source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  contact?: Contact;
  company?: Company;
  stage?: PipelineStage;
}

export interface Activity {
  id: string;
  type: 'email_in' | 'email_out' | 'call' | 'meeting' | 'task' | 'note' | 'system';
  related_type: 'contact' | 'deal' | 'company';
  related_id: string;
  content?: string;
  meta_json?: any;
  created_by?: string;
  created_at: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}