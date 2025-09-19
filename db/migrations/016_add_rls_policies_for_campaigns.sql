-- Migration: Add RLS policies for campaigns table
-- This migration adds Row Level Security policies for the campaigns table
-- to ensure users can only access campaigns belonging to their organization

-- Enable Row Level Security on campaigns table
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
-- Users can view campaigns belonging to their organization
CREATE POLICY "Users can view campaigns from their organization" ON campaigns
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- Users can insert campaigns belonging to their organization
CREATE POLICY "Users can insert campaigns for their organization" ON campaigns
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- Users can update campaigns belonging to their organization
CREATE POLICY "Users can update campaigns from their organization" ON campaigns
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- Users can delete campaigns belonging to their organization
CREATE POLICY "Users can delete campaigns from their organization" ON campaigns
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON campaigns TO authenticated;