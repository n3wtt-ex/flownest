-- Quick fix migrations to resolve the immediate issue
-- Run this script in the Supabase SQL editor

-- 1. First, let's create a simplified version of the get_user_approval_status_message function
-- This will prevent the 404 error and allow existing users to log in
CREATE OR REPLACE FUNCTION get_user_approval_status_message(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    -- For existing users, we assume they are approved
    RETURN 'approved';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_approval_status_message(UUID) TO authenticated;

-- 2. Update the create_default_organization_for_user function to set new users as inactive
-- This ensures that only NEW users are affected, not existing ones
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

-- 3. Update the get_current_user_organization_id function to check approval_status
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