-- =============================================================================
-- FRESH START: SIMPLE INVENTORY & ORDER MANAGEMENT SYSTEM WITH RBAC
-- =============================================================================
-- This script completely recreates the database with a clean, normalized design
-- Safe to run multiple times - handles all conflicts with previous schemas

-- =============================================================================
-- 1. CLEAN SLATE - DROP ALL EXISTING TABLES AND DEPENDENCIES
-- =============================================================================

-- Drop all triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_inventory_updated_at ON public.inventory;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS test_rls_policies() CASCADE;
DROP FUNCTION IF EXISTS test_user_creation() CASCADE;

-- Drop all policies
DROP POLICY IF EXISTS "service_role_full_access" ON public.profiles;
DROP POLICY IF EXISTS "users_own_profile_select" ON public.profiles;
DROP POLICY IF EXISTS "users_own_profile_update" ON public.profiles;
DROP POLICY IF EXISTS "users_own_profile_insert" ON public.profiles;
DROP POLICY IF EXISTS "anonymous_profile_insert" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role full access" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON public.profiles;

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.inventory_movements CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.product_variants CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.product_status CASCADE;
DROP TYPE IF EXISTS public.movement_type CASCADE;

-- =============================================================================
-- 2. CREATE CUSTOM TYPES (ENUMS)
-- =============================================================================

-- User roles for RBAC
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'user');

-- Order status workflow
CREATE TYPE public.order_status AS ENUM (
    'pending',      -- Order created
    'confirmed',    -- Order confirmed
    'processing',   -- Being prepared
    'shipped',      -- Shipped to customer
    'delivered',    -- Successfully delivered
    'cancelled',    -- Cancelled by user/admin
    'returned'      -- Product returned
);

-- Product status
CREATE TYPE public.product_status AS ENUM ('active', 'inactive', 'discontinued');

-- Inventory movement types
CREATE TYPE public.movement_type AS ENUM (
    'in',           -- Stock received
    'out',          -- Stock removed
    'adjustment',   -- Manual adjustment
    'transfer',     -- Between locations
    'sale',         -- Sold to customer
    'return',       -- Returned from customer
    'damage',       -- Damaged goods
    'expired'       -- Expired products
);

-- =============================================================================
-- 3. CREATE CORE TABLES
-- =============================================================================

-- 3.1 User Profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL CHECK (length(trim(first_name)) > 0),
    last_name TEXT NOT NULL CHECK (length(trim(last_name)) > 0),
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone TEXT CHECK (phone IS NULL OR phone ~ '^[0-9+\-\s()]+$'),
    role user_role NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT true,
    company_name TEXT,
    avatar_url TEXT,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 Categories (for product organization)
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
    description TEXT,
    slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9\-]+$'),
    sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Locations (warehouses, stores, etc.)
CREATE TABLE public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    code TEXT NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9]{2,10}$'),
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT NOT NULL DEFAULT 'India',
    postal_code TEXT,
    phone TEXT,
    email TEXT CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    type TEXT NOT NULL DEFAULT 'warehouse' CHECK (type IN ('warehouse', 'store', 'distribution_center')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    manager_id UUID REFERENCES public.profiles(id),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 Products
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    sku TEXT UNIQUE NOT NULL CHECK (length(trim(sku)) > 0),
    barcode TEXT,
    category_id UUID REFERENCES public.categories(id),
    brand TEXT,
    cost_price DECIMAL(12,2) CHECK (cost_price >= 0),
    selling_price DECIMAL(12,2) CHECK (selling_price >= 0),
    min_stock_level INTEGER NOT NULL DEFAULT 0 CHECK (min_stock_level >= 0),
    reorder_point INTEGER NOT NULL DEFAULT 0 CHECK (reorder_point >= 0),
    status product_status NOT NULL DEFAULT 'active',
    weight DECIMAL(10,3) CHECK (weight IS NULL OR weight > 0),
    dimensions JSONB DEFAULT '{}',
    tags TEXT[],
    images TEXT[],
    is_serialized BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 Inventory (stock levels at each location)
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    last_counted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one inventory record per product per location
    UNIQUE(product_id, location_id)
);

