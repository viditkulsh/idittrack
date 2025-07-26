-- ============================================================================
-- ENHANCED RBAC SYSTEM FOR IDITTRACK INVENTORY MANAGEMENT
-- ============================================================================
-- This script enhances the existing database with comprehensive RBAC features
-- Compatible with existing schema and data
-- ============================================================================

-- ============================================================================
-- 1. ENHANCED ENUMS AND TYPES
-- ============================================================================

-- Add tenant_type enum for multi-tenant support
DO $$ BEGIN
    CREATE TYPE tenant_type AS ENUM (
        'enterprise',
        'business', 
        'startup',
        'individual'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add permission_scope enum
DO $$ BEGIN
    CREATE TYPE permission_scope AS ENUM (
        'platform',
        'tenant',
        'department', 
        'personal',
        'read_only'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add resource_type enum for permissions
DO $$ BEGIN
    CREATE TYPE resource_type AS ENUM (
        'inventory',
        'orders',
        'users',
        'analytics',
        'system',
        'products',
        'categories',
        'locations',
        'reports',
        'audit_logs'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add action_type enum for permissions
DO $$ BEGIN
    CREATE TYPE action_type AS ENUM (
        'create',
        'read',
        'update',
        'delete',
        'manage',
        'approve',
        'assign',
        'export'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. TENANTS TABLE - Multi-tenant support
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tenants (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL CHECK (length(TRIM(BOTH FROM name)) > 0),
    slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9\-]+$'::text),
    domain text UNIQUE,
    tenant_type tenant_type NOT NULL DEFAULT 'business',
    settings jsonb DEFAULT '{}'::jsonb,
    subscription_plan text DEFAULT 'basic',
    is_active boolean NOT NULL DEFAULT true,
    max_users integer DEFAULT 50,
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT tenants_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- 3. PERMISSIONS TABLE - Granular permission system
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.permissions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    resource resource_type NOT NULL,
    action action_type NOT NULL,
    scope permission_scope NOT NULL DEFAULT 'tenant',
    conditions jsonb DEFAULT '{}'::jsonb,
    is_system boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT permissions_pkey PRIMARY KEY (id),
    CONSTRAINT permissions_resource_action_unique UNIQUE (resource, action, scope)
);

-- ============================================================================
-- 4. ROLE PERMISSIONS - Link roles to permissions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.role_permissions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    permission_id uuid NOT NULL,
    tenant_id uuid,
    granted boolean NOT NULL DEFAULT true,
    granted_by uuid,
    granted_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone,
    CONSTRAINT role_permissions_pkey PRIMARY KEY (id),
    CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE,
    CONSTRAINT role_permissions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT role_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.profiles(id),
    CONSTRAINT role_permissions_unique UNIQUE (role, permission_id, tenant_id)
);

-- ============================================================================
-- 5. USER PERMISSIONS - Individual user overrides
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_permissions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    tenant_id uuid,
    granted boolean NOT NULL DEFAULT true,
    granted_by uuid NOT NULL,
    granted_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone,
    reason text,
    CONSTRAINT user_permissions_pkey PRIMARY KEY (id),
    CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT user_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE,
    CONSTRAINT user_permissions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT user_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.profiles(id),
    CONSTRAINT user_permissions_unique UNIQUE (user_id, permission_id, tenant_id)
);

-- ============================================================================
-- 6. ENHANCE EXISTING TABLES - Add tenant awareness
-- ============================================================================

-- Add tenant_id to profiles table if not exists
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN tenant_id uuid;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_tenant_id_fkey 
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
    WHEN undefined_table THEN null;
END $$;

-- Add department to profiles if not exists
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN manager_id uuid;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_manager_id_fkey 
        FOREIGN KEY (manager_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
    WHEN undefined_table THEN null;
END $$;

-- Add tenant_id to other tables for multi-tenant support
DO $$ BEGIN
    ALTER TABLE public.products ADD COLUMN tenant_id uuid;
    ALTER TABLE public.products ADD CONSTRAINT products_tenant_id_fkey 
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_column THEN null;
    WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.categories ADD COLUMN tenant_id uuid;
    ALTER TABLE public.categories ADD CONSTRAINT categories_tenant_id_fkey 
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_column THEN null;
    WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.locations ADD COLUMN tenant_id uuid;
    ALTER TABLE public.locations ADD CONSTRAINT locations_tenant_id_fkey 
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_column THEN null;
    WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.orders ADD COLUMN tenant_id uuid;
    ALTER TABLE public.orders ADD CONSTRAINT orders_tenant_id_fkey 
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_column THEN null;
    WHEN undefined_table THEN null;
END $$;

-- ============================================================================
-- 7. CORE RBAC FUNCTIONS
-- ============================================================================

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_user_id uuid,
    p_resource text,
    p_action text,
    p_tenant_id uuid DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role user_role;
    v_user_tenant_id uuid;
    v_has_permission boolean := false;
BEGIN
    -- Get user role and tenant
    SELECT role, tenant_id INTO v_user_role, v_user_tenant_id
    FROM public.profiles 
    WHERE id = p_user_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Use user's tenant if not specified
    IF p_tenant_id IS NULL THEN
        p_tenant_id := v_user_tenant_id;
    END IF;
    
    -- Super admin has all permissions
    IF v_user_role = 'admin' AND v_user_tenant_id IS NULL THEN
        RETURN true;
    END IF;
    
    -- Check user-specific permissions first (overrides)
    SELECT COALESCE(up.granted, false) INTO v_has_permission
    FROM public.user_permissions up
    JOIN public.permissions p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id
        AND p.resource = p_resource::resource_type
        AND p.action = p_action::action_type
        AND (up.tenant_id = p_tenant_id OR up.tenant_id IS NULL)
        AND (up.expires_at IS NULL OR up.expires_at > now());
    
    IF FOUND THEN
        RETURN v_has_permission;
    END IF;
    
    -- Check role-based permissions
    SELECT COALESCE(rp.granted, false) INTO v_has_permission
    FROM public.role_permissions rp
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE rp.role = v_user_role
        AND p.resource = p_resource::resource_type
        AND p.action = p_action::action_type
        AND (rp.tenant_id = p_tenant_id OR rp.tenant_id IS NULL)
        AND (rp.expires_at IS NULL OR rp.expires_at > now());
    
    RETURN COALESCE(v_has_permission, false);
END;
$$;

-- Function to get user's effective role in context
CREATE OR REPLACE FUNCTION public.get_user_effective_role(
    p_user_id uuid,
    p_tenant_id uuid DEFAULT NULL
) RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role user_role;
    v_tenant_id uuid;
BEGIN
    SELECT role, tenant_id INTO v_role, v_tenant_id
    FROM public.profiles 
    WHERE id = p_user_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN 'user'::user_role;
    END IF;
    
    -- If checking different tenant and user is not super admin
    IF p_tenant_id IS NOT NULL AND p_tenant_id != v_tenant_id AND v_role != 'admin' THEN
        RETURN 'user'::user_role;
    END IF;
    
    RETURN v_role;
END;
$$;

-- Function to check if user can access tenant
CREATE OR REPLACE FUNCTION public.user_can_access_tenant(
    p_user_id uuid,
    p_tenant_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role user_role;
    v_user_tenant_id uuid;
BEGIN
    SELECT role, tenant_id INTO v_user_role, v_user_tenant_id
    FROM public.profiles 
    WHERE id = p_user_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Super admin can access all tenants
    IF v_user_role = 'admin' AND v_user_tenant_id IS NULL THEN
        RETURN true;
    END IF;
    
    -- User can access their own tenant
    IF v_user_tenant_id = p_tenant_id THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$;

-- ============================================================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "profiles_tenant_isolation" ON public.profiles;
CREATE POLICY "profiles_tenant_isolation" ON public.profiles
    FOR ALL USING (
        auth.uid() = id OR
        public.user_can_access_tenant(auth.uid(), tenant_id) OR
        public.user_has_permission(auth.uid(), 'users', 'read', tenant_id)
    );

-- Products policies
DROP POLICY IF EXISTS "products_tenant_access" ON public.products;
CREATE POLICY "products_tenant_access" ON public.products
    FOR ALL USING (
        public.user_can_access_tenant(auth.uid(), tenant_id)
    );

-- Categories policies
DROP POLICY IF EXISTS "categories_tenant_access" ON public.categories;
CREATE POLICY "categories_tenant_access" ON public.categories
    FOR ALL USING (
        public.user_can_access_tenant(auth.uid(), tenant_id)
    );

-- Locations policies
DROP POLICY IF EXISTS "locations_tenant_access" ON public.locations;
CREATE POLICY "locations_tenant_access" ON public.locations
    FOR ALL USING (
        public.user_can_access_tenant(auth.uid(), tenant_id)
    );

-- Orders policies
DROP POLICY IF EXISTS "orders_tenant_access" ON public.orders;
CREATE POLICY "orders_tenant_access" ON public.orders
    FOR ALL USING (
        public.user_can_access_tenant(auth.uid(), tenant_id) AND
        (
            public.user_has_permission(auth.uid(), 'orders', 'read', tenant_id) OR
            created_by = auth.uid() OR
            assigned_to = auth.uid() OR
            customer_id = auth.uid()
        )
    );

-- Order items policies
DROP POLICY IF EXISTS "order_items_access" ON public.order_items;
CREATE POLICY "order_items_access" ON public.order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.orders o 
            WHERE o.id = order_id 
            AND public.user_can_access_tenant(auth.uid(), o.tenant_id)
        )
    );

-- Inventory policies
DROP POLICY IF EXISTS "inventory_location_access" ON public.inventory;
CREATE POLICY "inventory_location_access" ON public.inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.locations l 
            WHERE l.id = location_id 
            AND public.user_can_access_tenant(auth.uid(), l.tenant_id)
        )
    );

