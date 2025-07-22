-- =============================================================================
-- FIX INFINITE RECURSION IN ADMIN POLICIES
-- =============================================================================
-- Remove the recursive policies and create safe ones using functions
-- =============================================================================

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "admin_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_delete_profiles" ON public.profiles;
DROP POLICY IF EXISTS "manager_view_all_profiles" ON public.profiles;

-- Create or update the admin check function to be SECURITY DEFINER
-- This prevents recursion by running with elevated privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    -- Get the user role directly, handling null case
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Return false if no role found (null case)
    RETURN COALESCE(user_role = 'admin', false);
EXCEPTION
    WHEN OTHERS THEN
        -- Return false on any error to prevent breaking auth
        RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Create or update the manager/admin check function
CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN 
SECURITY DEFINER  
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    -- Get the user role directly, handling null case
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Return false if no role found (null case)
    RETURN COALESCE(user_role IN ('admin', 'manager'), false);
EXCEPTION
    WHEN OTHERS THEN
        -- Return false on any error to prevent breaking auth
        RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Now create safe admin policies using the SECURITY DEFINER functions
CREATE POLICY "admin_view_all_profiles" ON public.profiles 
    FOR SELECT 
    TO authenticated 
    USING (public.is_admin());

CREATE POLICY "admin_update_all_profiles" ON public.profiles 
    FOR UPDATE 
    TO authenticated 
    USING (public.is_admin());

CREATE POLICY "manager_view_all_profiles" ON public.profiles 
    FOR SELECT 
    TO authenticated 
    USING (public.is_manager_or_admin());

-- Test the fix
SELECT 
    'Testing fixed policies...' as test,
    public.is_admin() as is_admin_result,
    public.is_manager_or_admin() as is_manager_or_admin_result;

-- Verify profile access
SELECT 
    id,
    email,
    role,
    'Profile fetch should work now' as status
FROM public.profiles 
WHERE id = auth.uid();

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'INFINITE RECURSION FIX APPLIED';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Fixed the circular reference in admin policies by:';
    RAISE NOTICE '   ✓ Making admin functions SECURITY DEFINER';
    RAISE NOTICE '   ✓ Recreating policies to use functions instead of direct queries';
    RAISE NOTICE '   ✓ Eliminating the infinite recursion loop';
    RAISE NOTICE '';
    RAISE NOTICE 'Your profile should now load correctly in the app!';
    RAISE NOTICE 'Try refreshing /debug or clicking "Refresh Profile"';
    RAISE NOTICE '=============================================================================';
END;
$$;
