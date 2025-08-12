/*
  # CRM Database Schema Creation
  
  1. New Tables
    - `pipelines` - Sales pipeline definitions
    - `pipeline_stages` - Stages within each pipeline
    - `deals` - Deal/opportunity records
    - `contacts` - Contact information
    - `companies` - Company records
    - `activities` - Activity tracking
    - `owners` - User/owner records
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Owners table
CREATE TABLE IF NOT EXISTS owners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  domain text,
  website text,
  linkedin text,
  location text,
  size text,
  industry text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE,
  full_name text,
  title text,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES owners(id) ON DELETE SET NULL,
  lifecycle_stage text CHECK (lifecycle_stage IN ('lead','MQL','SQL','customer')) DEFAULT 'lead',
  reply_status text,
  reply_summary text,
  phone text,
  linkedin_url text,
  website text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Pipelines table
CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Pipeline stages table
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id uuid NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name text NOT NULL,
  order_index integer NOT NULL,
  probability integer CHECK (probability BETWEEN 0 AND 100) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pipeline_id, name),
  UNIQUE(pipeline_id, order_index)
);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  pipeline_id uuid NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  stage_id uuid NOT NULL REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
  amount numeric(14,2),
  currency text DEFAULT 'USD',
  close_date date,
  status text CHECK (status IN ('open','won','lost')) DEFAULT 'open',
  source text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL,
  related_type text NOT NULL CHECK (related_type IN ('contact','deal','company')),
  related_id uuid NOT NULL,
  content text,
  meta_json jsonb,
  created_by uuid REFERENCES owners(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all owners" ON owners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view all companies" ON companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage companies" ON companies FOR ALL TO authenticated USING (true);
CREATE POLICY "Users can view all contacts" ON contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage contacts" ON contacts FOR ALL TO authenticated USING (true);
CREATE POLICY "Users can view all pipelines" ON pipelines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view all pipeline_stages" ON pipeline_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view all deals" ON deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage deals" ON deals FOR ALL TO authenticated USING (true);
CREATE POLICY "Users can view all activities" ON activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage activities" ON activities FOR ALL TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline_stage ON deals(pipeline_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_related ON activities(related_type, related_id);

-- Insert default data
INSERT INTO pipelines (id, name, is_default) 
VALUES (uuid_generate_v4(), 'Default Sales Pipeline', true)
ON CONFLICT DO NOTHING;

-- Get the default pipeline ID and insert stages
DO $$
DECLARE
    default_pipeline_id uuid;
BEGIN
    SELECT id INTO default_pipeline_id FROM pipelines WHERE is_default = true LIMIT 1;
    
    INSERT INTO pipeline_stages (pipeline_id, name, order_index, probability) VALUES
    (default_pipeline_id, 'New', 10, 10),
    (default_pipeline_id, 'Contacted', 20, 25),
    (default_pipeline_id, 'Qualified', 30, 45),
    (default_pipeline_id, 'Meeting Scheduled', 40, 60),
    (default_pipeline_id, 'Proposal Sent', 50, 75),
    (default_pipeline_id, 'Won', 90, 100),
    (default_pipeline_id, 'Lost', 95, 0)
    ON CONFLICT DO NOTHING;
END $$;

-- Insert sample owner
INSERT INTO owners (name, email, role) 
VALUES ('Demo User', 'demo@example.com', 'owner')
ON CONFLICT (email) DO NOTHING;