-- 3.6 Inventory Movements (audit trail for stock changes)
CREATE TABLE public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
    type movement_type NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity != 0),
    previous_quantity INTEGER NOT NULL CHECK (previous_quantity >= 0),
    new_quantity INTEGER NOT NULL CHECK (new_quantity >= 0),
    unit_cost DECIMAL(12,2),
    reference_type TEXT, -- 'order', 'adjustment', 'transfer', etc.
    reference_id UUID,   -- ID of related record (order_id, transfer_id, etc.)
    reason TEXT,
    notes TEXT,
    performed_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7 Orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.profiles(id),
    status order_status NOT NULL DEFAULT 'pending',
    order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    required_date TIMESTAMPTZ,
    shipped_date TIMESTAMPTZ,
    delivered_date TIMESTAMPTZ,
    
    -- Pricing
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    shipping_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    
    -- Addresses and shipping
    shipping_address JSONB,
    billing_address JSONB,
    tracking_number TEXT,
    
    -- Metadata
    notes TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.8 Order Items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),
    fulfilled_quantity INTEGER NOT NULL DEFAULT 0 CHECK (fulfilled_quantity >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- Products indexes
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_name_search ON public.products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Inventory indexes
CREATE INDEX idx_inventory_product_location ON public.inventory(product_id, location_id);
CREATE INDEX idx_inventory_quantity ON public.inventory(quantity);
CREATE INDEX idx_inventory_low_stock ON public.inventory(product_id) WHERE quantity <= 10;

-- Orders indexes
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_date ON public.orders(order_date);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- Inventory movements indexes
CREATE INDEX idx_inventory_movements_inventory_id ON public.inventory_movements(inventory_id);
CREATE INDEX idx_inventory_movements_type ON public.inventory_movements(type);
CREATE INDEX idx_inventory_movements_created_at ON public.inventory_movements(created_at);

-- =============================================================================
-- 5. CREATE TRIGGER FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
        NEW.email,
        NEW.raw_user_meta_data->>'company',
        'user'::user_role,
        true,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, just return
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    counter INTEGER;
BEGIN
    -- Get current date in YYYYMMDD format
    order_num := 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-';
    
    -- Get the count of orders today
    SELECT COUNT(*) + 1 INTO counter
    FROM public.orders 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Pad with zeros
    order_num := order_num || LPAD(counter::TEXT, 4, '0');
    
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

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
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

-- Profiles policies
CREATE POLICY "service_role_profiles" ON public.profiles FOR ALL TO service_role USING (true);
CREATE POLICY "users_own_profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id);
CREATE POLICY "admin_all_profiles" ON public.profiles FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Categories policies (Admin/Manager can manage, all can view)
CREATE POLICY "service_role_categories" ON public.categories FOR ALL TO service_role USING (true);
CREATE POLICY "public_view_categories" ON public.categories FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "admin_manager_categories" ON public.categories FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Locations policies (Admin/Manager can manage, all can view)
CREATE POLICY "service_role_locations" ON public.locations FOR ALL TO service_role USING (true);
CREATE POLICY "public_view_locations" ON public.locations FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "admin_manager_locations" ON public.locations FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Products policies (Admin/Manager can manage, all can view active)
CREATE POLICY "service_role_products" ON public.products FOR ALL TO service_role USING (true);
CREATE POLICY "public_view_products" ON public.products FOR SELECT TO authenticated USING (status = 'active');
CREATE POLICY "admin_manager_products" ON public.products FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Inventory policies (Admin/Manager can manage, users can view)
CREATE POLICY "service_role_inventory" ON public.inventory FOR ALL TO service_role USING (true);
CREATE POLICY "view_inventory" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_manager_inventory" ON public.inventory FOR INSERT, UPDATE, DELETE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Inventory movements policies (Admin/Manager can manage, users can view)
CREATE POLICY "service_role_movements" ON public.inventory_movements FOR ALL TO service_role USING (true);
CREATE POLICY "view_movements" ON public.inventory_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_manager_movements" ON public.inventory_movements FOR INSERT, UPDATE, DELETE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Orders policies (Users can manage own orders, Admin/Manager can manage all)
CREATE POLICY "service_role_orders" ON public.orders FOR ALL TO service_role USING (true);
CREATE POLICY "users_own_orders" ON public.orders FOR ALL TO authenticated 
    USING (customer_id = auth.uid() OR created_by = auth.uid());
CREATE POLICY "admin_manager_orders" ON public.orders FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Order items policies (follow order permissions)
CREATE POLICY "service_role_order_items" ON public.order_items FOR ALL TO service_role USING (true);
CREATE POLICY "users_own_order_items" ON public.order_items FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (customer_id = auth.uid() OR created_by = auth.uid())));
CREATE POLICY "admin_manager_order_items" ON public.order_items FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- =============================================================================
-- 8. GRANT PERMISSIONS
-- =============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.categories, public.locations, public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.inventory TO authenticated;
GRANT SELECT, INSERT ON public.inventory_movements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders, public.order_items TO authenticated;

-- Grant full access to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =============================================================================
-- 9. SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert sample categories
INSERT INTO public.categories (name, description, slug, sort_order) VALUES
('Electronics', 'Electronic devices and components', 'electronics', 1),
('Computers', 'Computer hardware and accessories', 'computers', 2),
('Mobile Devices', 'Smartphones, tablets, and accessories', 'mobile-devices', 3),
('Accessories', 'Various accessories and add-ons', 'accessories', 4);

