-- =============================================================================
-- CHECK SPECIFIC USER PROFILE
-- =============================================================================
-- Check if profile exists for the specific user ID from your debug output
-- =============================================================================

-- 1. Check if profile exists for your user ID
SELECT 
    id,
    email,
    first_name,
    last_name,
    company_name,
    role,
    is_active,
    email_verified,
    created_at,
    updated_at
FROM public.profiles 
WHERE id = '95b96e42-7021-4b4f-8179-9c62e1c34a59';

-- 2. If no profile found, check auth.users table
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE id = '95b96e42-7021-4b4f-8179-9c62e1c34a59';

-- 3. Check if there are any profiles at all
SELECT count(*) as total_profiles FROM public.profiles;

-- 4. Check if RLS is blocking the profile fetch
-- Try with service role privileges (this bypasses RLS)
SELECT 'Testing RLS policies...' as test;

-- Display next steps
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'PROFILE EXISTENCE CHECK';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'User ID: 95b96e42-7021-4b4f-8179-9c62e1c34a59';
    RAISE NOTICE 'Email: viditkul08@gmail.com';
    RAISE NOTICE '';
    RAISE NOTICE 'If no profile found above:';
    RAISE NOTICE '1. Profile was never created by handle_new_user trigger';
    RAISE NOTICE '2. Profile was deleted somehow';
    RAISE NOTICE '3. RLS is blocking the query';
    RAISE NOTICE '';
    RAISE NOTICE 'If profile exists but app shows null:';
    RAISE NOTICE '1. RLS policy issue preventing user from seeing own profile';
    RAISE NOTICE '2. AuthContext fetchProfile function has an error';
    RAISE NOTICE '3. Check browser console for fetchProfile errors';
    RAISE NOTICE '=============================================================================';
END;
$$;
