import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          title: string | null;
          company_id: string | null;
          owner_id: string | null;
          lifecycle_stage: string;
          reply_status: string | null;
          reply_summary: string | null;
          phone: string | null;
          linkedin_url: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          title?: string | null;
          company_id?: string | null;
          owner_id?: string | null;
          lifecycle_stage?: string;
          reply_status?: string | null;
          reply_summary?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          title?: string | null;
          company_id?: string | null;
          owner_id?: string | null;
          lifecycle_stage?: string;
          reply_status?: string | null;
          reply_summary?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          domain: string | null;
          website: string | null;
          linkedin: string | null;
          location: string | null;
          size: string | null;
          industry: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain?: string | null;
          website?: string | null;
          linkedin?: string | null;
          location?: string | null;
          size?: string | null;
          industry?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string | null;
          website?: string | null;
          linkedin?: string | null;
          location?: string | null;
          size?: string | null;
          industry?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      deals: {
        Row: {
          id: string;
          title: string;
          contact_id: string | null;
          company_id: string | null;
          pipeline_id: string;
          stage_id: string;
          amount: number | null;
          currency: string;
          close_date: string | null;
          status: string;
          source: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          contact_id?: string | null;
          company_id?: string | null;
          pipeline_id: string;
          stage_id: string;
          amount?: number | null;
          currency?: string;
          close_date?: string | null;
          status?: string;
          source?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          contact_id?: string | null;
          company_id?: string | null;
          pipeline_id?: string;
          stage_id?: string;
          amount?: number | null;
          currency?: string;
          close_date?: string | null;
          status?: string;
          source?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pipelines: {
        Row: {
          id: string;
          name: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      pipeline_stages: {
        Row: {
          id: string;
          pipeline_id: string;
          name: string;
          order_index: number;
          probability: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pipeline_id: string;
          name: string;
          order_index: number;
          probability?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pipeline_id?: string;
          name?: string;
          order_index?: number;
          probability?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          type: string;
          related_type: string;
          related_id: string;
          content: string | null;
          meta_json: any | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          related_type: string;
          related_id: string;
          content?: string | null;
          meta_json?: any | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          related_type?: string;
          related_id?: string;
          content?: string | null;
          meta_json?: any | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      owners: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: string;
          created_at?: string;
        };
      };
    };
  };
};