# User Approval System Implementation

This document summarizes the changes made to implement the user approval system where new users have a "pending approval" status by default and admins can approve or reject them through the admin panel.

## Database Changes

### 1. Updated Organization Creation Trigger (007_fix_organization_creation_triggers.sql)

Modified the `create_default_organization_for_user` function to set new users as inactive (`is_active = false`) when they have pending approval status:

```sql
-- Add user as owner of the organization with pending approval status and inactive
INSERT INTO public.user_organizations (user_id, organization_id, role, approval_status, is_active)
VALUES (NEW.id, new_org_id, 'owner', 'pending', false);
```

Also updated the `get_current_user_organization_id` function to check both `is_active` and `approval_status`:

```sql
SELECT uo.organization_id INTO org_id
FROM user_organizations uo
WHERE uo.user_id = auth.uid()
AND uo.is_active = true
AND uo.approval_status = 'approved'
LIMIT 1;
```

### 2. Added User Approval Check Functions (015_add_user_approval_check_function.sql)

Created two new functions:

1. `is_user_approved_and_active(user_uuid UUID)` - Returns boolean indicating if user is approved and active
2. `get_user_approval_status_message(user_uuid UUID)` - Returns appropriate message based on user's approval status

```sql
-- Create function to check if a user is approved and active
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

-- Create function to get user approval status message
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
```

## Frontend Changes

### 1. Updated useAuth Hook (src/hooks/useAuth.ts)

Added approval status checking functionality:

- Added `approvalStatus` state to track user's approval status
- Added `checkUserApprovalStatus` function to call the RPC function
- Updated `signIn` function to check approval status after successful login
- Added `useEffect` to check approval status on auth state changes
- Added error handling for when the RPC function doesn't exist yet

### 2. Updated App Component (src/App.tsx)

Added logic to redirect users with non-approved status to the auth error page:

```typescript
// Check if user is logged in but not approved
// Only redirect if we have a valid approval status that is not 'approved'
if (user && approvalStatus && approvalStatus !== 'approved') {
    // Redirect to auth error page with the approval status message
    window.location.href = `/auth/error?message=${encodeURIComponent(approvalStatus)}`;
    return null;
}
```

### 3. Updated LoginRegister Component (src/components/Auth/LoginRegister.tsx)

Added useEffect to check approval status and redirect appropriately:

```typescript
// Check approval status after login
useEffect(() => {
    // Only redirect if we have a valid approval status that is not 'approved'
    if (approvalStatus && approvalStatus !== 'approved') {
        // User is logged in but not approved, redirect to auth error
        navigate(`/auth/error?message=${encodeURIComponent(approvalStatus)}`);
    }
}, [approvalStatus, navigate]);
```

### 4. Updated AuthError Component (src/pages/AuthError.tsx)

Enhanced the component to display appropriate icons and messages based on the approval status:

- Added icons for different statuses (pending, rejected, etc.)
- Added dynamic titles based on the message content
- Improved message display

## How It Works

1. When a new user registers, they are automatically added to an organization with:
   - `approval_status = 'pending'`
   - `is_active = false`

2. Pending users cannot access the site because:
   - The `get_current_user_organization_id` function only returns organizations where `is_active = true` AND `approval_status = 'approved'`
   - This prevents pending users from accessing protected routes

3. When an admin approves a user through the admin panel:
   - The `approve_user` function sets `approval_status = 'approved'` and `is_active = true`
   - The user can now access the site

4. When an admin rejects a user:
   - The `reject_user` function sets `approval_status = 'rejected'` and `is_active = false`
   - The user remains unable to access the site

5. When rejected or pending users try to log in:
   - The auth system checks their approval status
   - If not approved, they are redirected to the AuthError page with an appropriate message:
     - Pending users see: "Your application is pending approval. Please wait for an administrator to review your application."
     - Rejected users see: "Your application has been rejected. Please contact our support team via email."

## Quick Fix for Existing Users

If you're experiencing issues with existing accounts after implementing these changes, you can apply the quick fix migrations in `quick_fix_migrations.sql`:

1. This creates a simplified version of the `get_user_approval_status_message` function that assumes existing users are approved
2. Updates the organization creation trigger to only affect new users
3. Updates the organization lookup function to check approval status

## Manual Database Migration Steps

If you're unable to use the Supabase CLI to apply these migrations, you can manually apply them through the Supabase dashboard:

1. Apply the changes in `quick_fix_migrations.sql` first to resolve immediate issues
2. Then apply the full migrations in `apply_user_approval_migrations.sql` for complete functionality

## Testing

To test the implementation:

1. Register a new user account
2. Verify that the user appears in the admin panel with "Pending" status and is inactive
3. Try to log in as the pending user - you should be redirected to the AuthError page with the pending message
4. As an admin, approve the user - they should now be able to log in
5. As an admin, reject a different user - they should not be able to log in and should see the rejection message