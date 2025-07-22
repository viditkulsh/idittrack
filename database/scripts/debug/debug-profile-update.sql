-- =============================================================================
-- DEBUG PROFILE UPDATE ISSUES
-- =============================================================================
-- This script helps debug profile update issues by checking permissions,
-- RLS policies, and table structure.
-- =============================================================================

-- Check if RLS is enabled on profiles table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Check existing RLS policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Check profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current user's profile (replace with actual user ID)
-- SELECT * FROM public.profiles WHERE id = auth.uid();

-- Test if current user can update their own profile
-- UPDATE public.profiles 
-- SET first_name = 'Test', updated_at = now()
-- WHERE id = auth.uid()
-- RETURNING *;

-- Check if there are any triggers on profiles table that might interfere
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles' AND event_object_schema = 'public';

-- Display helpful information
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'PROFILE UPDATE DEBUG INFORMATION';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Common issues and solutions:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Column name mismatch:';
    RAISE NOTICE '   - Database uses: company_name';
    RAISE NOTICE '   - Make sure your code uses company_name, not company';
    RAISE NOTICE '';
    RAISE NOTICE '2. Required fields in database:';
    RAISE NOTICE '   - first_name (NOT NULL)';
    RAISE NOTICE '   - last_name (NOT NULL)';
    RAISE NOTICE '   - email (NOT NULL)';
    RAISE NOTICE '';
    RAISE NOTICE '3. RLS Policy issues:';
    RAISE NOTICE '   - Users can only update their own profile (auth.uid() = id)';
    RAISE NOTICE '   - Make sure user is authenticated';
    RAISE NOTICE '';
    RAISE NOTICE '4. Common SQL errors to check:';
    RAISE NOTICE '   - PGRST116: Row not found';
    RAISE NOTICE '   - 23502: NOT NULL constraint violation';
    RAISE NOTICE '   - 42703: Column does not exist';
    RAISE NOTICE '=============================================================================';
END;
$$;
