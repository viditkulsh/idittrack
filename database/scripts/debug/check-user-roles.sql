-- =============================================================================
-- CHECK AND SET ADMIN ROLE
-- =============================================================================
-- This script checks your current role and optionally sets you as admin
-- Replace 'your-email@example.com' with your actual email address
-- =============================================================================

-- Check current user roles
SELECT 
    email,
    first_name,
    last_name,
    role,
    created_at
FROM public.profiles 
ORDER BY created_at;

-- To set yourself as admin, uncomment and modify the email in the line below:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Check total user count
SELECT count(*) as total_users FROM public.profiles;

-- Display information
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'USER ROLE CHECK';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'If you need to set yourself as admin:';
    RAISE NOTICE '1. Uncomment the UPDATE line above';
    RAISE NOTICE '2. Replace your-email@example.com with your actual email';
    RAISE NOTICE '3. Run the script';
    RAISE NOTICE '';
    RAISE NOTICE 'After setting admin role, also run add-admin-policies.sql';
    RAISE NOTICE '=============================================================================';
END;
$$;
