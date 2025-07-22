-- =============================================================================
-- DEBUG USER MANAGEMENT VISIBILITY ISSUES
-- =============================================================================
-- This script helps debug why admin panel is not showing all users
-- =============================================================================

-- Check if RLS is enabled on profiles table
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Check all existing RLS policies on profiles table
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_expression,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY cmd, policyname;

-- Check your current user's role
SELECT 
    id,
    email,
    role,
    first_name || ' ' || last_name as full_name
FROM public.profiles 
WHERE id = auth.uid();

-- Test admin functions
SELECT 
    auth.uid() as current_user_id,
    (SELECT role FROM public.profiles WHERE id = auth.uid()) as current_role,
    public.is_admin() as is_admin_function,
    public.is_manager_or_admin() as is_manager_or_admin_function;

-- Try to see all profiles (this should work after adding admin policies)
SELECT 
    count(*) as total_profiles,
    count(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
    count(CASE WHEN role = 'manager' THEN 1 END) as manager_count,
    count(CASE WHEN role = 'user' THEN 1 END) as user_count
FROM public.profiles;

-- Show recent profiles (to see if new registrations are working)
SELECT 
    id,
    email,
    first_name,
    last_name,
    company_name,
    role,
    created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Display helpful information
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'USER MANAGEMENT DEBUG INFORMATION';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Common issues and solutions:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Missing Admin Policies:';
    RAISE NOTICE '   - Run add-admin-policies.sql to add admin view permissions';
    RAISE NOTICE '';
    RAISE NOTICE '2. RLS Blocking Admin Access:';
    RAISE NOTICE '   - Check if admin policies exist and use correct role check';
    RAISE NOTICE '';
    RAISE NOTICE '3. User Role Issues:';
    RAISE NOTICE '   - Verify your account has admin role in database';
    RAISE NOTICE '   - Check if isAdmin() function returns true';
    RAISE NOTICE '';
    RAISE NOTICE '4. New User Registration:';
    RAISE NOTICE '   - Check if handle_new_user function is creating profiles';
    RAISE NOTICE '   - Verify profiles table for recent entries';
    RAISE NOTICE '=============================================================================';
END;
$$;
