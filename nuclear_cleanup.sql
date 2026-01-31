-- =========================================================
-- ☢️ NUCLEAR CLEANUP SCRIPT ☢️
-- JALANKAN INI UNTUK MENGHAPUS SEMUA POLICY LAMA
-- DAN MEMBUAT ULANG DENGAN BENAR
-- =========================================================

-- ========== STEP 1: DROP ALL EXISTING POLICIES ==========
-- ORDERS
DO $$ DECLARE pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', pol.policyname);
    END LOOP;
END $$;

-- PROFILES
DO $$ DECLARE pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- SITE_SETTINGS
DO $$ DECLARE pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_settings' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.site_settings', pol.policyname);
    END LOOP;
END $$;

-- PLATFORM_SERVICES
DO $$ DECLARE pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'platform_services' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.platform_services', pol.policyname);
    END LOOP;
END $$;

-- CUSTOMERS
DO $$ DECLARE pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customers' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.customers', pol.policyname);
    END LOOP;
END $$;

-- ORDER_STATUS_HISTORY
DO $$ DECLARE pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_status_history' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.order_status_history', pol.policyname);
    END LOOP;
END $$;

-- ========== STEP 2: DROP DUPLICATE INDEXES ==========
DROP INDEX IF EXISTS public.idx_orders_merchant;
DROP INDEX IF EXISTS public.idx_profile_role;

-- ========== STEP 3: RECREATE CLEAN POLICIES (OPTIMIZED) ==========
-- KEY FIX: Using (select auth.uid()) instead of auth.uid() for performance

-- ORDERS: Simple public access (security handled in code)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select" ON public.orders FOR SELECT USING (true);
CREATE POLICY "orders_insert" ON public.orders FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);
CREATE POLICY "orders_update" ON public.orders FOR UPDATE USING ((select auth.uid()) IS NOT NULL);
CREATE POLICY "orders_delete" ON public.orders FOR DELETE USING ((select auth.uid()) IS NOT NULL);

-- PROFILES: Public read, self-write
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING ((select auth.uid()) = id);

-- SITE_SETTINGS: Full public access (admin check in code)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_all" ON public.site_settings FOR ALL USING (true);

-- PLATFORM_SERVICES: Full public access
ALTER TABLE public.platform_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_all" ON public.platform_services FOR ALL USING (true);

-- CUSTOMERS: Full public access
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_all" ON public.customers FOR ALL USING (true);

-- ORDER_STATUS_HISTORY: Full public access
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history_all" ON public.order_status_history FOR ALL USING (true);

-- ========== STEP 4: USER SYNC (FORCE UPDATE) ==========
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 'customer')
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- FORCE SYNC ALL EXISTING USERS
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    'customer'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name);

-- ========== STEP 5: REFRESH STATS ==========
ANALYZE public.profiles;
ANALYZE public.orders;
ANALYZE public.site_settings;
ANALYZE public.platform_services;
