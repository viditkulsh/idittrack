-- =============================================================================
-- VERIFY ADMIN SETUP AND PROFILE SYNC
-- =============================================================================
-- This script helps verify your admin setup and profile synchronization
-- =============================================================================

-- 1. Check all user profiles and roles
SELECT 
    id,
    email,
    first_name,
    last_name,
    company_name,
    role,
    is_active,
    email_verified,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;

-- 2. Check if you have admin role (replace with your email)
-- SELECT * FROM public.profiles WHERE email = 'your-email@example.com';

-- 3. Set admin role (uncomment and update email if needed)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- 4. Check RLS policies for profiles
SELECT 
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY cmd, policyname;

-- 5. Test admin functions with your user ID
-- SELECT 
--     auth.uid() as current_user_id,
--     (SELECT role FROM public.profiles WHERE id = auth.uid()) as current_role,
--     public.is_admin() as is_admin_result;

-- Display troubleshooting steps
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'ADMIN ACCESS TROUBLESHOOTING';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Steps to debug admin access:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Check your profile role above - should be "admin"';
    RAISE NOTICE '2. Visit /debug in your app to see AuthContext state';
    RAISE NOTICE '3. Try /admin-direct route to bypass role check';
    RAISE NOTICE '4. If profile.role is not admin, log out and log back in';
    RAISE NOTICE '5. Run add-admin-policies.sql if not done already';
    RAISE NOTICE '';
    RAISE NOTICE 'Common issues:';
    RAISE NOTICE '- Profile not loaded in React context (shows as null)';
    RAISE NOTICE '- Cached profile data with old role';
    RAISE NOTICE '- Missing admin policies in database';
    RAISE NOTICE '- AuthContext not refreshing after role change';
    RAISE NOTICE '=============================================================================';
END;
$$;