-- Inventory movements policies
DROP POLICY IF EXISTS "inventory_movements_access" ON public.inventory_movements;
CREATE POLICY "inventory_movements_access" ON public.inventory_movements
    FOR ALL USING (
        performed_by = auth.uid() OR
        approved_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.inventory i
            JOIN public.locations l ON i.location_id = l.id
            WHERE i.id = inventory_id 
            AND public.user_can_access_tenant(auth.uid(), l.tenant_id)
        )
    );

-- Audit logs policies
DROP POLICY IF EXISTS "audit_logs_access" ON public.audit_logs;
CREATE POLICY "audit_logs_access" ON public.audit_logs
    FOR SELECT USING (
        public.user_has_permission(auth.uid(), 'audit_logs', 'read', NULL)
    );

-- File uploads policies
DROP POLICY IF EXISTS "file_uploads_access" ON public.file_uploads;
CREATE POLICY "file_uploads_access" ON public.file_uploads
    FOR ALL USING (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND public.user_has_permission(auth.uid(), 'system', 'manage', p.tenant_id)
        )
    );

-- Tenants policies
DROP POLICY IF EXISTS "tenants_access" ON public.tenants;
CREATE POLICY "tenants_access" ON public.tenants
    FOR ALL USING (
        public.user_can_access_tenant(auth.uid(), id)
    );

