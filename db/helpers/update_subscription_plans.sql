-- Helper Script: Update Organization Subscription Plans
-- This script provides safe methods to update subscription plans

-- =====================================================
-- EXAMPLE USAGE QUERIES
-- =====================================================

-- 1. View all organizations and their current plans
SELECT 
    id,
    name,
    slug,
    subscription_plan,
    created_at
FROM organizations 
ORDER BY created_at DESC;

-- 2. Update a specific organization by slug
/*
UPDATE organizations 
SET subscription_plan = 'professional'::subscription_plan_type
WHERE slug = 'organization-slug-here';
*/

-- 3. Update a specific organization by ID
/*
UPDATE organizations 
SET subscription_plan = 'enterprise'::subscription_plan_type
WHERE id = 'organization-uuid-here';
*/

-- 4. Update a specific organization by name
/*
UPDATE organizations 
SET subscription_plan = 'developer'::subscription_plan_type
WHERE name = 'Organization Name Here';
*/

-- 5. Bulk update multiple organizations
/*
UPDATE organizations 
SET subscription_plan = 'professional'::subscription_plan_type
WHERE id IN (
    'uuid-1',
    'uuid-2',
    'uuid-3'
);
*/

-- =====================================================
-- VALIDATION QUERIES
-- =====================================================

-- Check subscription plan distribution
SELECT 
    subscription_plan,
    COUNT(*) as count
FROM organizations 
GROUP BY subscription_plan 
ORDER BY count DESC;

-- Find organizations by specific plan
SELECT 
    id,
    name,
    slug,
    subscription_plan
FROM organizations 
WHERE subscription_plan = 'starter'::subscription_plan_type;

-- =====================================================
-- SAFE UPDATE TEMPLATE
-- =====================================================

-- Template for safe updates with verification
/*
BEGIN;

-- Show current state
SELECT id, name, slug, subscription_plan 
FROM organizations 
WHERE slug = 'target-organization-slug';

-- Perform the update
UPDATE organizations 
SET subscription_plan = 'new-plan-here'::subscription_plan_type
WHERE slug = 'target-organization-slug';

-- Verify the change
SELECT id, name, slug, subscription_plan 
FROM organizations 
WHERE slug = 'target-organization-slug';

-- If everything looks good, commit:
COMMIT;

-- If something is wrong, rollback:
-- ROLLBACK;
*/

-- =====================================================
-- AVAILABLE SUBSCRIPTION PLAN VALUES
-- =====================================================
-- 'starter'        - Basic plan
-- 'professional'   - Advanced plan  
-- 'enterprise'     - Premium plan
-- 'developer'      - Special developer access (hidden from regular users)