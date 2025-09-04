# Fix Instructions for User Approval System

This document provides step-by-step instructions to fix the issue with existing accounts being unable to log in after implementing the user approval system.

## Problem Summary

The issue occurs because the `get_user_approval_status_message` function hasn't been created in your database yet, which causes a 404 error when the frontend tries to call it. This prevents existing users from logging in.

## Solution Overview

We'll apply a quick fix to resolve the immediate issue, then implement the full user approval system.

## Step-by-Step Fix Instructions

### Step 1: Apply Quick Fix Migrations

1. Open the Supabase dashboard for your project
2. Navigate to the SQL editor
3. Copy and paste the contents of `quick_fix_migrations.sql` into the editor
4. Run the script

This will:
- Create a simplified version of the `get_user_approval_status_message` function
- Update the organization creation trigger
- Update the organization lookup function

### Step 2: Test Existing Account Access

1. Try logging in with your existing account
2. You should now be able to log in successfully

### Step 3: Apply Full Migrations (Optional but Recommended)

Once you've confirmed that existing accounts can log in:

1. In the Supabase SQL editor, copy and paste the contents of `apply_user_approval_migrations.sql`
2. Run the script

This will:
- Create the full `get_user_approval_status_message` function with proper logic
- Create the `is_user_approved_and_active` function
- Grant proper permissions

### Step 4: Test New User Registration

1. Register a new account
2. Try to log in with the new account
3. You should be redirected to the AuthError page with a pending approval message
4. Log in as an admin and approve the user
5. The user should now be able to log in successfully

## What Each Script Does

### quick_fix_migrations.sql
- Creates a simple version of `get_user_approval_status_message` that assumes all users are approved
- Updates the organization creation function to set new users as inactive with pending status
- Updates the organization lookup function to check approval status

### apply_user_approval_migrations.sql
- Contains the complete implementation with proper logic for all approval statuses
- Creates both approval checking functions
- Grants proper permissions

## Troubleshooting

### If you're still having issues logging in:

1. Clear your browser cache and cookies for the site
2. Try logging in again
3. Check the browser console for any error messages

### If new users aren't being set as pending:

1. Verify that the `create_default_organization_for_user` function was updated correctly
2. Check that new users have `approval_status = 'pending'` and `is_active = false` in the `user_organizations` table

### If approved users can't access the site:

1. Verify that the `get_current_user_organization_id` function checks both `is_active` and `approval_status`
2. Check that approved users have `approval_status = 'approved'` and `is_active = true`

## Rollback Instructions

If you need to rollback the changes:

1. In the Supabase SQL editor, you can recreate the original functions:

```sql
-- Restore original create_default_organization_for_user function
CREATE OR REPLACE FUNCTION create_default_organization_for_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    user_email TEXT;
    base_slug TEXT;
    slug_counter INTEGER := 0;
    final_slug TEXT;
BEGIN
    -- Get user email
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
    
    -- Create a base slug
    base_slug := LOWER(REPLACE(COALESCE(user_email, NEW.id::text), '@', '-'));
    final_slug := base_slug;
    
    -- Check if slug already exists and create a unique one if needed
    WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = final_slug) LOOP
        slug_counter := slug_counter + 1;
        final_slug := base_slug || '-' || slug_counter;
    END LOOP;
    
    -- Create a default organization
    INSERT INTO public.organizations (name, slug, domain, subscription_plan)
    VALUES (
        COALESCE(user_email, 'My Organization'),
        final_slug,
        CASE 
            WHEN user_email LIKE '%@%' THEN SPLIT_PART(user_email, '@', 2)
            ELSE NULL
        END,
        -- Use the proper enum type
        'starter'::public.subscription_plan_type
    )
    RETURNING id INTO new_org_id;
    
    -- Add user as owner of the organization (original version)
    INSERT INTO public.user_organizations (user_id, organization_id, role)
    VALUES (NEW.id, new_org_id, 'owner');
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error for debugging
        RAISE LOG 'Error in create_default_organization_for_user: %', SQLERRM;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore original get_current_user_organization_id function
CREATE OR REPLACE FUNCTION get_current_user_organization_id()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT uo.organization_id INTO org_id
    FROM user_organizations uo
    WHERE uo.user_id = auth.uid()
    AND uo.is_active = true
    LIMIT 1;
    
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the new functions
DROP FUNCTION IF EXISTS get_user_approval_status_message(UUID);
DROP FUNCTION IF EXISTS is_user_approved_and_active(UUID);
```

## Contact for Support

If you continue to experience issues, please contact the development team with:
1. The exact error message you're seeing
2. Steps you've taken to try to resolve the issue
3. Any relevant screenshots of the error