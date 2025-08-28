-- Migration: Update RLS policies to include enterprise users
-- This migration updates the Row Level Security policies for support_tickets and ticket_messages
-- to allow both developer and enterprise plan users to view and manage all tickets and messages

-- Update RLS policies for support_tickets to include enterprise users
DROP POLICY IF EXISTS "Developers can view all tickets" ON support_tickets;
CREATE POLICY "Developers and Enterprise users can view all tickets" ON support_tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            JOIN organizations o ON uo.organization_id = o.id
            WHERE uo.user_id = auth.uid() 
            AND (o.subscription_plan = 'developer' OR o.subscription_plan = 'enterprise')
            AND uo.is_active = true
        )
    );

DROP POLICY IF EXISTS "Developers can update all tickets" ON support_tickets;
CREATE POLICY "Developers and Enterprise users can update all tickets" ON support_tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            JOIN organizations o ON uo.organization_id = o.id
            WHERE uo.user_id = auth.uid() 
            AND (o.subscription_plan = 'developer' OR o.subscription_plan = 'enterprise')
            AND uo.is_active = true
        )
    );

-- Update RLS policies for ticket_messages to include enterprise users
DROP POLICY IF EXISTS "Developers can view all ticket messages" ON ticket_messages;
CREATE POLICY "Developers and Enterprise users can view all ticket messages" ON ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            JOIN organizations o ON uo.organization_id = o.id
            WHERE uo.user_id = auth.uid() 
            AND (o.subscription_plan = 'developer' OR o.subscription_plan = 'enterprise')
            AND uo.is_active = true
        )
    );

DROP POLICY IF EXISTS "Developers can create messages for all tickets" ON ticket_messages;
CREATE POLICY "Developers and Enterprise users can create messages for all tickets" ON ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            JOIN organizations o ON uo.organization_id = o.id
            WHERE uo.user_id = auth.uid() 
            AND (o.subscription_plan = 'developer' OR o.subscription_plan = 'enterprise')
            AND uo.is_active = true
        )
        AND sender_id = auth.uid()
        AND sender_type = 'admin'
    );