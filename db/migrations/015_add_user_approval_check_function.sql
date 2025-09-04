-- Migration: Add function to check user approval status
-- This migration creates a function that can be used to check if a user is approved and active

-- Create function to check if a user is approved and active
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

-- Create function to get user approval status message
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_user_approved_and_active(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_approval_status_message(UUID) TO authenticated;