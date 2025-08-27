-- Create support ticket system and admin functionality
-- Migration: 006_create_support_tickets.sql

-- Create enum types for tickets
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE sender_type AS ENUM ('user', 'admin');

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status ticket_status DEFAULT 'open' NOT NULL,
    priority ticket_priority DEFAULT 'medium' NOT NULL,
    admin_response TEXT,
    responded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create ticket_messages table for conversation history
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    sender_type sender_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_organization_id ON support_tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_support_tickets_updated_at();

-- Enable Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
-- Users can view and create their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own tickets (limited fields)
CREATE POLICY "Users can update own tickets" ON support_tickets
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Developer plan users (admins) can view and manage all tickets
CREATE POLICY "Developers can view all tickets" ON support_tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            JOIN organizations o ON uo.organization_id = o.id
            WHERE uo.user_id = auth.uid() 
            AND o.subscription_plan = 'developer'
        )
    );

CREATE POLICY "Developers can update all tickets" ON support_tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            JOIN organizations o ON uo.organization_id = o.id
            WHERE uo.user_id = auth.uid() 
            AND o.subscription_plan = 'developer'
        )
    );

-- RLS Policies for ticket_messages
-- Users can view messages for their own tickets
CREATE POLICY "Users can view own ticket messages" ON ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets st
            WHERE st.id = ticket_messages.ticket_id 
            AND st.user_id = auth.uid()
        )
    );

-- Users can create messages for their own tickets
CREATE POLICY "Users can create messages for own tickets" ON ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets st
            WHERE st.id = ticket_messages.ticket_id 
            AND st.user_id = auth.uid()
        )
        AND sender_id = auth.uid()
        AND sender_type = 'user'
    );

-- Developer plan users (admins) can view and create messages for all tickets
CREATE POLICY "Developers can view all ticket messages" ON ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            JOIN organizations o ON uo.organization_id = o.id
            WHERE uo.user_id = auth.uid() 
            AND o.subscription_plan = 'developer'
        )
    );

CREATE POLICY "Developers can create messages for all tickets" ON ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            JOIN organizations o ON uo.organization_id = o.id
            WHERE uo.user_id = auth.uid() 
            AND o.subscription_plan = 'developer'
        )
        AND sender_id = auth.uid()
        AND sender_type = 'admin'
    );

-- Function to check if user has developer plan
CREATE OR REPLACE FUNCTION is_developer_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_organizations uo
        JOIN organizations o ON uo.organization_id = o.id
        WHERE uo.user_id = auth.uid() 
        AND o.subscription_plan = 'developer'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's subscription plan
CREATE OR REPLACE FUNCTION get_user_subscription_plan()
RETURNS TEXT AS $$
DECLARE
    plan TEXT;
BEGIN
    SELECT o.subscription_plan::TEXT INTO plan
    FROM user_organizations uo
    JOIN organizations o ON uo.organization_id = o.id
    WHERE uo.user_id = auth.uid()
    LIMIT 1;
    
    RETURN COALESCE(plan, 'starter');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user organization ID
CREATE OR REPLACE FUNCTION get_current_user_organization_id()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT uo.organization_id INTO org_id
    FROM user_organizations uo
    WHERE uo.user_id = auth.uid()
    AND uo.is_active = true
    LIMIT 1;
    
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON support_tickets TO authenticated;
GRANT SELECT, INSERT ON ticket_messages TO authenticated;
GRANT EXECUTE ON FUNCTION is_developer_user() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_plan() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_organization_id() TO authenticated;