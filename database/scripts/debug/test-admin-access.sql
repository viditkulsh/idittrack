-- =============================================================================
-- TEST CURRENT USER'S ADMIN ACCESS
-- =============================================================================
-- Run this to test if your current logged-in user can access profiles
-- =============================================================================

-- 1. Check your current authentication status
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_email,
    auth.role() as current_auth_role;

-- 2. Check your profile and role
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    is_active
FROM public.profiles 
WHERE id = auth.uid();

-- 3. Test admin function
SELECT 
    public.is_admin() as is_admin_function_result,
    (SELECT role FROM public.profiles WHERE id = auth.uid()) as profile_role;

-- 4. Test if you can see all profiles (this should work if you're admin)
SELECT 
    count(*) as total_profiles_visible
FROM public.profiles;

-- 5. Try to get a list of all profiles (should work if admin policies are working)
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 5;

-- Display results
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'ADMIN ACCESS TEST RESULTS';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'If you can see profile data above, your database access is working.';
    RAISE NOTICE 'If not, there might be an RLS or authentication issue.';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Visit /debug in your app to check React AuthContext state';
    RAISE NOTICE '2. Compare the role shown there with the role shown above';
    RAISE NOTICE '3. If they differ, log out and log back in to refresh the session';
    RAISE NOTICE '=============================================================================';
END;
$$;
