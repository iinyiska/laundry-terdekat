-- =========================================================
-- 🔥 ULTIMATE FIX SCRIPT (JALANKAN INI SAJA) 🔥
-- Script ini memperbaiki:
-- 1. History Orderan (Fix RLS & Kolom)
-- 2. Ganti Theme (Fix Permission Table)
-- 3. List User Kosong (Fix Sync Trigger)
-- =========================================================

-- 1. ENABLE EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. UPDATE TABLES (Menambahkan Kolom yang Hilang)
-- Orders
CREATE TABLE IF NOT EXISTS public.orders (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES auth.users(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB;          -- Fix Satuan
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items_detail JSONB;   -- Fix Kiloan
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_type TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total NUMERIC;

-- Settings
CREATE TABLE IF NOT EXISTS public.site_settings (id text primary key default 'main');
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS bg_theme text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS custom_bg_url text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#3b82f6';
-- (Pastikan kolom lain ada jika diperlukan, tapi ini yang krusial untuk error thema)

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (id UUID REFERENCES auth.users(id) PRIMARY KEY);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. RESET PERMISSIONS / RLS (Nuclear Option untuk Admin) 🚀
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- --> ORDERS POLICIES
DROP POLICY IF EXISTS "Admins view all" ON public.orders;
CREATE POLICY "Admins view all" ON public.orders FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
DROP POLICY IF EXISTS "Customers insert own" ON public.orders;
CREATE POLICY "Customers insert own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Customers view own" ON public.orders;
CREATE POLICY "Customers view own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Merchants view assigned" ON public.orders;
CREATE POLICY "Merchants view assigned" ON public.orders FOR SELECT USING (
  merchant_id = auth.uid() OR
  (merchant_id IS NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'merchant'))
);
DROP POLICY IF EXISTS "Merchants update" ON public.orders;
CREATE POLICY "Merchants update" ON public.orders FOR UPDATE USING (merchant_id = auth.uid());

-- --> SETTINGS POLICIES
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin update settings" ON public.site_settings;
CREATE POLICY "Admin update settings" ON public.site_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- --> PROFILES POLICIES
DROP POLICY IF EXISTS "Public view profiles" ON public.profiles;
CREATE POLICY "Public view profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users update own" ON public.profiles;
CREATE POLICY "Users update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users insert own" ON public.profiles;
CREATE POLICY "Users insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. FIX USER LIST (AUTO-SYNC TRIGGER)
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'customer')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- BACKFILL (SYNC USER LAMA)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, raw_user_meta_data->>'full_name', 'customer'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. INITIAL DATA
INSERT INTO public.site_settings (id, bg_theme) VALUES ('main', 'modern') ON CONFLICT (id) DO NOTHING;
