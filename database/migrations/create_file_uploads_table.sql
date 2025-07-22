-- Create file_uploads table for tracking uploaded files
CREATE TABLE IF NOT EXISTS public.file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size DECIMAL(10,2) NOT NULL, -- Size in MB
    status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'completed', 'failed')),
    url TEXT,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_path TEXT, -- Path in storage bucket
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_file_uploads_uploaded_by ON public.file_uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_uploads_status ON public.file_uploads(status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON public.file_uploads(created_at);

-- Enable RLS
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for file uploads
-- Users can view their own uploads
CREATE POLICY "users_view_own_uploads" ON public.file_uploads
    FOR SELECT USING (auth.uid() = uploaded_by);

-- Users can insert their own uploads
CREATE POLICY "users_insert_own_uploads" ON public.file_uploads
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Users can update their own uploads
CREATE POLICY "users_update_own_uploads" ON public.file_uploads
    FOR UPDATE USING (auth.uid() = uploaded_by);

-- Users can delete their own uploads
CREATE POLICY "users_delete_own_uploads" ON public.file_uploads
    FOR DELETE USING (auth.uid() = uploaded_by);

-- Admins and managers can view all uploads
CREATE POLICY "admin_manager_view_all_uploads" ON public.file_uploads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- Admins and managers can update all uploads
CREATE POLICY "admin_manager_update_all_uploads" ON public.file_uploads
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- Admins can delete any upload
CREATE POLICY "admin_delete_all_uploads" ON public.file_uploads
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_file_uploads_updated_at 
    BEFORE UPDATE ON public.file_uploads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('file-uploads', 'file-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload files" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'file-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'file-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'file-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'file-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins can manage all files in storage
CREATE POLICY "Admins can manage all files" ON storage.objects
    FOR ALL TO authenticated
    USING (
        bucket_id = 'file-uploads' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

COMMENT ON TABLE public.file_uploads IS 'Stores metadata about uploaded files';
COMMENT ON COLUMN public.file_uploads.metadata IS 'Additional file metadata like original name, processing info, etc.';
