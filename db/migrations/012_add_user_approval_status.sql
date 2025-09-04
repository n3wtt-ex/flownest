-- Migration: Add user approval status
-- This migration adds a new column to track user approval status

-- Add approval_status column to user_organizations table
ALTER TABLE user_organizations 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';

-- Add comment to explain the possible values
COMMENT ON COLUMN user_organizations.approval_status IS 'User approval status: pending, approved, rejected';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_organizations_approval_status ON user_organizations(approval_status);

-- Update existing users to have 'approved' status (they are already approved)
UPDATE user_organizations 
SET approval_status = 'approved' 
WHERE approval_status = 'pending';

-- Add a check constraint to ensure valid values
ALTER TABLE user_organizations 
ADD CONSTRAINT valid_approval_status 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));