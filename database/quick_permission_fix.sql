-- ============================================================================
-- QUICK FIX FOR PERMISSIONS - RUN THIS IN YOUR SUPABASE SQL EDITOR
-- ============================================================================
-- This script will set up basic permissions for admin and manager users
-- so they can see the Add Product and Create Order buttons
-- ============================================================================

-- ============================================================================
-- 1. CREATE BASIC PERMISSIONS (if not exist)
-- ============================================================================

-- Insert basic permissions for products (handle duplicates)
INSERT INTO public.permissions (id, name, description, resource, action, scope, is_system, created_at) VALUES
(gen_random_uuid(), 'products:create', 'Create new products', 'products', 'create', 'tenant', true, now()),
(gen_random_uuid(), 'products:read', 'View products', 'products', 'read', 'tenant', true, now()),
(gen_random_uuid(), 'products:update', 'Update products', 'products', 'update', 'tenant', true, now()),
(gen_random_uuid(), 'products:delete', 'Delete products', 'products', 'delete', 'tenant', true, now())
ON CONFLICT (resource, action, scope) DO NOTHING;

-- Insert basic permissions for orders (handle duplicates)
INSERT INTO public.permissions (id, name, description, resource, action, scope, is_system, created_at) VALUES
(gen_random_uuid(), 'orders:create', 'Create new orders', 'orders', 'create', 'tenant', true, now()),
(gen_random_uuid(), 'orders:read', 'View orders', 'orders', 'read', 'tenant', true, now()),
(gen_random_uuid(), 'orders:update', 'Update orders', 'orders', 'update', 'tenant', true, now()),
(gen_random_uuid(), 'orders:delete', 'Delete orders', 'orders', 'delete', 'tenant', true, now())
ON CONFLICT (resource, action, scope) DO NOTHING;

-- Insert basic permissions for inventory (handle duplicates)
INSERT INTO public.permissions (id, name, description, resource, action, scope, is_system, created_at) VALUES
(gen_random_uuid(), 'inventory:create', 'Create inventory items', 'inventory', 'create', 'tenant', true, now()),
(gen_random_uuid(), 'inventory:read', 'View inventory', 'inventory', 'read', 'tenant', true, now()),
(gen_random_uuid(), 'inventory:update', 'Update inventory', 'inventory', 'update', 'tenant', true, now()),
(gen_random_uuid(), 'inventory:delete', 'Delete inventory', 'inventory', 'delete', 'tenant', true, now())
ON CONFLICT (resource, action, scope) DO NOTHING;

-- Insert basic permissions for locations (handle duplicates)
INSERT INTO public.permissions (id, name, description, resource, action, scope, is_system, created_at) VALUES
(gen_random_uuid(), 'locations:create', 'Create locations', 'locations', 'create', 'tenant', true, now()),
(gen_random_uuid(), 'locations:read', 'View locations', 'locations', 'read', 'tenant', true, now()),
(gen_random_uuid(), 'locations:update', 'Update locations', 'locations', 'update', 'tenant', true, now()),
(gen_random_uuid(), 'locations:delete', 'Delete locations', 'locations', 'delete', 'tenant', true, now())
ON CONFLICT (resource, action, scope) DO NOTHING;

-- ============================================================================
-- 2. CREATE DEFAULT TENANT (if not exist)
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
-- 3. ASSIGN USERS TO DEFAULT TENANT
-- ============================================================================

-- Update all existing users to be part of the default tenant
WITH tenant_info AS (
    SELECT id as tenant_id FROM public.tenants WHERE slug = 'default-org' LIMIT 1
)
UPDATE public.profiles 
SET 
    tenant_id = (SELECT tenant_id FROM tenant_info),
    updated_at = now()
WHERE tenant_id IS NULL;

-- ============================================================================
-- 4. CREATE ROLE-BASED PERMISSION ASSIGNMENTS
-- ============================================================================

