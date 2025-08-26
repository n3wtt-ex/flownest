-- Data Migration Script for Multi-Tenant Setup
-- This script assigns existing data to a default organization

-- Step 1: Create a default organization if none exists
DO $$
DECLARE
    default_org_id UUID;
BEGIN
    -- Check if any organization exists
    SELECT id INTO default_org_id FROM organizations LIMIT 1;
    
    -- If no organization exists, create a default one
    IF default_org_id IS NULL THEN
        INSERT INTO organizations (name, slug, domain, subscription_plan)
        VALUES ('Default Organization', 'default-org', NULL, 'professional')
        RETURNING id INTO default_org_id;
        
        RAISE NOTICE 'Created default organization with ID: %', default_org_id;
    ELSE
        RAISE NOTICE 'Using existing organization with ID: %', default_org_id;
    END IF;
    
    -- Step 2: Update all existing records to belong to the default organization
    
    -- Update owners
    UPDATE owners 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;
    
    -- Update companies
    UPDATE companies 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;
    
    -- Update contacts
    UPDATE contacts 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;
    
    -- Update deals
    UPDATE deals 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;
    
    -- Update pipelines
    UPDATE pipelines 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;
    
    -- Update pipeline_stages
    UPDATE pipeline_stages 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;
    
    -- Update activities
    UPDATE activities 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;
    
    -- Update campaigns
    UPDATE campaigns 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;
    
    -- Update leads
    UPDATE leads 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;
    
    -- Update workspace
    UPDATE workspace 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;
    
    -- Update agent_chat
    UPDATE agent_chat 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;
    
    RAISE NOTICE 'Migration completed successfully';
    
END $$;

-- Step 3: Make organization_id NOT NULL for critical tables (optional, after verifying data)
-- Uncomment these lines after ensuring all data has been migrated properly

-- ALTER TABLE owners ALTER COLUMN organization_id SET NOT NULL;
-- ALTER TABLE companies ALTER COLUMN organization_id SET NOT NULL;
-- ALTER TABLE contacts ALTER COLUMN organization_id SET NOT NULL;
-- ALTER TABLE deals ALTER COLUMN organization_id SET NOT NULL;
-- ALTER TABLE pipelines ALTER COLUMN organization_id SET NOT NULL;
-- ALTER TABLE pipeline_stages ALTER COLUMN organization_id SET NOT NULL;
-- ALTER TABLE campaigns ALTER COLUMN organization_id SET NOT NULL;

-- Step 4: Add current authenticated users to the default organization
-- This should be run manually for each existing user
-- INSERT INTO user_organizations (user_id, organization_id, role)
-- SELECT id, (SELECT id FROM organizations LIMIT 1), 'owner'
-- FROM auth.users
-- WHERE id NOT IN (SELECT user_id FROM user_organizations);

-- Verification queries to check the migration
SELECT 'owners' as table_name, COUNT(*) as total_records, COUNT(organization_id) as with_org_id FROM owners
UNION ALL
SELECT 'companies', COUNT(*), COUNT(organization_id) FROM companies
UNION ALL
SELECT 'contacts', COUNT(*), COUNT(organization_id) FROM contacts
UNION ALL
SELECT 'deals', COUNT(*), COUNT(organization_id) FROM deals
UNION ALL
SELECT 'campaigns', COUNT(*), COUNT(organization_id) FROM campaigns
UNION ALL
SELECT 'pipelines', COUNT(*), COUNT(organization_id) FROM pipelines
UNION ALL
SELECT 'pipeline_stages', COUNT(*), COUNT(organization_id) FROM pipeline_stages
UNION ALL
SELECT 'activities', COUNT(*), COUNT(organization_id) FROM activities
UNION ALL
SELECT 'leads', COUNT(*), COUNT(organization_id) FROM leads
UNION ALL
SELECT 'workspace', COUNT(*), COUNT(organization_id) FROM workspace
UNION ALL
SELECT 'agent_chat', COUNT(*), COUNT(organization_id) FROM agent_chat;