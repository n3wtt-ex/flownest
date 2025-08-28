# Database Migrations

This directory contains SQL migration scripts that define the database schema and functions for the Flownest application.

## Migration Files

1. `001_create_users_contact_info_table.sql` - Creates the users_contact_info table
2. `002_add_rls_to_users_contact_info.sql` - Adds Row Level Security policies to users_contact_info
3. `003_add_user_metadata_update_permissions.sql` - Adds permissions for user metadata updates
4. `004_create_user_avatars_storage.sql` - Sets up storage for user avatars
5. `005_add_developer_subscription_plan.sql` - Adds developer subscription plan
6. `005_rollback_subscription_plan_enum.sql` - Rollback script for subscription plan enum
7. `006_create_support_tickets.sql` - Creates the support ticket system
8. `007_fix_organization_creation_triggers.sql` - Fixes organization creation triggers to prevent timing issues
9. `008_organizations_table_structure.sql` - Defines the organizations table structure
10. `009_support_tickets_system.sql` - Defines the support tickets system
11. `010_fix_ticket_messages_table.sql` - Fixes issues with the ticket_messages table
12. `011_update_rls_policies_for_enterprise_users.sql` - Updates RLS policies to include enterprise users

## Important Notes

- Migration files should be applied in numerical order
- Each migration file should be idempotent (safe to run multiple times)
- These migrations are designed to work with Supabase PostgreSQL database
- The `007_fix_organization_creation_triggers.sql` migration specifically addresses timing issues that occurred during user creation when multiple triggers tried to access organization information before it was created
- The `010_fix_ticket_messages_table.sql` migration addresses issues with the ticket_messages table where the organization_id column was missing and the trigger to automatically set it was missing
- The `011_update_rls_policies_for_enterprise_users.sql` migration updates the Row Level Security policies to allow both developer and enterprise plan users to view and manage all tickets and messages

## Applying Migrations

Migrations should be applied through the Supabase dashboard or using the Supabase CLI:

```bash
supabase db push
```

## Rolling Back Changes

Some migration files include rollback scripts. For others, you may need to manually revert changes or restore from a backup.