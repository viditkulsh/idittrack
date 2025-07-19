-- IditTrack Database Cleanup Script
-- Run this FIRST in your Supabase SQL Editor to clean up existing tables

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
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.inventory;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.locations;
DROP TABLE IF EXISTS public.profiles;

-- Drop indexes (if they exist separately)
DROP INDEX IF EXISTS idx_products_sku;
DROP INDEX IF EXISTS idx_products_category;
DROP INDEX IF EXISTS idx_products_status;
DROP INDEX IF EXISTS idx_orders_user;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_number;
DROP INDEX IF EXISTS idx_inventory_product;
DROP INDEX IF EXISTS idx_inventory_location;
DROP INDEX IF EXISTS idx_order_items_order;
DROP INDEX IF EXISTS idx_order_items_product;

-- Clean up complete
SELECT 'Database cleanup completed. Now run the main schema.' as status;
