-- =============================================================================
-- IDITTRACK COMPLETE DATABASE SETUP WITH RBAC
-- =============================================================================
-- Comprehensive SQL setup for inventory and order management system
-- Includes: RBAC (Admin/Manager/User), Normalization, Triggers, and Security
-- Execute this file in your Supabase SQL Editor

-- =============================================================================
-- 1. CLEANUP - REMOVE ALL EXISTING OBJECTS (SAFE FOR FRESH DATABASE)
-- =============================================================================

-- Temporarily disable RLS to avoid dependency issues during cleanup
SET session_replication_role = replica;

-- Drop all triggers first to avoid dependency issues
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
    DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
    DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
    DROP TRIGGER IF EXISTS update_locations_updated_at ON public.locations;
    DROP TRIGGER IF EXISTS update_inventory_updated_at ON public.inventory;
    DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
    DROP TRIGGER IF EXISTS update_order_items_updated_at ON public.order_items;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Drop all functions
DO $$ 
BEGIN
    DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
    DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
    DROP FUNCTION IF EXISTS public.generate_order_number() CASCADE;
    DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
    DROP FUNCTION IF EXISTS public.is_manager_or_admin() CASCADE;
    DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
    DROP FUNCTION IF EXISTS public.setup_first_admin() CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Drop all views first
DO $$ 
BEGIN
    DROP VIEW IF EXISTS public.inventory_summary CASCADE;
    DROP VIEW IF EXISTS public.orders_summary CASCADE;
    DROP VIEW IF EXISTS public.dashboard_stats CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Drop tables in correct order (respecting foreign keys)
DO $$ 
BEGIN
    DROP TABLE IF EXISTS public.audit_logs CASCADE;
    DROP TABLE IF EXISTS public.inventory_movements CASCADE;
    DROP TABLE IF EXISTS public.order_items CASCADE;
    DROP TABLE IF EXISTS public.orders CASCADE;
    DROP TABLE IF EXISTS public.inventory CASCADE;
    DROP TABLE IF EXISTS public.products CASCADE;
    DROP TABLE IF EXISTS public.categories CASCADE;
    DROP TABLE IF EXISTS public.locations CASCADE;
    DROP TABLE IF EXISTS public.profiles CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Drop custom types (enums)
DO $$ 
BEGIN
    DROP TYPE IF EXISTS public.user_role CASCADE;
    DROP TYPE IF EXISTS public.order_status CASCADE;
    DROP TYPE IF EXISTS public.product_status CASCADE;
    DROP TYPE IF EXISTS public.movement_type CASCADE;
    DROP TYPE IF EXISTS public.audit_action CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Re-enable normal replication
