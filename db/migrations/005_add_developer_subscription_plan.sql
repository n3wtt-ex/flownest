-- Migration: Add developer subscription plan type and convert to ENUM
-- This migration creates an ENUM type for subscription plans and updates the table

-- Step 1: Create the ENUM type for subscription plans
CREATE TYPE subscription_plan_type AS ENUM (
    'starter',
    'professional', 
    'enterprise',
    'developer'
);

-- Step 2: Add a new column with ENUM type
ALTER TABLE organizations 
ADD COLUMN subscription_plan_new subscription_plan_type DEFAULT 'starter';

-- Step 3: Copy data from old TEXT column to new ENUM column
UPDATE organizations 
SET subscription_plan_new = CASE 
    WHEN subscription_plan = 'starter' THEN 'starter'::subscription_plan_type
    WHEN subscription_plan = 'professional' THEN 'professional'::subscription_plan_type
    WHEN subscription_plan = 'enterprise' THEN 'enterprise'::subscription_plan_type
    WHEN subscription_plan = 'developer' THEN 'developer'::subscription_plan_type
    ELSE 'starter'::subscription_plan_type -- Default for any invalid values
END;

-- Step 4: Drop the old TEXT column
ALTER TABLE organizations DROP COLUMN subscription_plan;

-- Step 5: Rename the new column to the original name
ALTER TABLE organizations RENAME COLUMN subscription_plan_new TO subscription_plan;

-- Step 6: Add NOT NULL constraint
ALTER TABLE organizations ALTER COLUMN subscription_plan SET NOT NULL;

-- Example: Update a specific organization to developer plan
-- UPDATE organizations 
-- SET subscription_plan = 'developer'::subscription_plan_type
-- WHERE slug = 'your-dev-organization-slug';