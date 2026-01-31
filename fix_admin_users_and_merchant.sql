-- ==========================================
-- FINAL FIX: USER SYNC & MERCHANT SETUP
-- ==========================================

-- 1. FIX SYNC TRIGGER (Auth -> Profiles)
-- This ensures every new signup appears in Admin Panel
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. BACKFILL (Import Existing Users)
-- Copies all current users to Profiles table immediately
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name',
    'customer'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 3. ENSURE ADMIN VISIBILITY (RLS)
-- Grants Admin select access to profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles 
FOR SELECT USING (
    -- Allow Admins to see everyone
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    -- Also allow users to see themselves (for Account page)
    OR id = auth.uid()
);

-- Allow Public Read (Optional, safer for simple apps)
DROP POLICY IF EXISTS "Public profiles view" ON public.profiles;
CREATE POLICY "Public profiles view" ON public.profiles FOR SELECT USING (true);


-- 4. FIX ORDERS PERMISSION (So Admin can Manage Orders)
DROP POLICY IF EXISTS "Admins manage all orders" ON public.orders;
CREATE POLICY "Admins manage all orders" ON public.orders 
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
