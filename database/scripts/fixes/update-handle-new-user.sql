-- =============================================================================
-- UPDATE HANDLE_NEW_USER FUNCTION TO SUPPORT COMPANY_NAME
-- =============================================================================
-- This script updates the handle_new_user function to properly handle
-- the company field from user metadata and store it as company_name.
-- =============================================================================

-- Update the handle_new_user function to include company_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        email,
        company_name,
        role,
        is_active,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        NEW.email,
        NEW.raw_user_meta_data->>'company',
        'user'::user_role,
        true,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- If the profile already exists, update it with the new information
        UPDATE public.profiles 
        SET 
            first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', first_name),
            last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', last_name),
            email = NEW.email,
            company_name = COALESCE(NEW.raw_user_meta_data->>'company', company_name),
            email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, email_verified),
            updated_at = NOW()
        WHERE id = NEW.id;
        
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'HANDLE_NEW_USER FUNCTION UPDATED';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Updated handle_new_user function to:';
    RAISE NOTICE '   ✓ Extract company field from user metadata';
    RAISE NOTICE '   ✓ Store it as company_name in profiles table';
    RAISE NOTICE '   ✓ Handle profile updates on duplicate key';
    RAISE NOTICE '';
    RAISE NOTICE 'New user registrations will now properly store company information.';
    RAISE NOTICE '=============================================================================';
END;
$$;