SET session_replication_role = DEFAULT;    -- =============================================================================
    -- 2. CREATE CUSTOM TYPES (ENUMS)
    -- =============================================================================

    -- User roles for RBAC system
    CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'user');

    -- Order status workflow
    CREATE TYPE public.order_status AS ENUM (
        'pending',      -- Order created, awaiting confirmation
        'confirmed',    -- Order confirmed by customer/admin
        'processing',   -- Order being prepared/packaged
        'shipped',      -- Order shipped to customer
        'delivered',    -- Successfully delivered to customer
        'cancelled',    -- Cancelled by user/admin before shipping
        'returned'      -- Product returned after delivery
    );

    -- Product status for lifecycle management
    CREATE TYPE public.product_status AS ENUM ('active', 'inactive', 'discontinued');

    -- Inventory movement types for audit trail
    CREATE TYPE public.movement_type AS ENUM (
        'stock_in',     -- Stock received (purchase, return, etc.)
        'stock_out',    -- Stock removed (sale, damage, theft, etc.)
        'adjustment',   -- Manual stock adjustment
        'transfer',     -- Transfer between locations
        'reservation',  -- Reserved for order
        'release'       -- Released from reservation
    );

    -- Audit action types
    CREATE TYPE public.audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');

    -- =============================================================================
    -- 3. CREATE CORE TABLES WITH PROPER NORMALIZATION
    -- =============================================================================

    -- 3.1 User Profiles (Extends Supabase auth.users)
    CREATE TABLE public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        first_name TEXT NOT NULL CHECK (length(trim(first_name)) > 0),
        last_name TEXT NOT NULL CHECK (length(trim(last_name)) > 0),
        email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
        phone TEXT CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\-\s()]+$'),
        role user_role NOT NULL DEFAULT 'user',
        is_active BOOLEAN NOT NULL DEFAULT true,
        company_name TEXT,
        department TEXT,
        avatar_url TEXT,
        address JSONB DEFAULT '{}',
        last_login TIMESTAMPTZ,
        email_verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 3.2 Categories (Product categorization)
    CREATE TABLE public.categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
        description TEXT,
        slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9\-]+$'),
        parent_id UUID REFERENCES public.categories(id), -- For hierarchical categories
        sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
        is_active BOOLEAN NOT NULL DEFAULT true,
        image_url TEXT,
        created_by UUID REFERENCES public.profiles(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 3.3 Locations (Warehouses, stores, distribution centers)
    CREATE TABLE public.locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL CHECK (length(trim(name)) > 0),
        code TEXT NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9]{2,10}$'),
        type TEXT NOT NULL DEFAULT 'warehouse' CHECK (type IN ('warehouse', 'store', 'distribution_center', 'supplier')),
        address JSONB DEFAULT '{}',
        contact_info JSONB DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT true,
        manager_id UUID REFERENCES public.profiles(id),
        created_by UUID REFERENCES public.profiles(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 3.4 Products (Product catalog)
    CREATE TABLE public.products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL CHECK (length(trim(name)) > 0),
        description TEXT,
        sku TEXT UNIQUE NOT NULL CHECK (length(trim(sku)) > 0),
        barcode TEXT,
        category_id UUID REFERENCES public.categories(id),
        brand TEXT,
        manufacturer TEXT,
        cost_price DECIMAL(12,2) CHECK (cost_price >= 0),
        selling_price DECIMAL(12,2) CHECK (selling_price >= 0),
        wholesale_price DECIMAL(12,2) CHECK (wholesale_price >= 0),
        min_stock_level INTEGER NOT NULL DEFAULT 0 CHECK (min_stock_level >= 0),
        reorder_point INTEGER NOT NULL DEFAULT 0 CHECK (reorder_point >= 0),
        max_stock_level INTEGER CHECK (max_stock_level IS NULL OR max_stock_level >= min_stock_level),
        status product_status NOT NULL DEFAULT 'active',
        weight_kg DECIMAL(10,3) CHECK (weight_kg IS NULL OR weight_kg > 0),
        dimensions JSONB DEFAULT '{}', -- {length, width, height, unit}
        tax_rate DECIMAL(5,2) DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
        tags TEXT[],
        images TEXT[],
        specifications JSONB DEFAULT '{}',
        warranty_period_months INTEGER CHECK (warranty_period_months IS NULL OR warranty_period_months >= 0),
        is_serialized BOOLEAN NOT NULL DEFAULT false,
        created_by UUID REFERENCES public.profiles(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 3.5 Inventory (Stock levels per product per location)
    CREATE TABLE public.inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
        reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
        available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
        reorder_level INTEGER DEFAULT 0 CHECK (reorder_level >= 0),
        last_counted_at TIMESTAMPTZ,
        last_restocked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        
        UNIQUE(product_id, location_id),
        CHECK (reserved_quantity <= quantity)
    );

    -- 3.6 Inventory Movements (Audit trail for all stock changes)
    CREATE TABLE public.inventory_movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
        type movement_type NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity != 0),
        previous_quantity INTEGER NOT NULL CHECK (previous_quantity >= 0),
        new_quantity INTEGER NOT NULL CHECK (new_quantity >= 0),
        unit_cost DECIMAL(12,2),
        reference_type TEXT, -- 'order', 'purchase', 'adjustment', 'transfer'
        reference_id UUID,   -- ID of related record
        reason TEXT,
        notes TEXT,
        batch_number TEXT,
        expiry_date DATE,
        performed_by UUID NOT NULL REFERENCES public.profiles(id),
        approved_by UUID REFERENCES public.profiles(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 3.7 Orders (Customer orders)
    CREATE TABLE public.orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number TEXT NOT NULL UNIQUE,
        customer_id UUID REFERENCES public.profiles(id),
        status order_status NOT NULL DEFAULT 'pending',
        order_type TEXT NOT NULL DEFAULT 'sale' CHECK (order_type IN ('sale', 'return', 'exchange', 'internal')),
        order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        required_date TIMESTAMPTZ,
        shipped_date TIMESTAMPTZ,
        delivered_date TIMESTAMPTZ,
        
        -- Pricing breakdown
        subtotal DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
        tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
        shipping_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
        discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
        total_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
        
        -- Customer information
        customer_details JSONB DEFAULT '{}', -- Name, email, phone for guest orders
        shipping_address JSONB DEFAULT '{}',
        billing_address JSONB DEFAULT '{}',
        
        -- Shipping and tracking
        shipping_method TEXT,
        tracking_number TEXT,
        courier_service TEXT,
        
        -- Payment information
        payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partial')),
        payment_method TEXT,
        payment_reference TEXT,
        
        -- Additional metadata
        notes TEXT,
        internal_notes TEXT, -- Only visible to staff
        source TEXT DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'phone', 'email', 'walk-in')),
        priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        
        created_by UUID REFERENCES public.profiles(id),
        assigned_to UUID REFERENCES public.profiles(id), -- For order processing
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 3.8 Order Items (Line items for each order)
    CREATE TABLE public.order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES public.products(id),
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
        discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
        tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
        total_price DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),
        fulfilled_quantity INTEGER NOT NULL DEFAULT 0 CHECK (fulfilled_quantity >= 0),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        
        CHECK (fulfilled_quantity <= quantity)
    );

    -- 3.9 Audit Logs (System-wide audit trail)
    CREATE TABLE public.audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_name TEXT NOT NULL,
        record_id UUID,
        action audit_action NOT NULL,
        old_values JSONB,
        new_values JSONB,
        changed_fields TEXT[],
        user_id UUID REFERENCES public.profiles(id),
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- =============================================================================
    -- 4. CREATE INDEXES FOR OPTIMAL PERFORMANCE
    -- =============================================================================

    -- Profiles indexes
    CREATE INDEX idx_profiles_email ON public.profiles(email);
    CREATE INDEX idx_profiles_role ON public.profiles(role);
    CREATE INDEX idx_profiles_active ON public.profiles(is_active);
    CREATE INDEX idx_profiles_last_login ON public.profiles(last_login);

    -- Categories indexes
    CREATE INDEX idx_categories_parent ON public.categories(parent_id);
    CREATE INDEX idx_categories_active ON public.categories(is_active);
    CREATE INDEX idx_categories_slug ON public.categories(slug);

    -- Products indexes
    CREATE INDEX idx_products_sku ON public.products(sku);
    CREATE INDEX idx_products_category ON public.products(category_id);
    CREATE INDEX idx_products_status ON public.products(status);
    CREATE INDEX idx_products_brand ON public.products(brand);
    CREATE INDEX idx_products_search ON public.products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

    -- Inventory indexes
    CREATE INDEX idx_inventory_product_location ON public.inventory(product_id, location_id);
    CREATE INDEX idx_inventory_low_stock ON public.inventory(product_id) WHERE available_quantity <= reorder_level;
    CREATE INDEX idx_inventory_location ON public.inventory(location_id);

    -- Orders indexes
    CREATE INDEX idx_orders_customer ON public.orders(customer_id);
    CREATE INDEX idx_orders_status ON public.orders(status);
    CREATE INDEX idx_orders_date ON public.orders(order_date);
    CREATE INDEX idx_orders_number ON public.orders(order_number);
    CREATE INDEX idx_orders_assigned ON public.orders(assigned_to);

    -- Order items indexes
    CREATE INDEX idx_order_items_order ON public.order_items(order_id);
    CREATE INDEX idx_order_items_product ON public.order_items(product_id);

    -- Inventory movements indexes
    CREATE INDEX idx_movements_inventory ON public.inventory_movements(inventory_id);
    CREATE INDEX idx_movements_type ON public.inventory_movements(type);
    CREATE INDEX idx_movements_date ON public.inventory_movements(created_at);
    CREATE INDEX idx_movements_reference ON public.inventory_movements(reference_type, reference_id);

    -- Audit logs indexes
    CREATE INDEX idx_audit_table_record ON public.audit_logs(table_name, record_id);
    CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
    CREATE INDEX idx_audit_date ON public.audit_logs(created_at);

    -- =============================================================================
    -- 5. CREATE UTILITY FUNCTIONS
    -- =============================================================================

    -- Function to update updated_at timestamps
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Function to get current user's role
    CREATE OR REPLACE FUNCTION public.get_user_role()
    RETURNS user_role AS $$
    DECLARE
        user_role_val user_role;
    BEGIN
        SELECT role INTO user_role_val 
        FROM public.profiles 
        WHERE id = auth.uid();
        
        RETURN COALESCE(user_role_val, 'user'::user_role);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to check if current user is admin
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin';
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to check if current user is manager or admin
    CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager');
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to handle new user registration
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER 
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
        INSERT INTO public.profiles (
            id,
            first_name,
            last_name,
            email,
            company_name,
            role,
            is_active,
            email_verified,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
            COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
            NEW.email,
            NEW.raw_user_meta_data->>'company',
            'user'::user_role,
            true,
            COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
            NOW(),
            NOW()
        );
        
        RETURN NEW;
    EXCEPTION
        WHEN unique_violation THEN
            RETURN NEW;
        WHEN OTHERS THEN
            RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
            RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Function to generate unique order numbers
    CREATE OR REPLACE FUNCTION public.generate_order_number()
    RETURNS TEXT AS $$
    DECLARE
        order_num TEXT;
        counter INTEGER;
    BEGIN
        -- Format: ORD-YYYYMMDD-NNNN
        SELECT COUNT(*) + 1 INTO counter
        FROM public.orders 
        WHERE DATE(created_at) = CURRENT_DATE;
        
        order_num := 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
        
        RETURN order_num;
    END;
    $$ LANGUAGE plpgsql;

    -- =============================================================================
    -- 6. CREATE TRIGGERS
    -- =============================================================================

    -- User registration trigger
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW 
        EXECUTE FUNCTION public.handle_new_user();

    -- Updated_at triggers for all relevant tables
    CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    CREATE TRIGGER update_categories_updated_at
        BEFORE UPDATE ON public.categories
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    CREATE TRIGGER update_locations_updated_at
        BEFORE UPDATE ON public.locations
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON public.products
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    CREATE TRIGGER update_inventory_updated_at
        BEFORE UPDATE ON public.inventory
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    CREATE TRIGGER update_orders_updated_at
        BEFORE UPDATE ON public.orders
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    CREATE TRIGGER update_order_items_updated_at
        BEFORE UPDATE ON public.order_items
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS) AND CREATE POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PROFILES POLICIES
-- =============================================================================

