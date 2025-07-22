-- =============================================================================
-- DEBUG PROFILE FETCH ISSUE
-- =============================================================================
-- Comprehensive debugging for profile fetch problems
-- =============================================================================

-- 1. Check if profile exists (as service role - bypasses RLS)
SELECT 'Profile existence check:' as check_type;
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
WHERE id = '95b96e42-7021-4b4f-8179-9c62e1c34a59';

-- 2. Check RLS policies that might affect profile fetching
SELECT 'RLS policies check:' as check_type;
SELECT 
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public' 
AND cmd = 'SELECT'
ORDER BY policyname;

-- 3. Test the exact query that the React app would run
-- This simulates what happens when fetchProfile runs
SELECT 'Simulating React app query:' as check_type;

-- Enable RLS to test as authenticated user would
SET row_security = on;

-- This is the exact query that supabase.from('profiles').select('*').eq('id', userId).single() would run
SELECT *
FROM public.profiles 
WHERE id = '95b96e42-7021-4b4f-8179-9c62e1c34a59';

-- 4. Check if auth.uid() works correctly
SELECT 'Auth function check:' as check_type;
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_email,
    CASE 
        WHEN auth.uid() IS NULL THEN 'No authenticated user'
        WHEN auth.uid() = '95b96e42-7021-4b4f-8179-9c62e1c34a59' THEN 'Correct user ID'
        ELSE 'Different user ID: ' || auth.uid()::text
    END as auth_status;

-- 5. Test the users_own_profile_select policy specifically
SELECT 'Testing own profile policy:' as check_type;
SELECT 
    id,
    email,
    role,
    (auth.uid() = id) as policy_condition_result
FROM public.profiles 
WHERE id = '95b96e42-7021-4b4f-8179-9c62e1c34a59';

-- Reset RLS setting
SET row_security = off;

-- Display results
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'PROFILE FETCH DEBUG RESULTS';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Check the results above to identify the issue:';
    RAISE NOTICE '';
    RAISE NOTICE 'If profile exists but React app gets null:';
    RAISE NOTICE '1. RLS policy issue - user cannot see their own profile';
    RAISE NOTICE '2. Auth context issue - auth.uid() not working in app context';
    RAISE NOTICE '3. Browser console should show fetchProfile errors';
    RAISE NOTICE '';
    RAISE NOTICE 'If profile does not exist:';
    RAISE NOTICE '1. The create-admin-profile.sql script failed';
    RAISE NOTICE '2. RLS prevented profile creation';
    RAISE NOTICE '3. Need to check database logs';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Check browser console for fetchProfile errors';
    RAISE NOTICE '2. Try clicking Refresh Profile button in /debug';
    RAISE NOTICE '3. If still fails, check Supabase dashboard logs';
    RAISE NOTICE '=============================================================================';
END;
$$;
