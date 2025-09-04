-- Script to manually apply user approval system migrations
-- Run this script in the Supabase SQL editor

-- 1. Update the create_default_organization_for_user function
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

-- 2. Update the get_current_user_organization_id function to be more lenient with existing users
CREATE OR REPLACE FUNCTION get_current_user_organization_id()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    -- First try to find an organization where the user is approved
    SELECT uo.organization_id INTO org_id
    FROM user_organizations uo
    WHERE uo.user_id = auth.uid()
    AND uo.is_active = true
    AND uo.approval_status = 'approved'
    LIMIT 1;
    
    -- If no approved organization is found, try to find any active organization (for existing users)
    IF org_id IS NULL THEN
        SELECT uo.organization_id INTO org_id
        FROM user_organizations uo
        WHERE uo.user_id = auth.uid()
        AND uo.is_active = true
        LIMIT 1;
    END IF;
    
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create function to check if a user is approved and active
CREATE OR REPLACE FUNCTION is_user_approved_and_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_status TEXT;
    user_active BOOLEAN;
BEGIN
    SELECT approval_status, is_active INTO user_status, user_active
    FROM user_organizations 
    WHERE user_id = user_uuid
    LIMIT 1;
    
    -- Return true only if user is approved and active
    RETURN user_status = 'approved' AND user_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to get user approval status message
CREATE OR REPLACE FUNCTION get_user_approval_status_message(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_status TEXT;
BEGIN
    SELECT approval_status INTO user_status
    FROM user_organizations 
    WHERE user_id = user_uuid
    LIMIT 1;
    
    -- Return appropriate message based on approval status
    IF user_status = 'approved' THEN
        RETURN 'approved';
    ELSIF user_status = 'pending' THEN
        RETURN 'Your application is pending approval. Please wait for an administrator to review your application.';
    ELSIF user_status = 'rejected' THEN
        RETURN 'Your application has been rejected. Please contact our support team via email.';
    ELSE
        RETURN 'Your account status is unknown. Please contact support.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant execute permissions
GRANT EXECUTE ON FUNCTION is_user_approved_and_active(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_approval_status_message(UUID) TO authenticated;

-- 6. Verify that approve_user and reject_user functions are correct
-- These should already be correct from migration 013, but let's ensure they are:

CREATE OR REPLACE FUNCTION approve_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Update the user's approval status to approved
    UPDATE user_organizations 
    SET approval_status = 'approved'
    WHERE user_id = user_uuid;
    
    -- Also ensure the user is active
    UPDATE user_organizations 
    SET is_active = true
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Update the user's approval status to rejected
    UPDATE user_organizations 
    SET approval_status = 'rejected'
    WHERE user_id = user_uuid;
    
    -- Also deactivate the user
    UPDATE user_organizations 
    SET is_active = false
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users (admins will have access through RLS)
GRANT EXECUTE ON FUNCTION approve_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_user(UUID) TO authenticated;

-- Migration completed successfully!