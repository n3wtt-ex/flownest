-- Migration: Make campaigns.organization_id NOT NULL
-- This migration ensures that the organization_id column in the campaigns table is NOT NULL
-- and adds a foreign key constraint to the organizations table

-- First, update any NULL values (shouldn't be any after migrate_existing_data.sql, but just in case)
-- UPDATE campaigns SET organization_id = (SELECT id FROM organizations LIMIT 1) WHERE organization_id IS NULL;

-- Add foreign key constraint
ALTER TABLE campaigns 
ADD CONSTRAINT fk_campaigns_organization_id 
FOREIGN KEY (organization_id) REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Make organization_id NOT NULL
ALTER TABLE campaigns ALTER COLUMN organization_id SET NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_organization_id ON campaigns(organization_id);