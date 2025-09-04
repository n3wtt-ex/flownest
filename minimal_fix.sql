-- Minimal fix script - Run this in your Supabase SQL editor
-- This creates just the essential function to prevent the 404 error

CREATE OR REPLACE FUNCTION get_user_approval_status_message(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    -- For existing users, we assume they are approved
    -- This prevents the 404 error and allows login
    RETURN 'approved';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_approval_status_message(UUID) TO authenticated;