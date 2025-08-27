-- Rollback Migration: Convert subscription_plan back to TEXT
-- This migration reverts the ENUM type back to TEXT if needed

-- Step 1: Add a new TEXT column
ALTER TABLE organizations 
ADD COLUMN subscription_plan_text TEXT DEFAULT 'starter';

-- Step 2: Copy data from ENUM column to TEXT column
UPDATE organizations 
SET subscription_plan_text = subscription_plan::TEXT;

-- Step 3: Drop the ENUM column
ALTER TABLE organizations DROP COLUMN subscription_plan;

-- Step 4: Rename the TEXT column back to original name
ALTER TABLE organizations RENAME COLUMN subscription_plan_text TO subscription_plan;

-- Step 5: Add NOT NULL constraint
ALTER TABLE organizations ALTER COLUMN subscription_plan SET NOT NULL;

-- Step 6: Drop the ENUM type (only if no other tables use it)
DROP TYPE IF EXISTS subscription_plan_type;

-- Step 7: Add check constraint for validation (optional)
ALTER TABLE organizations 
ADD CONSTRAINT valid_subscription_plans 
CHECK (subscription_plan IN ('starter', 'professional', 'enterprise', 'developer'));