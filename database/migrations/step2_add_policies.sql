-- STEP 2: Add indexes and RLS policies
CREATE INDEX IF NOT EXISTS idx_file_uploads_uploaded_by ON public.file_uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_uploads_status ON public.file_uploads(status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON public.file_uploads(created_at);

-- Enable RLS
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Basic policies for users to manage their own files
CREATE POLICY "users_view_own_uploads" ON public.file_uploads
    FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "users_insert_own_uploads" ON public.file_uploads
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "users_update_own_uploads" ON public.file_uploads
    FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "users_delete_own_uploads" ON public.file_uploads
    FOR DELETE USING (auth.uid() = uploaded_by);

-- Test if policies were created
SELECT 'Policies created successfully' as result;
