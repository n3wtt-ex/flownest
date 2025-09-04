-- Migration: Fix organization creation triggers to prevent timing issues
-- This migration fixes the issue where auto_set_organization_id was raising exceptions
-- during user creation before the organization was created

-- Fix the create_default_organization_for_user function
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
    
    -- Add user as owner of the organization with pending approval status and inactive
    INSERT INTO public.user_organizations (user_id, organization_id, role, approval_status, is_active)
    VALUES (NEW.id, new_org_id, 'owner', 'pending', false);
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error for debugging
        RAISE LOG 'Error in create_default_organization_for_user: %', SQLERRM;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the auto_set_organization_id function to be more graceful
CREATE OR REPLACE FUNCTION auto_set_organization_id()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
BEGIN
    -- If organization_id is not set, get it from current user
    IF NEW.organization_id IS NULL THEN
        org_id := get_current_user_organization_id();
        
        -- Only set the organization_id if we found one
        -- If we don't have an organization yet, leave it NULL
        -- This allows records to be inserted during user creation process
        IF org_id IS NOT NULL THEN
            NEW.organization_id := org_id;
        END IF;
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error for debugging
        RAISE LOG 'Error in auto_set_organization_id: %', SQLERRM;
        -- Return the record as-is if there's an error
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the get_current_user_organization_id function is correct
-- This function now checks both is_active and approval_status
CREATE OR REPLACE FUNCTION get_current_user_organization_id()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT uo.organization_id INTO org_id
    FROM user_organizations uo
    WHERE uo.user_id = auth.uid()
    AND uo.is_active = true
    AND uo.approval_status = 'approved'
    LIMIT 1;
    
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;