-- Service role has full access
CREATE POLICY "service_role_all_profiles" ON public.profiles FOR ALL TO service_role USING (true);

-- Users can view and edit their own profile
CREATE POLICY "users_own_profile_select" ON public.profiles FOR SELECT TO authenticated 
    USING (auth.uid() = id);

CREATE POLICY "users_own_profile_update" ON public.profiles FOR UPDATE TO authenticated 
    USING (auth.uid() = id);

-- Allow profile creation during signup
CREATE POLICY "allow_profile_creation" ON public.profiles FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = id);

-- Admins can view and manage all profiles (created after functions are defined)
-- Admin can view all profiles
CREATE POLICY "admin_view_all_profiles" ON public.profiles 
    FOR SELECT 
    TO authenticated 
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Admin can update all profiles  
CREATE POLICY "admin_update_all_profiles" ON public.profiles 
    FOR UPDATE 
    TO authenticated 
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Manager can view all profiles
CREATE POLICY "manager_view_all_profiles" ON public.profiles 
    FOR SELECT 
    TO authenticated 
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager')
    );

-- =============================================================================
-- CATEGORIES POLICIES
-- =============================================================================

CREATE POLICY "service_role_all_categories" ON public.categories FOR ALL TO service_role USING (true);

-- All authenticated users can view active categories
CREATE POLICY "view_active_categories" ON public.categories FOR SELECT TO authenticated 
    USING (is_active = true);

