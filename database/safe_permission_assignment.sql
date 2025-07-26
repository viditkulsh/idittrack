-- ============================================================================
-- SAFE PERMISSION ASSIGNMENT SCRIPT - NO CONFLICTS
-- ============================================================================
-- This script only assigns permissions to users without creating new permissions
-- Run this if the main script caused conflicts
-- ============================================================================

-- ============================================================================
-- 1. CHECK EXISTING SETUP
-- ============================================================================

-- Check if we have the basic tables and permissions
DO $$
BEGIN
    -- Check if permissions table exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
        RAISE NOTICE 'Permissions table found with % records', (SELECT COUNT(*) FROM permissions);
    ELSE
        RAISE EXCEPTION 'Permissions table not found. Please run the enhanced_rbac_system.sql first.';
    END IF;
    
    -- Check if tenants table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
        RAISE NOTICE 'Tenants table found with % records', (SELECT COUNT(*) FROM tenants);
    ELSE
        RAISE EXCEPTION 'Tenants table not found. Please run the enhanced_rbac_system.sql first.';
    END IF;
END
$$;

-- ============================================================================
-- 2. ENSURE DEFAULT TENANT EXISTS
-- ============================================================================

INSERT INTO public.tenants (
    id,
    name,
    slug,
    tenant_type,
    settings,
    subscription_plan,
    is_active,
    max_users,
    created_at
) VALUES (
    gen_random_uuid(),
    'Default Organization',
    'default-org',
    'business',
    '{"features": ["inventory", "orders", "analytics", "multi_user"], "timezone": "UTC"}',
    'professional',
    true,
    100,
    now()
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 3. ASSIGN USERS TO DEFAULT TENANT (SAFE)
-- ============================================================================

-- Update all existing users to be part of the default tenant (only if they don't have one)
WITH tenant_info AS (
    SELECT id as tenant_id FROM public.tenants WHERE slug = 'default-org' LIMIT 1
)
UPDATE public.profiles 
SET 
    tenant_id = (SELECT tenant_id FROM tenant_info),
    updated_at = now()
WHERE tenant_id IS NULL 
   OR tenant_id NOT IN (SELECT id FROM public.tenants);

-- ============================================================================
-- 4. SAFE PERMISSION ASSIGNMENT
-- ============================================================================

-- Assign permissions to admin users (only if they don't already have them)
WITH admin_users AS (
    SELECT id as user_id FROM public.profiles WHERE role = 'admin'
),
existing_permissions AS (
    SELECT id as permission_id, resource, action FROM public.permissions
),
default_tenant AS (
    SELECT id as tenant_id FROM public.tenants WHERE slug = 'default-org'
)
INSERT INTO public.user_permissions (
    id,
    user_id,
    permission_id,
    tenant_id,
    granted,
    granted_by,
    granted_at,
    created_at
)
SELECT 
    gen_random_uuid(),
    admin_users.user_id,
    existing_permissions.permission_id,
    default_tenant.tenant_id,
    true,
    admin_users.user_id, -- Self-granted for admins
    now(),
    now()
FROM admin_users
CROSS JOIN existing_permissions
CROSS JOIN default_tenant
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_permissions up2 
    WHERE up2.user_id = admin_users.user_id 
    AND up2.permission_id = existing_permissions.permission_id
    AND up2.tenant_id = default_tenant.tenant_id
);

-- Assign basic permissions to manager users (safe)
WITH manager_users AS (
    SELECT id as user_id FROM public.profiles WHERE role = 'manager'
),
manager_permissions AS (
    SELECT id as permission_id FROM public.permissions 
    WHERE (resource IN ('products', 'orders', 'inventory', 'locations') 
           AND action IN ('create', 'read', 'update', 'delete'))
       OR (resource = 'analytics' AND action = 'read')
),
default_tenant AS (
    SELECT id as tenant_id FROM public.tenants WHERE slug = 'default-org'
)
INSERT INTO public.user_permissions (
    id,
    user_id,
    permission_id,
    tenant_id,
    granted,
    granted_by,
    granted_at,
    created_at
)
SELECT 
    gen_random_uuid(),
    manager_users.user_id,
    manager_permissions.permission_id,
    default_tenant.tenant_id,
    true,
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    now(),
    now()
FROM manager_users
CROSS JOIN manager_permissions
CROSS JOIN default_tenant
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_permissions up2 
    WHERE up2.user_id = manager_users.user_id 
    AND up2.permission_id = manager_permissions.permission_id
    AND up2.tenant_id = default_tenant.tenant_id
);

-- Assign read permissions to regular users (safe)
WITH regular_users AS (
    SELECT id as user_id FROM public.profiles WHERE role = 'user'
),
read_permissions AS (
    SELECT id as permission_id FROM public.permissions 
    WHERE action = 'read'
),
default_tenant AS (
    SELECT id as tenant_id FROM public.tenants WHERE slug = 'default-org'
)
INSERT INTO public.user_permissions (
    id,
    user_id,
    permission_id,
    tenant_id,
    granted,
    granted_by,
    granted_at,
    created_at
)
SELECT 
    gen_random_uuid(),
    regular_users.user_id,
    read_permissions.permission_id,
    default_tenant.tenant_id,
    true,
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    now(),
    now()
FROM regular_users
CROSS JOIN read_permissions
CROSS JOIN default_tenant
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_permissions up2 
    WHERE up2.user_id = regular_users.user_id 
    AND up2.permission_id = read_permissions.permission_id
    AND up2.tenant_id = default_tenant.tenant_id
);

-- ============================================================================
-- 5. VERIFICATION
-- ============================================================================

DO $$
DECLARE
    admin_count int;
    manager_count int;
    user_count int;
    total_permissions int;
BEGIN
    SELECT COUNT(*) INTO total_permissions FROM public.permissions;
    
    SELECT COUNT(*) INTO admin_count 
    FROM public.user_permissions up
    JOIN public.profiles p ON up.user_id = p.id
    WHERE p.role = 'admin';
    
    SELECT COUNT(*) INTO manager_count 
    FROM public.user_permissions up
    JOIN public.profiles p ON up.user_id = p.id
    WHERE p.role = 'manager';
    
    SELECT COUNT(*) INTO user_count 
    FROM public.user_permissions up
    JOIN public.profiles p ON up.user_id = p.id
    WHERE p.role = 'user';
    
    RAISE NOTICE '=== PERMISSION ASSIGNMENT COMPLETE ===';
    RAISE NOTICE 'Total permissions available: %', total_permissions;
    RAISE NOTICE 'Admin permission assignments: %', admin_count;
    RAISE NOTICE 'Manager permission assignments: %', manager_count;
    RAISE NOTICE 'User permission assignments: %', user_count;
    RAISE NOTICE '=== STATUS: SUCCESS ===';
END
$$;
