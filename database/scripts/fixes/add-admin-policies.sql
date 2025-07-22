-- =============================================================================
-- ADD MISSING ADMIN POLICIES FOR PROFILES TABLE
-- =============================================================================
-- This script adds the missing admin policies that allow admins to view and
-- manage all user profiles in the admin panel.
-- =============================================================================

-- Admin can view all profiles
CREATE POLICY "admin_view_all_profiles" ON public.profiles 
    FOR SELECT 
    TO authenticated 
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Admin can update all profiles  
CREATE POLICY "admin_update_all_profiles" ON public.profiles 
    FOR UPDATE 
    TO authenticated 
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Admin can delete profiles (optional, be careful with this)
CREATE POLICY "admin_delete_profiles" ON public.profiles 
    FOR DELETE 
    TO authenticated 
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        AND id != auth.uid() -- Prevent admins from deleting their own account
    );

-- Manager can view all profiles (optional)
CREATE POLICY "manager_view_all_profiles" ON public.profiles 
    FOR SELECT 
    TO authenticated 
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager')
    );

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'ADMIN POLICIES ADDED FOR PROFILES TABLE';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Added the following policies:';
    RAISE NOTICE '   ✓ admin_view_all_profiles - Admins can view all user profiles';
    RAISE NOTICE '   ✓ admin_update_all_profiles - Admins can update any profile';
    RAISE NOTICE '   ✓ admin_delete_profiles - Admins can delete profiles (except their own)';
    RAISE NOTICE '   ✓ manager_view_all_profiles - Managers can view all profiles';
    RAISE NOTICE '';
    RAISE NOTICE 'Your admin panel should now show all registered users!';
    RAISE NOTICE '=============================================================================';
END;
$$;
