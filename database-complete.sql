-- IditTrack Complete Database Setup
-- This is the single comprehensive SQL file for the entire IditTrack project
-- Execute this in your Supabase SQL Editor

-- =============================================================================
-- SECTION 1: CLEANUP (Optional - only if you need to start fresh)
-- =============================================================================

-- Uncomment the following section only if you need to completely reset the database
/*
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Products are viewable by authenticated users" ON public.products;
DROP POLICY IF EXISTS "Admins and managers can modify products" ON public.products;
DROP POLICY IF EXISTS "Products can be modified by authenticated users" ON public.products;
DROP POLICY IF EXISTS "Categories are viewable by authenticated users" ON public.categories;
DROP POLICY IF EXISTS "Admins can modify categories" ON public.categories;
DROP POLICY IF EXISTS "Categories can be modified by authenticated users" ON public.categories;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can modify own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Inventory is viewable by authenticated users" ON public.inventory;
DROP POLICY IF EXISTS "Admins and managers can modify inventory" ON public.inventory;
DROP POLICY IF EXISTS "Inventory can be modified by authenticated users" ON public.inventory;
DROP POLICY IF EXISTS "Locations are viewable by authenticated users" ON public.locations;
DROP POLICY IF EXISTS "Admins can modify locations" ON public.locations;
DROP POLICY IF EXISTS "Locations can be modified by authenticated users" ON public.locations;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.categories;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.order_items;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.inventory;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.locations;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_inventory_updated_at ON public.inventory;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
*/

-- =============================================================================
-- SECTION 2: EXTENSIONS AND BASIC SETUP
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- SECTION 3: TABLE CREATION
-- =============================================================================

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    price DECIMAL(10,2),
    cost DECIMAL(10,2),
    weight DECIMAL(8,2),
    dimensions JSONB,
    metadata JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'discontinued')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'warehouse' CHECK (type IN ('warehouse', 'store', 'supplier')),
    address JSONB,
    contact_info JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 0,
    max_stock INTEGER,
    last_counted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, location_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    order_type TEXT DEFAULT 'sale' CHECK (order_type IN ('sale', 'purchase', 'transfer')),
    subtotal DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    shipping_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    shipping_address JSONB,
    billing_address JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SECTION 4: INDEXES FOR PERFORMANCE
-- =============================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory(location_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- =============================================================================
-- SECTION 5: FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name')
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN new;
END;
$$ language plpgsql security definer;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON public.inventory;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- =============================================================================
-- SECTION 6: ROW LEVEL SECURITY (RLS) SETUP
-- =============================================================================

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
CREATE POLICY "Allow profile creation" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin policies for profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for products
DROP POLICY IF EXISTS "Products are viewable by authenticated users" ON public.products;
CREATE POLICY "Products are viewable by authenticated users" ON public.products
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Products can be modified by authenticated users" ON public.products;
CREATE POLICY "Products can be modified by authenticated users" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for categories
DROP POLICY IF EXISTS "Categories are viewable by authenticated users" ON public.categories;
CREATE POLICY "Categories are viewable by authenticated users" ON public.categories
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Categories can be modified by authenticated users" ON public.categories;
CREATE POLICY "Categories can be modified by authenticated users" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for order_items
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can modify own order items" ON public.order_items;
CREATE POLICY "Users can modify own order items" ON public.order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

-- RLS Policies for inventory
DROP POLICY IF EXISTS "Inventory is viewable by authenticated users" ON public.inventory;
CREATE POLICY "Inventory is viewable by authenticated users" ON public.inventory
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Inventory can be modified by authenticated users" ON public.inventory;
CREATE POLICY "Inventory can be modified by authenticated users" ON public.inventory
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for locations
DROP POLICY IF EXISTS "Locations are viewable by authenticated users" ON public.locations;
CREATE POLICY "Locations are viewable by authenticated users" ON public.locations
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Locations can be modified by authenticated users" ON public.locations;
CREATE POLICY "Locations can be modified by authenticated users" ON public.locations
    FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- SECTION 7: SAMPLE DATA
-- =============================================================================

-- Insert sample categories
INSERT INTO public.categories (name, description) VALUES 
    ('Electronics', 'Electronic devices and accessories'),
    ('Clothing', 'Apparel and fashion items'),
    ('Books', 'Books and publications'),
    ('Home & Garden', 'Home improvement and gardening supplies')
ON CONFLICT DO NOTHING;

-- Insert sample locations
INSERT INTO public.locations (name, type, address) VALUES 
    ('Main Warehouse', 'warehouse', '{"street": "123 Industrial Blvd", "city": "Mumbai", "state": "MH", "zip": "400001", "country": "India"}'),
    ('Store Front', 'store', '{"street": "456 Commercial St", "city": "Mumbai", "state": "MH", "zip": "400002", "country": "India"}')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SECTION 8: ADMIN AND ROLE MANAGEMENT
-- =============================================================================

-- Commands for setting up admin and manager roles
-- Note: First create the users in Supabase Dashboard > Authentication > Users
-- Then use these commands to assign roles:

-- Example: Update a user to admin role (replace 'USER_UUID_HERE' with actual UUID)
-- UPDATE public.profiles 
-- SET role = 'admin', 
--     first_name = 'Admin', 
--     last_name = 'User',
--     company = 'IditTrack Admin'
-- WHERE id = 'USER_UUID_HERE';

-- Example: Update a user to manager role (replace 'USER_UUID_HERE' with actual UUID)
-- UPDATE public.profiles 
-- SET role = 'manager', 
--     first_name = 'Manager', 
--     last_name = 'User',
--     company = 'IditTrack Operations'
-- WHERE id = 'USER_UUID_HERE';

-- =============================================================================
-- SECTION 9: DEBUGGING AND VERIFICATION QUERIES
-- =============================================================================

-- Check database structure
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Check current user profiles
-- SELECT id, email, first_name, last_name, company, role, created_at, updated_at 
-- FROM public.profiles 
-- ORDER BY created_at DESC;

-- Check if there are any users without profiles
-- SELECT u.id, u.email, u.created_at as user_created, p.id as profile_id
-- FROM auth.users u
-- LEFT JOIN public.profiles p ON u.id = p.id
-- WHERE p.id IS NULL;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename IN ('profiles', 'products', 'categories', 'orders', 'order_items', 'inventory', 'locations');

-- Check for specific user profile (replace 'your-email@example.com' with actual email)
-- SELECT p.*, u.email 
-- FROM public.profiles p
-- JOIN auth.users u ON p.id = u.id
-- WHERE u.email = 'your-email@example.com';

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

SELECT 'IditTrack Complete Database Setup Completed Successfully!' as status,
       'All tables, functions, triggers, and policies have been created.' as details,
       'You can now use your application with full database functionality.' as next_steps;
