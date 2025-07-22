-- QUICK FIX FOR "row-level security policy" ERROR
-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Check current user and authentication
SELECT 
    'Current User ID: ' || COALESCE(auth.uid()::text, 'NOT AUTHENTICATED') as status;

-- Step 2: Ensure file_uploads table exists and RLS is enabled
CREATE TABLE IF NOT EXISTS public.file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'completed', 'failed')),
    url TEXT,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_path TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Enable RLS
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "users_view_own_uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "users_insert_own_uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "users_update_own_uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "users_delete_own_uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "authenticated_users_view_uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "authenticated_users_insert_uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "authenticated_users_update_uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "authenticated_users_delete_uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "admin_manager_view_all_uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "admin_manager_update_all_uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "admin_delete_all_uploads" ON public.file_uploads;

-- Step 5: Create simple, working policies
CREATE POLICY "allow_authenticated_users_full_access" ON public.file_uploads
    FOR ALL TO authenticated
    USING (auth.uid() = uploaded_by)
    WITH CHECK (auth.uid() = uploaded_by);

-- Step 6: Create admin/manager policies
CREATE POLICY "allow_admin_manager_view_all" ON public.file_uploads
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- Step 7: Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('file-uploads', 'file-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Step 8: Set up storage policies
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all files" ON storage.objects;

CREATE POLICY "authenticated_users_storage_access" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'file-uploads')
    WITH CHECK (bucket_id = 'file-uploads');

-- Step 9: Test the setup
SELECT 
    'Setup completed! Your user ID is: ' || COALESCE(auth.uid()::text, 'NOT AUTHENTICATED') as result;

-- If you're still getting errors, temporarily disable RLS for testing:
-- ALTER TABLE public.file_uploads DISABLE ROW LEVEL SECURITY;
-- (Remember to re-enable it after testing: ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;)
