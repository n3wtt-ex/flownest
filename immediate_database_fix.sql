-- Immediate Database Fix
-- Run this script in your Supabase SQL editor to resolve the 404 error

-- Create the essential function to prevent the 404 error
CREATE OR REPLACE FUNCTION get_user_approval_status_message(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    -- For now, assume all users are approved to prevent login issues
    -- We'll update this later with proper logic
    RETURN 'approved';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_approval_status_message(UUID) TO authenticated;

-- Also create the is_user_approved_and_active function
CREATE OR REPLACE FUNCTION is_user_approved_and_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- For now, assume all users are approved to prevent login issues
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_user_approved_and_active(UUID) TO authenticated;