-- Insert sample locations
INSERT INTO public.locations (name, code, address, city, state, country, type) VALUES
('Main Warehouse', 'WH01', '123 Industrial Ave', 'Mumbai', 'Maharashtra', 'India', 'warehouse'),
('Store Front', 'ST01', '456 Commercial St', 'Mumbai', 'Maharashtra', 'India', 'store'),
('Distribution Center', 'DC01', '789 Logistics Blvd', 'Delhi', 'Delhi', 'India', 'warehouse');

-- Note: Products and inventory will be added through the application

-- =============================================================================
-- 10. CREATE HELPFUL VIEWS FOR DASHBOARD
-- =============================================================================

-- Inventory summary view
CREATE OR REPLACE VIEW public.inventory_summary 
WITH (security_invoker = true)
AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.sku,
    p.min_stock_level,
    p.reorder_point,
    c.name as category_name,
    SUM(i.quantity) as total_quantity,
    SUM(i.reserved_quantity) as total_reserved,
    SUM(i.quantity - i.reserved_quantity) as available_quantity,
    COUNT(l.id) as locations_count,
    CASE 
        WHEN SUM(i.quantity) <= p.min_stock_level THEN 'low'
        WHEN SUM(i.quantity) <= p.reorder_point THEN 'reorder'
        ELSE 'good'
    END as stock_status
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.inventory i ON p.id = i.product_id
LEFT JOIN public.locations l ON i.location_id = l.id
WHERE p.status = 'active' AND (l.is_active = true OR l.id IS NULL)
GROUP BY p.id, p.name, p.sku, p.min_stock_level, p.reorder_point, c.name;

-- Orders summary view
CREATE OR REPLACE VIEW public.orders_summary 
WITH (security_invoker = true)
AS
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.order_date,
    o.total_amount,
    p.first_name || ' ' || p.last_name as customer_name,
    p.email as customer_email,
    COUNT(oi.id) as items_count,
    SUM(oi.quantity) as total_items
FROM public.orders o
LEFT JOIN public.profiles p ON o.customer_id = p.id
LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.status, o.order_date, o.total_amount, p.first_name, p.last_name, p.email;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'FRESH DATABASE SETUP COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'CREATED TABLES:';
    RAISE NOTICE '✓ profiles (User management with RBAC)';
    RAISE NOTICE '✓ categories (Product categorization)';
    RAISE NOTICE '✓ locations (Warehouses and stores)';
    RAISE NOTICE '✓ products (Product catalog)';
    RAISE NOTICE '✓ inventory (Stock levels per location)';
    RAISE NOTICE '✓ inventory_movements (Stock change audit trail)';
    RAISE NOTICE '✓ orders (Customer orders)';
    RAISE NOTICE '✓ order_items (Order line items)';
    RAISE NOTICE '';
    RAISE NOTICE 'FEATURES IMPLEMENTED:';
    RAISE NOTICE '✓ Role-based access control (Admin/Manager/User)';
    RAISE NOTICE '✓ Proper normalization and relationships';
    RAISE NOTICE '✓ Inventory tracking across multiple locations';
    RAISE NOTICE '✓ Complete order management workflow';
    RAISE NOTICE '✓ Audit trails for inventory movements';
    RAISE NOTICE '✓ Performance indexes';
    RAISE NOTICE '✓ Row Level Security (RLS) policies';
    RAISE NOTICE '✓ Automated triggers and functions';
    RAISE NOTICE '✓ Dashboard-ready views';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Update your first user to admin role';
    RAISE NOTICE '2. Test user registration and login';
    RAISE NOTICE '3. Add products and inventory through the UI';
    RAISE NOTICE '4. Create and manage orders';
    RAISE NOTICE '5. Monitor inventory levels and movements';
    RAISE NOTICE '';
    RAISE NOTICE 'Your simple but powerful inventory system is ready!';
    RAISE NOTICE '=============================================================================';
END $$;

-- =============================================================================
-- ADMIN ROLE ASSIGNMENT (Update the first user to admin)
-- =============================================================================

-- Automatically assign admin role to the first user (if any exists)
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    SELECT id INTO first_user_id 
    FROM public.profiles 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        UPDATE public.profiles 
        SET role = 'admin', 
            company_name = 'IditTrack Admin',
            updated_at = NOW()
        WHERE id = first_user_id;
        
        RAISE NOTICE 'First user has been assigned admin role: %', first_user_id;
    ELSE
        RAISE NOTICE 'No existing users found. The next registered user can be manually assigned admin role.';
    END IF;
END $$;
