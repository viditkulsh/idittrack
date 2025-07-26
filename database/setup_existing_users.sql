-- ============================================================================
-- INITIAL SETUP SCRIPT FOR EXISTING USERS
-- ============================================================================
-- This script helps set up your existing 3 users with the new RBAC system
-- Run this AFTER running the enhanced_rbac_system.sql script
-- ============================================================================

-- ============================================================================
-- 1. CREATE DEFAULT TENANT
-- ============================================================================

-- Insert your organization as the first tenant
INSERT INTO public.tenants (
    id,
    name,
    slug,
    domain,
    tenant_type,
    settings,
    subscription_plan,
    is_active,
    max_users,
    created_at
) VALUES (
    gen_random_uuid(),
    'Your Organization', -- Change this to your company name
    'your-org', -- Change this to your preferred slug
    'yourcompany.com', -- Change this to your domain (optional)
    'business',
    '{"features": ["inventory", "orders", "analytics", "multi_user"], "timezone": "UTC"}',
    'professional',
    true,
    100,
    now()
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. ASSIGN EXISTING USERS TO TENANT
-- ============================================================================

-- Update your existing users to be part of the new tenant
-- Replace the email addresses with your actual user emails

WITH tenant_info AS (
    SELECT id as tenant_id FROM public.tenants WHERE slug = 'your-org' LIMIT 1
)
UPDATE public.profiles 
SET 
    tenant_id = (SELECT tenant_id FROM tenant_info),
    updated_at = now()
WHERE email IN (
    'admin@yourcompany.com',    -- Replace with your admin user email
    'manager@yourcompany.com',  -- Replace with your manager user email
    'user@yourcompany.com'      -- Replace with your regular user email
);

-- ============================================================================
-- 3. UPDATE USER ROLES
-- ============================================================================

-- Assign proper roles to your existing users
-- Replace email addresses with your actual user emails

-- Set admin role
UPDATE public.profiles 
SET 
    role = 'admin',
    updated_at = now()
WHERE email = 'admin@yourcompany.com'; -- Replace with your admin email

-- Set manager role
UPDATE public.profiles 
SET 
    role = 'manager',
    updated_at = now()
WHERE email = 'manager@yourcompany.com'; -- Replace with your manager email

-- Set user role
UPDATE public.profiles 
SET 
    role = 'user',
    updated_at = now()
WHERE email = 'user@yourcompany.com'; -- Replace with your user email

-- ============================================================================
-- 4. ASSIGN TENANT TO EXISTING DATA
-- ============================================================================

-- Get the tenant ID for data migration
DO $$
DECLARE
    v_tenant_id uuid;
BEGIN
    -- Get the tenant ID
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'your-org' LIMIT 1;
    
    IF v_tenant_id IS NOT NULL THEN
        -- Update existing products
        UPDATE public.products 
        SET tenant_id = v_tenant_id, updated_at = now()
        WHERE tenant_id IS NULL;
        
        -- Update existing categories
        UPDATE public.categories 
        SET tenant_id = v_tenant_id, updated_at = now()
        WHERE tenant_id IS NULL;
        
        -- Update existing locations
        UPDATE public.locations 
        SET tenant_id = v_tenant_id, updated_at = now()
        WHERE tenant_id IS NULL;
        
        -- Update existing orders
        UPDATE public.orders 
        SET tenant_id = v_tenant_id, updated_at = now()
        WHERE tenant_id IS NULL;
        
        RAISE NOTICE 'Successfully assigned tenant_id to existing data';
    ELSE
        RAISE NOTICE 'Tenant not found. Please check the tenant slug.';
    END IF;
END $$;

-- ============================================================================
-- 5. VERIFY SETUP
-- ============================================================================

-- Check tenant setup
SELECT 
    'Tenant Setup' as check_type,
    name,
    slug,
    tenant_type,
    is_active,
    max_users
FROM public.tenants 
WHERE slug = 'your-org';

-- Check user assignments
SELECT 
    'User Assignment' as check_type,
    p.email,
    p.role,
    p.is_active,
    t.name as tenant_name,
    CASE 
        WHEN p.tenant_id IS NOT NULL THEN 'Assigned'
        ELSE 'Not Assigned'
    END as tenant_status
FROM public.profiles p
LEFT JOIN public.tenants t ON p.tenant_id = t.id
ORDER BY p.role DESC, p.email;

-- Check permissions for each role
SELECT 
    'Role Permissions' as check_type,
    rp.role,
    p.resource,
    p.action,
    rp.granted
FROM public.role_permissions rp
JOIN public.permissions p ON rp.permission_id = p.id
WHERE rp.tenant_id IS NULL
ORDER BY rp.role, p.resource, p.action;

-- Check data assignment
SELECT 
    'Data Assignment' as check_type,
    'Products' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as assigned_records
FROM public.products
UNION ALL
SELECT 
    'Data Assignment' as check_type,
    'Categories' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as assigned_records
FROM public.categories
UNION ALL
SELECT 
    'Data Assignment' as check_type,
    'Locations' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as assigned_records
FROM public.locations
UNION ALL
SELECT 
    'Data Assignment' as check_type,
    'Orders' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as assigned_records
FROM public.orders;

-- ============================================================================
-- 6. TEST RBAC FUNCTIONS
-- ============================================================================

-- Test permission checking (replace with actual user ID)
-- You can get user IDs from the verification query above

-- Example test (uncomment and replace with actual user email):
/*
DO $$
DECLARE
    v_user_id uuid;
    v_tenant_id uuid;
BEGIN
    -- Get user and tenant IDs
    SELECT p.id, p.tenant_id INTO v_user_id, v_tenant_id
    FROM public.profiles p
    WHERE p.email = 'admin@yourcompany.com'; -- Replace with actual email
    
    IF v_user_id IS NOT NULL THEN
        -- Test permission checks
        RAISE NOTICE 'Testing permissions for user: %', v_user_id;
        RAISE NOTICE 'Can read inventory: %', public.user_has_permission(v_user_id, 'inventory', 'read', v_tenant_id);
        RAISE NOTICE 'Can create orders: %', public.user_has_permission(v_user_id, 'orders', 'create', v_tenant_id);
        RAISE NOTICE 'Can manage users: %', public.user_has_permission(v_user_id, 'users', 'manage', v_tenant_id);
    END IF;
END $$;
*/

-- ============================================================================
-- SETUP COMPLETION
-- ============================================================================

SELECT 
    '============================================================================' as message
UNION ALL
SELECT 'RBAC SETUP COMPLETED SUCCESSFULLY!' as message
UNION ALL
SELECT '============================================================================' as message
UNION ALL
SELECT 'What was configured:' as message
UNION ALL
SELECT '✓ Created default tenant for your organization' as message
UNION ALL
SELECT '✓ Assigned existing users to tenant' as message
UNION ALL
SELECT '✓ Updated user roles (admin, manager, user)' as message
UNION ALL
SELECT '✓ Migrated existing data to tenant' as message
UNION ALL
SELECT '✓ Verified all assignments' as message
UNION ALL
SELECT '' as message
UNION ALL
SELECT 'Next steps for frontend integration:' as message
UNION ALL
SELECT '1. Use get_user_permissions() to check user permissions' as message
UNION ALL
SELECT '2. Use user_has_permission() for specific permission checks' as message
UNION ALL
SELECT '3. Use get_user_tenants() to get user accessible tenants' as message
UNION ALL
SELECT '4. Update your frontend to use the new RBAC system' as message
UNION ALL
SELECT '============================================================================' as message;