-- ============================================================================
-- 9. INSERT DEFAULT PERMISSIONS
-- ============================================================================

-- Insert core permissions
INSERT INTO public.permissions (name, description, resource, action, scope, is_system) VALUES
-- Inventory permissions
('inventory_create', 'Create inventory records', 'inventory', 'create', 'tenant', true),
('inventory_read', 'View inventory records', 'inventory', 'read', 'tenant', true),
('inventory_update', 'Update inventory records', 'inventory', 'update', 'tenant', true),
('inventory_delete', 'Delete inventory records', 'inventory', 'delete', 'tenant', true),
('inventory_manage', 'Full inventory management', 'inventory', 'manage', 'tenant', true),

-- Orders permissions
('orders_create', 'Create orders', 'orders', 'create', 'tenant', true),
('orders_read', 'View orders', 'orders', 'read', 'tenant', true),
('orders_update', 'Update orders', 'orders', 'update', 'tenant', true),
('orders_delete', 'Delete orders', 'orders', 'delete', 'tenant', true),
('orders_manage', 'Full order management', 'orders', 'manage', 'tenant', true),
('orders_approve', 'Approve orders', 'orders', 'approve', 'tenant', true),
('orders_assign', 'Assign orders', 'orders', 'assign', 'tenant', true),

-- Users permissions
('users_create', 'Create users', 'users', 'create', 'tenant', true),
('users_read', 'View users', 'users', 'read', 'tenant', true),
('users_update', 'Update users', 'users', 'update', 'tenant', true),
('users_delete', 'Delete users', 'users', 'delete', 'tenant', true),
('users_manage', 'Full user management', 'users', 'manage', 'tenant', true),

