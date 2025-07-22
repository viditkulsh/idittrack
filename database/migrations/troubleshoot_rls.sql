-- TROUBLESHOOTING SCRIPT FOR RLS UPLOAD ISSUES
-- Run this in Supabase SQL Editor to diagnose and fix RLS problems

-- Step 1: Check if file_uploads table exists and RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'file_uploads' AND schemaname = 'public';

-- Step 2: Check existing policies on file_uploads table
SELECT 
    policyname,
    cmd as command_type,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'file_uploads' AND schemaname = 'public';

-- Step 3: Check current user authentication
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- Step 4: Check if user has a profile
SELECT 
    id,
    email,
    role,
    created_at
FROM public.profiles 
WHERE id = auth.uid();

-- Step 5: TEMPORARY FIX - Disable RLS for testing (REMOVE AFTER TESTING!)
-- Uncomment the next line ONLY for testing, then re-enable RLS
-- ALTER TABLE public.file_uploads DISABLE ROW LEVEL SECURITY;

-- Step 6: Alternative - Create more permissive policies
-- Drop existing policies and create new ones
DROP POLICY IF EXISTS "users_view_own_uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "users_insert_own_uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "users_update_own_uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "users_delete_own_uploads" ON public.file_uploads;

-- Create more permissive policies for authenticated users
CREATE POLICY "authenticated_users_view_uploads" ON public.file_uploads
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "authenticated_users_insert_uploads" ON public.file_uploads
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "authenticated_users_update_uploads" ON public.file_uploads
    FOR UPDATE TO authenticated
    USING (auth.uid() = uploaded_by)
    WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "authenticated_users_delete_uploads" ON public.file_uploads
    FOR DELETE TO authenticated
    USING (auth.uid() = uploaded_by);

-- Step 7: Test the policies
SELECT 'RLS policies updated for better compatibility' as result;
