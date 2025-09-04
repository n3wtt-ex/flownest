# Final User Approval System Implementation Guide

This document provides instructions for implementing the complete user approval system that ensures:
1. Pending users cannot access the site
2. Rejected users cannot access the site and see a specific message
3. Only approved and active users can log in

## Implementation Steps

### Step 1: Apply Database Migrations

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `complete_user_approval_system.sql` into the editor
4. Run the script

This will create all the necessary functions:
- `is_user_approved_and_active` - Checks if a user is approved and active
- `get_user_approval_status_message` - Returns appropriate messages based on user status
- Updated `get_current_user_organization_id` - Only allows approved and active users
- `approve_user` and `reject_user` - Admin functions for managing user approval

### Step 2: Verify Frontend Code

The frontend code has already been updated to:
- Check user approval status on login
- Redirect non-approved users to the AuthError page with appropriate messages
- Handle all three user statuses: approved, pending, and rejected

### Step 3: Test the Implementation

1. **Test existing approved users**:
   - Log in with your existing account
   - You should be able to access the site normally

2. **Test pending users**:
   - Create a new account or set an existing user's status to pending
   - Try to log in
   - You should be redirected to the AuthError page with the message:
     "Your application is pending approval. Please wait for an administrator to review your application."

3. **Test rejected users**:
   - Set a user's status to rejected using the admin panel or database
   - Try to log in
   - You should be redirected to the AuthError page with the message:
     "Your application has been rejected. Please contact our support team via email."

## How It Works

### Database Level
- The `get_current_user_organization_id` function only returns organizations for users who are both active and approved
- This prevents pending and rejected users from accessing protected routes in the application
- The `get_user_approval_status_message` function provides specific messages for each user status

### Frontend Level
- The `useAuth` hook checks user approval status on login
- The `App` component redirects non-approved users to the AuthError page
- The `AuthError` component displays appropriate messages based on user status

## Admin Panel Integration

The admin panel already has the functionality to:
- Approve pending users (sets status to approved and activates account)
- Reject pending users (sets status to rejected and deactivates account)
- View user approval status in the user management table

## Troubleshooting

### If users are still able to log in when they shouldn't:
1. Verify that the `get_current_user_organization_id` function is correctly implemented
2. Check that the user's `approval_status` and `is_active` fields are set correctly in the `user_organizations` table
3. Ensure the database functions have the correct permissions

### If users are being incorrectly blocked:
1. Verify that existing users have `approval_status = 'approved'` and `is_active = true`
2. Check that the `get_user_approval_status_message` function exists and is working correctly

## Rollback (if needed)

If you need to disable the approval system:

1. Restore the original `get_current_user_organization_id` function:
```sql
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
```

2. Drop the new functions:
```sql
DROP FUNCTION IF EXISTS is_user_approved_and_active(UUID);
DROP FUNCTION IF EXISTS get_user_approval_status_message(UUID);
```

## Contact for Support

If you continue to experience issues, please contact the development team with:
1. The exact error message you're seeing
2. Steps you've taken to try to resolve the issue
3. Any relevant screenshots of the error