-- Products permissions
('products_create', 'Create products', 'products', 'create', 'tenant', true),
('products_read', 'View products', 'products', 'read', 'tenant', true),
('products_update', 'Update products', 'products', 'update', 'tenant', true),
('products_delete', 'Delete products', 'products', 'delete', 'tenant', true),
('products_manage', 'Full product management', 'products', 'manage', 'tenant', true),

-- Analytics permissions
('analytics_read', 'View analytics', 'analytics', 'read', 'tenant', true),
('analytics_export', 'Export analytics', 'analytics', 'export', 'tenant', true),

-- System permissions
('system_manage', 'System management', 'system', 'manage', 'platform', true),
('audit_logs_read', 'View audit logs', 'audit_logs', 'read', 'tenant', true)

ON CONFLICT (resource, action, scope) DO NOTHING;

-- ============================================================================
-- 10. ASSIGN PERMISSIONS TO ROLES
-- ============================================================================

-- Super Admin (admin role) - Platform-wide access
INSERT INTO public.role_permissions (role, permission_id, tenant_id, granted) 
SELECT 'admin'::user_role, p.id, NULL, true
FROM public.permissions p
WHERE p.is_system = true
ON CONFLICT (role, permission_id, tenant_id) DO NOTHING;

-- Admin - Tenant-wide access
INSERT INTO public.role_permissions (role, permission_id, tenant_id, granted) 
SELECT 'manager'::user_role, p.id, NULL, true
FROM public.permissions p
WHERE p.resource IN ('inventory', 'orders', 'users', 'products', 'analytics')
    AND p.action IN ('create', 'read', 'update', 'delete', 'manage')
ON CONFLICT (role, permission_id, tenant_id) DO NOTHING;

-- Manager - Department level access
INSERT INTO public.role_permissions (role, permission_id, tenant_id, granted) 
SELECT 'user'::user_role, p.id, NULL, true
FROM public.permissions p
WHERE p.resource IN ('inventory', 'orders', 'products')
    AND p.action IN ('read', 'update')
ON CONFLICT (role, permission_id, tenant_id) DO NOTHING;

-- User - Limited access
INSERT INTO public.role_permissions (role, permission_id, tenant_id, granted) 
SELECT 'user'::user_role, p.id, NULL, true
FROM public.permissions p
WHERE p.resource IN ('inventory', 'orders', 'products')
    AND p.action IN ('read', 'create')
ON CONFLICT (role, permission_id, tenant_id) DO NOTHING;

-- ============================================================================
-- 11. AUDIT TRIGGERS FOR RBAC ACTIONS
-- ============================================================================

-- Function to log RBAC changes
CREATE OR REPLACE FUNCTION public.log_rbac_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        user_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE TG_OP
            WHEN 'INSERT' THEN 'CREATE'::audit_action
            WHEN 'UPDATE' THEN 'UPDATE'::audit_action
            WHEN 'DELETE' THEN 'DELETE'::audit_action
        END,
        CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
        auth.uid()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers for RBAC tables
DROP TRIGGER IF EXISTS audit_role_permissions ON public.role_permissions;
CREATE TRIGGER audit_role_permissions
    AFTER INSERT OR UPDATE OR DELETE ON public.role_permissions
    FOR EACH ROW EXECUTE FUNCTION public.log_rbac_change();

DROP TRIGGER IF EXISTS audit_user_permissions ON public.user_permissions;
CREATE TRIGGER audit_user_permissions
    AFTER INSERT OR UPDATE OR DELETE ON public.user_permissions
    FOR EACH ROW EXECUTE FUNCTION public.log_rbac_change();

-- ============================================================================
-- 12. UTILITY FUNCTIONS FOR FRONTEND
-- ============================================================================

