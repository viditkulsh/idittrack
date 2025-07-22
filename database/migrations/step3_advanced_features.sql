-- STEP 3: Add admin/manager policies and storage setup
-- Admin and manager policies
CREATE POLICY "admin_manager_view_all_uploads" ON public.file_uploads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "admin_manager_update_all_uploads" ON public.file_uploads
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

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

-- Test if advanced features were added
SELECT 'Advanced policies and triggers created successfully' as result;
