-- =========================================================
-- FIX ROLE UPDATE - FINAL SOLUTION
-- =========================================================
-- Masalah: Policy profiles_update hanya allow self-update
-- Solusi: Allow admin to update ANY profile
-- =========================================================

-- 1. DROP EXISTING POLICIES
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;

-- 2. CREATE NEW POLICIES WITH ADMIN CHECK
-- Allow user to update own profile OR admin to update any profile
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (
    (select auth.uid()) = id 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = (select auth.uid()) 
        AND role = 'admin'
    )
);

-- Allow admin to delete any user
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = (select auth.uid()) 
        AND role = 'admin'
    )
);

-- Allow user to insert own profile OR admin to insert any profile
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (
    (select auth.uid()) = id 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = (select auth.uid()) 
        AND role = 'admin'
    )
);

-- 3. VERIFY POLICIES
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;

-- 4. TEST UPDATE (Ganti USER_ID dengan ID user yang mau diubah)
-- UPDATE public.profiles SET role = 'merchant' WHERE id = 'USER_ID';