-- Assign all permissions to admin users
WITH admin_users AS (
    SELECT id as user_id FROM public.profiles WHERE role = 'admin'
),
all_permissions AS (
    SELECT id as permission_id FROM public.permissions
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
    all_permissions.permission_id,
    default_tenant.tenant_id,
    true,
    admin_users.user_id, -- Self-granted for admins
    now(),
    now()
FROM admin_users
CROSS JOIN all_permissions
CROSS JOIN default_tenant
ON CONFLICT (user_id, permission_id, tenant_id) DO NOTHING;

-- Assign basic permissions to manager users
WITH manager_users AS (
    SELECT id as user_id FROM public.profiles WHERE role = 'manager'
),
manager_permissions AS (
    SELECT id as permission_id FROM public.permissions 
    WHERE name IN (
        'products:create', 'products:read', 'products:update', 'products:delete',
        'orders:create', 'orders:read', 'orders:update', 'orders:delete',
        'inventory:create', 'inventory:read', 'inventory:update', 'inventory:delete',
        'locations:create', 'locations:read', 'locations:update', 'locations:delete'
    )
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
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), -- Granted by an admin
    now(),
    now()
FROM manager_users
CROSS JOIN manager_permissions
CROSS JOIN default_tenant
ON CONFLICT (user_id, permission_id, tenant_id) DO NOTHING;

-- Assign read permissions to regular users
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
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), -- Granted by an admin
    now(),
    now()
FROM regular_users
CROSS JOIN read_permissions
CROSS JOIN default_tenant
ON CONFLICT (user_id, permission_id, tenant_id) DO NOTHING;

-- ============================================================================
-- 5. UPDATE EXISTING DATA WITH TENANT REFERENCE
-- ============================================================================

-- Get the default tenant ID and update existing data
DO $$
DECLARE
    v_tenant_id uuid;
BEGIN
    -- Get the tenant ID
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'default-org' LIMIT 1;
    
    IF v_tenant_id IS NOT NULL THEN
        -- Update existing products (if tenant_id column exists)
        BEGIN
            EXECUTE 'UPDATE public.products SET tenant_id = $1, updated_at = now() WHERE tenant_id IS NULL' 
            USING v_tenant_id;
        EXCEPTION 
            WHEN undefined_column THEN 
                RAISE NOTICE 'products.tenant_id column does not exist - skipping';
        END;
        
        -- Update existing orders (if tenant_id column exists)
        BEGIN
            EXECUTE 'UPDATE public.orders SET tenant_id = $1, updated_at = now() WHERE tenant_id IS NULL' 
            USING v_tenant_id;
        EXCEPTION 
            WHEN undefined_column THEN 
                RAISE NOTICE 'orders.tenant_id column does not exist - skipping';
        END;
        
        -- Update existing inventory (if tenant_id column exists)
        BEGIN
            EXECUTE 'UPDATE public.inventory SET tenant_id = $1, updated_at = now() WHERE tenant_id IS NULL' 
            USING v_tenant_id;
        EXCEPTION 
            WHEN undefined_column THEN 
                RAISE NOTICE 'inventory.tenant_id column does not exist - skipping';
        END;
        
        -- Update existing categories (if tenant_id column exists)
        BEGIN
            EXECUTE 'UPDATE public.categories SET tenant_id = $1, updated_at = now() WHERE tenant_id IS NULL' 
            USING v_tenant_id;
        EXCEPTION 
            WHEN undefined_column THEN 
                RAISE NOTICE 'categories.tenant_id column does not exist - skipping';
        END;
        
        -- Update existing locations (if tenant_id column exists)
        BEGIN
            EXECUTE 'UPDATE public.locations SET tenant_id = $1, updated_at = now() WHERE tenant_id IS NULL' 
            USING v_tenant_id;
        EXCEPTION 
            WHEN undefined_column THEN 
                RAISE NOTICE 'locations.tenant_id column does not exist - skipping';
        END;
    END IF;
END
$$;

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Check if permissions were assigned correctly
DO $$
DECLARE
    admin_count int;
    manager_count int;
    user_count int;
BEGIN
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
    
    RAISE NOTICE 'Permission assignment complete:';
    RAISE NOTICE '- Admin permissions: %', admin_count;
    RAISE NOTICE '- Manager permissions: %', manager_count;
    RAISE NOTICE '- User permissions: %', user_count;
END
$$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- This script has:
-- 1. Created basic permissions for products, orders, inventory, and locations
-- 2. Created a default tenant for your organization
-- 3. Assigned all users to the default tenant
-- 4. Given admins full permissions
-- 5. Given managers CRUD permissions for core features
-- 6. Given users read-only permissions
-- 7. Updated existing data to reference the default tenant
--
-- After running this script, your Add Product and Create Order buttons 
-- should appear for admin and manager users!
-- ============================================================================
