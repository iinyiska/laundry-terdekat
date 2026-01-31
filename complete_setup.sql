-- ==========================================
-- SCRIPT FINAL (RUN THIS!)
-- ==========================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES (Safe Creation)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id text primary key default 'main',
  hero_title text,
  hero_subtitle text,
  promo_text text,
  promo_enabled boolean default true,
  primary_color text default '#3b82f6',
  accent_color text default '#8b5cf6',
  dashboard_title text,
  dashboard_merchant_prefix text,
  regular_label text,
  regular_price_per_kg numeric,
  regular_eta text,
  express_label text,
  express_price_per_kg numeric,
  express_eta text,
  express_enabled boolean,
  bg_theme text,
  custom_bg_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.platform_services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  icon text default '👕',
  price numeric not null,
  unit_type text not null default 'pcs',
  category text default 'regular',
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ensure orders table has all columns
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    merchant_id UUID REFERENCES auth.users(id),
    order_number TEXT,
    customer_name TEXT,
    customer_whatsapp TEXT,
    pickup_address TEXT,
    pickup_kelurahan TEXT,
    pickup_city TEXT,
    pickup_latitude NUMERIC,
    pickup_longitude NUMERIC,
    order_type TEXT, -- 'kiloan', 'satuan'
    service_speed TEXT, -- 'regular', 'express'
    weight_kg NUMERIC,
    items JSONB,         -- [NEW] For Satuan arrays
    items_detail JSONB,  -- [NEW] For Kiloan object
    subtotal NUMERIC,
    total NUMERIC,
    status TEXT DEFAULT 'pending',
    notes TEXT
);

-- Ensure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. FIX MISSING COLUMNS (If table existed before)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items_detail JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES auth.users(id);

-- 4. RLS POLICIES (Reset & Re-apply)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Orders Policies
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
    Merchant_id = auth.uid() OR
    (merchant_id IS NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'merchant'))
);

DROP POLICY IF EXISTS "Merchants update assigned" ON public.orders;
CREATE POLICY "Merchants update assigned" ON public.orders FOR UPDATE USING (merchant_id = auth.uid());


-- Settings Policies (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write settings" ON public.site_settings;
CREATE POLICY "Admin write settings" ON public.site_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Services Policies (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public read services" ON public.platform_services;
CREATE POLICY "Public read services" ON public.platform_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write services" ON public.platform_services;
CREATE POLICY "Admin write services" ON public.platform_services FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles view" ON public.profiles;
CREATE POLICY "Public profiles view" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own" ON public.profiles;
CREATE POLICY "Users update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users insert own" ON public.profiles;
CREATE POLICY "Users insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- 5. SEED INITIAL DATA (Settings)
INSERT INTO public.site_settings (id, hero_title, hero_subtitle, promo_text) 
VALUES ('main', 'Cuci Bersih, Wangi Sempurna', 'Platform laundry modern', 'Diskon 20% Member Baru') 
ON CONFLICT (id) DO NOTHING;