-- Get user's permissions for frontend
CREATE OR REPLACE FUNCTION public.get_user_permissions(
    p_user_id uuid DEFAULT auth.uid(),
    p_tenant_id uuid DEFAULT NULL
)
RETURNS TABLE (
    resource text,
    action text,
    granted boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role user_role;
    v_user_tenant_id uuid;
BEGIN
    -- Get user details
    SELECT role, tenant_id INTO v_user_role, v_user_tenant_id
    FROM public.profiles 
    WHERE id = p_user_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Use user's tenant if not specified
    IF p_tenant_id IS NULL THEN
        p_tenant_id := v_user_tenant_id;
    END IF;
    
    RETURN QUERY
    SELECT 
        p.resource::text,
        p.action::text,
        COALESCE(
            up.granted,
            rp.granted,
            false
        ) as granted
    FROM public.permissions p
    LEFT JOIN public.role_permissions rp ON (
        rp.permission_id = p.id 
        AND rp.role = v_user_role
        AND (rp.tenant_id = p_tenant_id OR rp.tenant_id IS NULL)
        AND (rp.expires_at IS NULL OR rp.expires_at > now())
    )
    LEFT JOIN public.user_permissions up ON (
        up.permission_id = p.id 
        AND up.user_id = p_user_id
        AND (up.tenant_id = p_tenant_id OR up.tenant_id IS NULL)
        AND (up.expires_at IS NULL OR up.expires_at > now())
    )
    WHERE p.is_system = true
    ORDER BY p.resource, p.action;
END;
$$;

-- Get user's accessible tenants
CREATE OR REPLACE FUNCTION public.get_user_tenants(
    p_user_id uuid DEFAULT auth.uid()
)
RETURNS TABLE (
    tenant_id uuid,
    tenant_name text,
    tenant_slug text,
    user_role user_role,
    is_primary boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role user_role;
    v_user_tenant_id uuid;
BEGIN
    -- Get user details
    SELECT role, tenant_id INTO v_user_role, v_user_tenant_id
    FROM public.profiles 
    WHERE id = p_user_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Super admin can see all tenants
    IF v_user_role = 'admin' AND v_user_tenant_id IS NULL THEN
        RETURN QUERY
        SELECT 
            t.id,
            t.name,
            t.slug,
            'admin'::user_role,
            false
        FROM public.tenants t
        WHERE t.is_active = true
        ORDER BY t.name;
    ELSE
        -- Regular users see only their tenant
        RETURN QUERY
        SELECT 
            t.id,
            t.name,
            t.slug,
            v_user_role,
            true
        FROM public.tenants t
        WHERE t.id = v_user_tenant_id AND t.is_active = true;
    END IF;
END;
$$;

-- ============================================================================
-- 13. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for permissions lookup
CREATE INDEX IF NOT EXISTS idx_role_permissions_lookup 
ON public.role_permissions (role, tenant_id, permission_id);

CREATE INDEX IF NOT EXISTS idx_user_permissions_lookup 
ON public.user_permissions (user_id, tenant_id, permission_id);

CREATE INDEX IF NOT EXISTS idx_permissions_resource_action 
ON public.permissions (resource, action, scope);

-- Indexes for tenant isolation
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_role 
ON public.profiles (tenant_id, role, is_active);

CREATE INDEX IF NOT EXISTS idx_products_tenant 
ON public.products (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_tenant_status 
ON public.orders (tenant_id, status, created_at);

-- ============================================================================
-- SCRIPT COMPLETION
-- ============================================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'ENHANCED RBAC SYSTEM INSTALLATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Features installed:';
    RAISE NOTICE '- Multi-tenant architecture with tenant isolation';
    RAISE NOTICE '- Granular permission system with 5 roles';
    RAISE NOTICE '- Row Level Security (RLS) policies';
    RAISE NOTICE '- RBAC helper functions for frontend integration';
    RAISE NOTICE '- Audit logging for security changes';
    RAISE NOTICE '- Performance indexes';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create your first tenant using the tenants table';
    RAISE NOTICE '2. Assign users to tenants by updating profiles.tenant_id';
    RAISE NOTICE '3. Use get_user_permissions() function in your frontend';
    RAISE NOTICE '4. Test permissions with user_has_permission() function';
    RAISE NOTICE '============================================================================';
END
$$;