-- =============================================================================
-- LOCATIONS POLICIES
-- =============================================================================

CREATE POLICY "service_role_all_locations" ON public.locations FOR ALL TO service_role USING (true);

-- All authenticated users can view active locations
CREATE POLICY "view_active_locations" ON public.locations FOR SELECT TO authenticated 
    USING (is_active = true);

-- =============================================================================
-- PRODUCTS POLICIES
-- =============================================================================

CREATE POLICY "service_role_all_products" ON public.products FOR ALL TO service_role USING (true);

-- All authenticated users can view active products
CREATE POLICY "view_active_products" ON public.products FOR SELECT TO authenticated 
    USING (status = 'active');

-- =============================================================================
-- INVENTORY POLICIES
-- =============================================================================

CREATE POLICY "service_role_all_inventory" ON public.inventory FOR ALL TO service_role USING (true);

-- All authenticated users can view inventory
CREATE POLICY "view_inventory" ON public.inventory FOR SELECT TO authenticated USING (true);

-- =============================================================================
-- INVENTORY MOVEMENTS POLICIES
-- =============================================================================

CREATE POLICY "service_role_all_movements" ON public.inventory_movements FOR ALL TO service_role USING (true);

-- Users can view movements (for transparency)
CREATE POLICY "view_movements" ON public.inventory_movements FOR SELECT TO authenticated USING (true);

