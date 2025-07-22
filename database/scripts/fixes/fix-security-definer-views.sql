-- =============================================================================
-- FIX SECURITY DEFINER VIEWS
-- =============================================================================
-- This script addresses the security definer view warnings by recreating 
-- the views without the SECURITY DEFINER property.
-- 
-- The views will now run with the permissions of the querying user instead
-- of the view creator, which is the recommended security practice.
-- =============================================================================

-- Drop existing views that have SECURITY DEFINER
DROP VIEW IF EXISTS public.orders_summary CASCADE;
DROP VIEW IF EXISTS public.dashboard_stats CASCADE;
DROP VIEW IF EXISTS public.inventory_summary CASCADE;

-- Recreate inventory_summary view without SECURITY DEFINER
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

-- Recreate orders_summary view without SECURITY DEFINER
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

-- Recreate dashboard_stats view without SECURITY DEFINER
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

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON public.inventory_summary TO authenticated;
GRANT SELECT ON public.orders_summary TO authenticated;
GRANT SELECT ON public.dashboard_stats TO authenticated;

-- Note: Views inherit RLS policies from their underlying tables
-- We don't need to create separate policies for views - they automatically 
-- respect the RLS policies of the tables they query from.

-- The views will be secured by the existing RLS policies on:
-- - public.products (for inventory_summary)
-- - public.categories (for inventory_summary) 
-- - public.inventory (for inventory_summary)
-- - public.locations (for inventory_summary)
-- - public.orders (for orders_summary and dashboard_stats)
-- - public.profiles (for orders_summary and dashboard_stats)
-- - public.order_items (for orders_summary)

-- If you need additional view-level security, implement it in your application logic
-- using the role-based helper functions in your AuthContext:
-- - isAdmin()
-- - isManager() 
-- - isManagerOrAdmin()

-- Note: Regular views don't need to be refreshed like materialized views
-- The views are automatically updated when the underlying data changes

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'SECURITY DEFINER VIEWS FIX COMPLETED';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Successfully recreated views without SECURITY DEFINER:';
    RAISE NOTICE '   ✓ inventory_summary (with security_invoker = true)';
    RAISE NOTICE '   ✓ orders_summary (with security_invoker = true)';
    RAISE NOTICE '   ✓ dashboard_stats (with security_invoker = true)';
    RAISE NOTICE '';
    RAISE NOTICE 'Views inherit security from underlying table RLS policies:';
    RAISE NOTICE '   ✓ inventory_summary - secured by products, inventory, categories, locations tables';
    RAISE NOTICE '   ✓ orders_summary - secured by orders, profiles, order_items tables';
    RAISE NOTICE '   ✓ dashboard_stats - secured by orders, profiles, products, inventory tables';
    RAISE NOTICE '';
    RAISE NOTICE 'Views now run with querying user permissions instead of creator permissions.';
    RAISE NOTICE '=============================================================================';
END;
$$;
