-- Migration: Organizations table structure
-- This migration defines the structure of the organizations table

-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT,
    settings JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    subscription_plan subscription_plan_type NOT NULL DEFAULT 'starter'
);

-- Create user_organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_organization_id ON user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_active ON user_organizations(is_active);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
-- Users can view organizations they belong to
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            WHERE uo.organization_id = organizations.id
            AND uo.user_id = auth.uid()
            AND uo.is_active = true
        )
    );

-- Users can create organizations (handled by trigger)
-- Developers can update all organizations
CREATE POLICY "Developers can update all organizations" ON organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            JOIN organizations o ON uo.organization_id = o.id
            WHERE uo.user_id = auth.uid()
            AND o.subscription_plan = 'developer'
            AND uo.is_active = true
        )
    );

-- RLS Policies for user_organizations
-- Users can view user_organizations for their organizations
CREATE POLICY "Users can view user_organizations for their organizations" ON user_organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            WHERE uo.organization_id = user_organizations.organization_id
            AND uo.user_id = auth.uid()
            AND uo.is_active = true
        )
    );

-- Developers can manage user_organizations for all organizations
CREATE POLICY "Developers can manage user_organizations" ON user_organizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            JOIN organizations o ON uo.organization_id = o.id
            WHERE uo.user_id = auth.uid()
            AND o.subscription_plan = 'developer'
            AND uo.is_active = true
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_organizations TO authenticated;