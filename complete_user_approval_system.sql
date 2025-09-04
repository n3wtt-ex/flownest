-- Complete User Approval System Implementation
-- Run this script in your Supabase SQL editor

-- 1. Create function to check if a user is approved and active
CREATE OR REPLACE FUNCTION is_user_approved_and_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_status TEXT;
    user_active BOOLEAN;
BEGIN
    SELECT approval_status, is_active INTO user_status, user_active
    FROM user_organizations 
    WHERE user_id = user_uuid
    LIMIT 1;
    
    -- Return true only if user is approved and active
    RETURN user_status = 'approved' AND user_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create function to get user approval status message
CREATE OR REPLACE FUNCTION get_user_approval_status_message(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_status TEXT;
BEGIN
    SELECT approval_status INTO user_status
    FROM user_organizations 
    WHERE user_id = user_uuid
    LIMIT 1;
    
    -- Return appropriate message based on approval status
    IF user_status = 'approved' THEN
        RETURN 'approved';
    ELSIF user_status = 'pending' THEN
        RETURN 'Your application is pending approval. Please wait for an administrator to review your application.';
    ELSIF user_status = 'rejected' THEN
        RETURN 'Your application has been rejected. Please contact our support team via email.';
    ELSE
        RETURN 'Your account status is unknown. Please contact support.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update the get_current_user_organization_id function to be more strict
CREATE OR REPLACE FUNCTION get_current_user_organization_id()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    -- Only find organizations where the user is approved and active
    SELECT uo.organization_id INTO org_id
    FROM user_organizations uo
    WHERE uo.user_id = auth.uid()
    AND uo.is_active = true
    AND uo.approval_status = 'approved'
    LIMIT 1;
    
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION is_user_approved_and_active(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_approval_status_message(UUID) TO authenticated;

-- 5. Verify that approve_user and reject_user functions are correct
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

-- Migration completed successfully!