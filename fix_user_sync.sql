-- ==========================================
-- FIX USER LIST (SYNC AUTH -> PROFILES)
-- ==========================================

-- 1. Create Function to Handle New User (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'customer' -- Default role
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. BACKFILL EXISTING USERS (CRITICAL!)
-- This copies all current users from Auth System to Profiles table
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name',
    'customer'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Set Admin Role (Optional - Ganti Email dengan Email Admin Anda)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL@gmail.com';