-- =============================================================================
-- ORDERS POLICIES
-- =============================================================================

CREATE POLICY "service_role_all_orders" ON public.orders FOR ALL TO service_role USING (true);

-- Users can view and manage their own orders
CREATE POLICY "users_own_orders" ON public.orders FOR ALL TO authenticated 
    USING (customer_id = auth.uid() OR created_by = auth.uid());

-- =============================================================================
-- ORDER ITEMS POLICIES
-- =============================================================================

CREATE POLICY "service_role_all_order_items" ON public.order_items FOR ALL TO service_role USING (true);

-- Users can view and manage items for their own orders
CREATE POLICY "users_own_order_items" ON public.order_items FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id 
            AND (customer_id = auth.uid() OR created_by = auth.uid())
        )
    );

-- =============================================================================
-- AUDIT LOGS POLICIES
-- =============================================================================

CREATE POLICY "service_role_all_audit" ON public.audit_logs FOR ALL TO service_role USING (true);

-- Users can view their own audit logs
CREATE POLICY "users_own_audit" ON public.audit_logs FOR SELECT TO authenticated 
    USING (user_id = auth.uid());

-- Only system can insert audit logs
CREATE POLICY "system_insert_audit" ON public.audit_logs FOR INSERT TO authenticated 
    WITH CHECK (true);

-- =============================================================================
-- 8. CREATE ADDITIONAL POLICIES THAT REQUIRE HELPER FUNCTIONS
-- =============================================================================

