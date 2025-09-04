-- Migration: Add function to approve users
-- This migration creates a function that admins can use to approve pending users

-- Create function to approve a user
CREATE OR REPLACE FUNCTION approve_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Update the user's approval status to approved
    UPDATE user_organizations 
    SET approval_status = 'approved'
    WHERE user_id = user_uuid;
    
    -- Also ensure the user is active
    UPDATE user_organizations 
    SET is_active = true
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reject a user
CREATE OR REPLACE FUNCTION reject_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Update the user's approval status to rejected
    UPDATE user_organizations 
    SET approval_status = 'rejected'
    WHERE user_id = user_uuid;
    
    -- Also deactivate the user
    UPDATE user_organizations 
    SET is_active = false
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users (admins will have access through RLS)
GRANT EXECUTE ON FUNCTION approve_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_user(UUID) TO authenticated;