-- Migration: Fix ticket_messages table issues
-- This migration addresses issues with the ticket_messages table where:
-- 1. The organization_id column was missing
-- 2. The trigger to automatically set organization_id was missing
-- 3. The RLS policies needed to be updated

-- Add organization_id column to ticket_messages table
ALTER TABLE ticket_messages 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_ticket_messages_organization_id ON ticket_messages(organization_id);

-- Create trigger to automatically set organization_id
CREATE TRIGGER trigger_auto_set_organization_id_ticket_messages 
BEFORE INSERT ON ticket_messages 
FOR EACH ROW 
WHEN (NEW.organization_id IS NULL)
EXECUTE FUNCTION auto_set_organization_id();

-- Update the auto_set_organization_id function to handle ticket_messages specifically
CREATE OR REPLACE FUNCTION auto_set_organization_id()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
BEGIN
    -- If organization_id is not set, get it from current user or from related records
    IF NEW.organization_id IS NULL THEN
        -- First, try to get from current user
        org_id := get_current_user_organization_id();
        
        -- If that doesn't work and we're dealing with ticket_messages, get from the ticket
        IF org_id IS NULL AND TG_TABLE_NAME = 'ticket_messages' THEN
            SELECT organization_id INTO org_id
            FROM support_tickets
            WHERE id = NEW.ticket_id;
        END IF;
        
        -- Only set the organization_id if we found one
        -- If we don't have an organization yet, leave it NULL
        -- This allows records to be inserted during user creation process
        IF org_id IS NOT NULL THEN
            NEW.organization_id := org_id;
        END IF;
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error for debugging
        RAISE LOG 'Error in auto_set_organization_id: %', SQLERRM;
        -- Return the record as-is if there's an error
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the get_current_user_organization_id function to handle NULL auth.uid()
CREATE OR REPLACE FUNCTION get_current_user_organization_id()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
    current_user_id UUID;
BEGIN
    -- Try to get the current user ID
    current_user_id := auth.uid();
    
    -- If we can't get it from auth.uid(), return NULL
    IF current_user_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    SELECT uo.organization_id INTO org_id
    FROM user_organizations uo
    WHERE uo.user_id = current_user_id
    AND uo.is_active = true
    LIMIT 1;
    
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own ticket messages" ON ticket_messages;
DROP POLICY IF EXISTS "Users can create messages for own tickets" ON ticket_messages;
DROP POLICY IF EXISTS "Developers can view all ticket messages" ON ticket_messages;
DROP POLICY IF EXISTS "Developers can create messages for all tickets" ON ticket_messages;

-- Recreate policies with organization_id support
-- Users can view messages for their own tickets
CREATE POLICY "Users can view own ticket messages" ON ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets st
            WHERE st.id = ticket_messages.ticket_id 
            AND st.user_id = auth.uid()
        )
        OR ticket_messages.organization_id = get_current_user_organization_id()
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
        AND ticket_messages.organization_id = get_current_user_organization_id()
    );

-- Developer plan users (admins) can view and create messages for all tickets
CREATE POLICY "Developers can view all ticket messages" ON ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            JOIN organizations o ON uo.organization_id = o.id
            WHERE uo.user_id = auth.uid() 
            AND o.subscription_plan = 'developer'
            AND uo.is_active = true
        )
    );

CREATE POLICY "Developers can create messages for all tickets" ON ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            JOIN organizations o ON uo.organization_id = o.id
            WHERE uo.user_id = auth.uid() 
            AND o.subscription_plan = 'developer'
            AND uo.is_active = true
        )
        AND sender_id = auth.uid()
        AND sender_type = 'admin'
    );