-- =========================================================
-- ADMIN FULL CONTROL - ALLOW CHANGE ALL ROLES
-- =========================================================

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;

-- ADMIN CAN UPDATE ANY USER'S ROLE
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (
    (select auth.uid()) = id 
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
);

-- ADMIN CAN DELETE ANY USER
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
);

-- ADMIN CAN ADD NEW USER
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (
    (select auth.uid()) = id 
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
);

-- Verify current admins
SELECT email, role FROM public.profiles WHERE role = 'admin';
