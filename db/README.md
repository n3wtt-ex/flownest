# Database Schema and Migrations

This directory contains the database schema definitions and migration scripts for the Flownest application.

## Directory Structure

- `migrations/` - SQL migration scripts that define the database schema and functions
- `helpers/` - Helper scripts and functions
- `001_crm_schema.sql` - Original CRM schema definition
- `002_policies.sql` - Row Level Security policies
- `003_seed.sql` - Seed data for initial setup
- `supabase_schema.sql` - Additional Supabase-specific schema

## Migration Process

Database changes should be made through migration files in the `migrations/` directory rather than direct schema modifications. This ensures:

1. Changes are version-controlled
2. Changes can be applied consistently across environments
3. Changes can be rolled back if needed
4. The database schema evolution is documented

## Important Migrations

The most recent migrations address critical issues:

- `007_fix_organization_creation_triggers.sql` - Fixes timing issues during user creation
- `008_organizations_table_structure.sql` - Defines the multi-tenant organization structure
- `009_support_tickets_system.sql` - Implements the support ticket system

These migrations should be applied in order to maintain database integrity.