# Comprehensive Fix Instructions

This document provides step-by-step instructions to fix the login issue and implement the complete user approval system.

## Problem Summary

You're experiencing a 404 error when trying to log in with both active and inactive accounts because the required database functions don't exist yet:
- `get_user_approval_status_message`
- `is_user_approved_and_active`

## Solution Overview

We need to:
1. Create the missing database functions
2. Ensure the frontend code handles missing functions gracefully
3. Implement the complete user approval workflow

## Step-by-Step Fix Instructions

### Step 1: Apply Immediate Database Fix

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `immediate_database_fix.sql` into the editor
4. Run the script

This will create the essential functions to prevent the 404 error:
- `get_user_approval_status_message` - Returns 'approved' for all users (temporary)
- `is_user_approved_and_active` - Returns TRUE for all users (temporary)

### Step 2: Test Login

After applying the database fix:
1. Try logging in with both your active and inactive accounts
2. You should now be able to log in without the 404 error

### Step 3: Apply Complete User Approval System (Optional but Recommended)

Once you've confirmed that login works:

1. In the Supabase SQL editor, copy and paste the contents of `complete_user_approval_system.sql`
2. Run the script

This will:
- Update the functions with proper logic for all user statuses
- Ensure pending and rejected users cannot access the site
- Provide specific messages for each user status

### Step 4: Verify Frontend Code

The frontend code has been updated to:
- Handle missing database functions gracefully
- Check user approval status properly
- Redirect non-approved users with appropriate messages
- Maintain backward compatibility with existing users

## What Each Script Does

### immediate_database_fix.sql
- Creates minimal versions of the required functions
- Prevents 404 errors
- Allows all users to log in temporarily

### complete_user_approval_system.sql
- Contains the complete implementation with proper logic
- Implements the full user approval workflow
- Ensures security for pending and rejected users

## Troubleshooting

### If you're still having issues logging in:

1. Clear your browser cache and cookies for the site
2. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
3. Try logging in again

### If the functions still don't exist:

1. Check that you ran the SQL script in the correct Supabase project
2. Verify the functions exist in the database:
   ```sql
   SELECT proname FROM pg_proc WHERE proname LIKE '%approval%';
   ```

### If users are being incorrectly blocked:

1. Check that existing users have the correct `approval_status` and `is_active` values
2. You can temporarily set all existing users to approved:
   ```sql
   UPDATE user_organizations 
   SET approval_status = 'approved', is_active = true 
   WHERE approval_status IS NULL OR approval_status = '';
   ```

## Rollback Instructions

If you need to rollback the changes:

1. In the Supabase SQL editor, drop the functions:
   ```sql
   DROP FUNCTION IF EXISTS get_user_approval_status_message(UUID);
   DROP FUNCTION IF EXISTS is_user_approved_and_active(UUID);
   ```

2. Restore the original functions if needed.

## Contact for Support

If you continue to experience issues, please contact the development team with:
1. The exact error message you're seeing
2. Steps you've taken to try to resolve the issue
3. Any relevant screenshots of the error