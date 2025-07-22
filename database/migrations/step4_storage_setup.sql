-- STEP 4: Create storage bucket and storage policies
-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('file-uploads', 'file-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user file management
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

-- Admin storage policies
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

-- Test if storage was set up
SELECT 'Storage bucket and policies created successfully' as result;
