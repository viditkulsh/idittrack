-- =============================================================================
-- MANUALLY CREATE ADMIN PROFILE
-- =============================================================================
-- Creates an admin profile for your specific user ID
-- =============================================================================

-- Insert admin profile for your user
INSERT INTO public.profiles (
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
) VALUES (
    '95b96e42-7021-4b4f-8179-9c62e1c34a59',
    'viditkul08@gmail.com',
    'Vidit',
    'Kulshrestha',
    'IditTrack Co',
    'admin',
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    company_name = EXCLUDED.company_name,
    role = 'admin',
    is_active = true,
    email_verified = true,
    updated_at = NOW();

-- Verify the profile was created
SELECT 
    id,
    email,
    first_name,
    last_name,
    company_name,
    role,
    is_active,
    email_verified
FROM public.profiles 
WHERE id = '95b96e42-7021-4b4f-8179-9c62e1c34a59';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'ADMIN PROFILE CREATED/UPDATED';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Created admin profile for:';
    RAISE NOTICE 'User ID: 95b96e42-7021-4b4f-8179-9c62e1c34a59';
    RAISE NOTICE 'Email: viditkul08@gmail.com';
    RAISE NOTICE 'Role: admin';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Refresh your app or click "Refresh Profile" in /debug';
    RAISE NOTICE '2. Check /debug again to see if profile loads';
    RAISE NOTICE '3. Try accessing /admin or /admin-direct';
    RAISE NOTICE '=============================================================================';
END;
$$;
