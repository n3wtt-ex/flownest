-- Migration: Add developer subscription plan type
-- This migration adds the 'developer' option to subscription plans

-- Update the organizations table to allow 'developer' subscription plan
-- Note: PostgreSQL doesn't have built-in enum types in this schema, 
-- so we're using TEXT with check constraints or just TEXT field

-- Add a comment to document the valid subscription plan values
COMMENT ON COLUMN organizations.subscription_plan IS 'Valid values: starter, professional, enterprise, developer';

-- Optionally, you can add a check constraint to enforce valid values:
-- ALTER TABLE organizations 
-- ADD CONSTRAINT valid_subscription_plans 
-- CHECK (subscription_plan IN ('starter', 'professional', 'enterprise', 'developer'));

-- Update any existing organizations that might need the developer plan
-- (This would typically be done manually by an admin)

-- Example: Update a specific organization to developer plan
-- UPDATE organizations 
-- SET subscription_plan = 'developer' 
-- WHERE slug = 'your-dev-organization-slug';