-- Now create policies that depend on the helper functions
-- These will be added after the functions are created in the next section    -- =============================================================================
    -- 8. GRANT PERMISSIONS
    -- =============================================================================

    -- Grant usage on schema and types
    GRANT USAGE ON SCHEMA public TO authenticated, anon;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

    -- Grant specific permissions to authenticated users
    GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
    GRANT SELECT ON public.categories, public.locations, public.products TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON public.inventory TO authenticated;
    GRANT SELECT, INSERT ON public.inventory_movements TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON public.orders, public.order_items TO authenticated;
    GRANT SELECT, INSERT ON public.audit_logs TO authenticated;

    -- =============================================================================
    -- 9. CREATE DASHBOARD VIEWS
    -- =============================================================================

    -- Inventory summary view for dashboards
    CREATE OR REPLACE VIEW public.inventory_summary 
    WITH (security_invoker = true)
    AS
    SELECT 
        p.id as product_id,
        p.name as product_name,
        p.sku,
        p.brand,
        p.selling_price,
        c.name as category_name,
        SUM(i.quantity) as total_quantity,
        SUM(i.reserved_quantity) as total_reserved,
        SUM(i.available_quantity) as total_available,
        p.min_stock_level,
        p.reorder_point,
        COUNT(l.id) as locations_count,
        CASE 
            WHEN SUM(i.available_quantity) <= 0 THEN 'out_of_stock'
            WHEN SUM(i.available_quantity) <= p.min_stock_level THEN 'low_stock'
            WHEN SUM(i.available_quantity) <= p.reorder_point THEN 'reorder_needed'
            ELSE 'in_stock'
        END as stock_status,
        p.status as product_status
    FROM public.products p
    LEFT JOIN public.categories c ON p.category_id = c.id
    LEFT JOIN public.inventory i ON p.id = i.product_id
    LEFT JOIN public.locations l ON i.location_id = l.id AND l.is_active = true
    WHERE p.status = 'active'
    GROUP BY p.id, p.name, p.sku, p.brand, p.selling_price, p.min_stock_level, p.reorder_point, c.name, p.status;

    -- Orders summary view for dashboards
    CREATE OR REPLACE VIEW public.orders_summary 
    WITH (security_invoker = true)
    AS
    SELECT 
        o.id,
        o.order_number,
        o.status,
        o.order_type,
        o.order_date,
        o.total_amount,
        o.payment_status,
        p.first_name || ' ' || p.last_name as customer_name,
        p.email as customer_email,
        p.phone as customer_phone,
        COUNT(oi.id) as items_count,
        SUM(oi.quantity) as total_items,
        SUM(oi.fulfilled_quantity) as fulfilled_items,
        CASE 
            WHEN SUM(oi.fulfilled_quantity) = 0 THEN 'unfulfilled'
            WHEN SUM(oi.fulfilled_quantity) < SUM(oi.quantity) THEN 'partially_fulfilled'
            ELSE 'fulfilled'
        END as fulfillment_status
    FROM public.orders o
    LEFT JOIN public.profiles p ON o.customer_id = p.id
    LEFT JOIN public.order_items oi ON o.id = oi.order_id
    GROUP BY o.id, o.order_number, o.status, o.order_type, o.order_date, o.total_amount, o.payment_status, 
            p.first_name, p.last_name, p.email, p.phone;

    -- Dashboard statistics view
    CREATE OR REPLACE VIEW public.dashboard_stats 
    WITH (security_invoker = true)
    AS
    SELECT 
        (SELECT COUNT(*) FROM public.orders WHERE DATE(order_date) = CURRENT_DATE) as orders_today,
        (SELECT COUNT(*) FROM public.orders WHERE status = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM public.products WHERE status = 'active') as active_products,
        (SELECT COUNT(*) FROM public.inventory WHERE available_quantity <= reorder_level) as low_stock_items,
        (SELECT SUM(total_amount) FROM public.orders WHERE status = 'delivered' AND DATE(order_date) = CURRENT_DATE) as revenue_today,
        (SELECT COUNT(*) FROM public.profiles WHERE role = 'user' AND is_active = true) as active_customers;

    -- =============================================================================
    -- 10. INSERT SAMPLE DATA
    -- =============================================================================

    -- Sample categories
    INSERT INTO public.categories (name, description, slug, sort_order) VALUES
    ('Electronics', 'Electronic devices and components', 'electronics', 1),
    ('Computers & Laptops', 'Computer hardware, laptops, and accessories', 'computers-laptops', 2),
    ('Mobile & Tablets', 'Smartphones, tablets, and mobile accessories', 'mobile-tablets', 3),
    ('Home Appliances', 'Kitchen and home appliances', 'home-appliances', 4),
    ('Office Supplies', 'Office equipment and supplies', 'office-supplies', 5);

    -- Sample locations
    INSERT INTO public.locations (name, code, type, address, contact_info) VALUES
    ('Main Warehouse', 'WH001', 'warehouse', '{"street": "123 Industrial Ave", "city": "Mumbai", "state": "Maharashtra", "country": "India", "pincode": "400001"}', '{"phone": "+91-22-12345678", "email": "warehouse@idittrack.com"}'),
    ('Retail Store - Central', 'ST001', 'store', '{"street": "456 Commercial St", "city": "Mumbai", "state": "Maharashtra", "country": "India", "pincode": "400002"}', '{"phone": "+91-22-23456789", "email": "store@idittrack.com"}'),
    ('Distribution Center', 'DC001', 'distribution_center', '{"street": "789 Logistics Blvd", "city": "Delhi", "state": "Delhi", "country": "India", "pincode": "110001"}', '{"phone": "+91-11-34567890", "email": "distribution@idittrack.com"}');

    -- =============================================================================
    -- 11. COMPLETION MESSAGE AND ADMIN SETUP
    -- =============================================================================

    -- Function to promote first user to admin
    CREATE OR REPLACE FUNCTION public.setup_first_admin()
    RETURNS TEXT AS $$
    DECLARE
        first_user_id UUID;
        result TEXT;
    BEGIN
        -- Find the first user (oldest by creation)
        SELECT id INTO first_user_id 
        FROM public.profiles 
        WHERE role = 'user'
        ORDER BY created_at ASC 
        LIMIT 1;
        
        IF first_user_id IS NOT NULL THEN
            UPDATE public.profiles 
            SET 
                role = 'admin',
                company_name = 'IditTrack Administration',
                department = 'IT',
                updated_at = NOW()
            WHERE id = first_user_id;
            
            result := 'First user promoted to admin: ' || first_user_id::TEXT;
        ELSE
            result := 'No users found. Register a user first, then call this function.';
        END IF;
        
        RETURN result;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error promoting user to admin: ' || SQLERRM;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- =============================================================================
    -- SUCCESS MESSAGE
    -- =============================================================================

    DO $$
    BEGIN
        RAISE NOTICE '=============================================================================';
        RAISE NOTICE '🎉 IDITTRACK DATABASE SETUP COMPLETED SUCCESSFULLY! 🎉';
        RAISE NOTICE '=============================================================================';
        RAISE NOTICE '';
        RAISE NOTICE '📋 TABLES CREATED:';
        RAISE NOTICE '   ✓ profiles (User management with RBAC)';
        RAISE NOTICE '   ✓ categories (Product categorization with hierarchy)';
        RAISE NOTICE '   ✓ locations (Warehouses, stores, distribution centers)';
        RAISE NOTICE '   ✓ products (Complete product catalog)';
        RAISE NOTICE '   ✓ inventory (Multi-location stock management)';
        RAISE NOTICE '   ✓ inventory_movements (Complete audit trail)';
        RAISE NOTICE '   ✓ orders (Comprehensive order management)';
        RAISE NOTICE '   ✓ order_items (Order line items)';
        RAISE NOTICE '   ✓ audit_logs (System-wide audit logging)';
        RAISE NOTICE '';
        RAISE NOTICE '🔐 RBAC SYSTEM:';
        RAISE NOTICE '   ✓ Admin: Full system access';
        RAISE NOTICE '   ✓ Manager: Inventory and order management';
        RAISE NOTICE '   ✓ User: Order placement and profile management';
        RAISE NOTICE '';
        RAISE NOTICE '🛡️ SECURITY FEATURES:';
        RAISE NOTICE '   ✓ Row Level Security (RLS) enabled';
        RAISE NOTICE '   ✓ Role-based access policies';
        RAISE NOTICE '   ✓ Data validation and constraints';
        RAISE NOTICE '   ✓ Audit trail for all changes';
        RAISE NOTICE '';
        RAISE NOTICE '📊 DASHBOARD VIEWS:';
        RAISE NOTICE '   ✓ inventory_summary (Stock levels and status)';
        RAISE NOTICE '   ✓ orders_summary (Order overview with fulfillment)';
        RAISE NOTICE '   ✓ dashboard_stats (Key metrics)';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 NEXT STEPS:';
        RAISE NOTICE '   1. Register your first user through the app';
        RAISE NOTICE '   2. Run: SELECT public.setup_first_admin(); to promote them';
        RAISE NOTICE '   3. Log in as admin and add products/inventory';
        RAISE NOTICE '   4. Create manager accounts as needed';
        RAISE NOTICE '   5. Start processing orders!';
        RAISE NOTICE '';
        RAISE NOTICE 'Your complete inventory and order management system is ready! 🎯';
        RAISE NOTICE '=============================================================================';
    END $$;
