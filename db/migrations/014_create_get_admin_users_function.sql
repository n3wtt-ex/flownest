-- Migration: Create function to get admin users with approval status
-- This migration creates a function that returns user information for admin panel

-- Create function to get all users with their organization and approval information
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
    user_id UUID,
    user_email TEXT,
    user_created_at TIMESTAMPTZ,
    user_metadata JSONB,
    organization_id UUID,
    organization_name TEXT,
    subscription_plan subscription_plan_type,
    organization_is_active BOOLEAN,
    role TEXT,
    joined_at TIMESTAMPTZ,
    is_active BOOLEAN,
    approval_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.email as user_email,
        u.created_at as user_created_at,
        u.raw_user_meta_data as user_metadata,
        o.id as organization_id,
        o.name as organization_name,
        o.subscription_plan,
        o.is_active as organization_is_active,
        uo.role,
        uo.joined_at,
        uo.is_active,
        uo.approval_status
    FROM auth.users u
    JOIN user_organizations uo ON u.id = uo.user_id
    JOIN organizations o ON uo.organization_id = o.id
    ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;