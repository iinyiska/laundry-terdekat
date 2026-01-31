-- SCRIPT SECURITY & POLICIES UPDATE (REVISED)
-- Jalankan ini di Supabase SQL Editor

-- 1. Enable Extensions
create extension if not exists "uuid-ossp";

-- 2. Pastikan Tabel Pendukung Ada (Platform Services & Site Settings)
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

-- Seed Data jika kosong
INSERT INTO public.site_settings (id, hero_title, hero_subtitle, promo_text) 
VALUES ('main', 'Cuci Bersih, Wangi Sempurna', 'Platform laundry modern', 'Diskon 20% Member Baru') 
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.platform_services (name, icon, price, sort_order) VALUES
('Kemeja/Baju', '👕', 5000, 1),
('Celana', '👖', 5000, 2),
('Kaos', '🎽', 4000, 3)
ON CONFLICT DO NOTHING;

-- 3. Update Tabel Orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES auth.users(id);

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 4. KEBIJAKAN SECURITY (RLS)

-- A. ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view all" ON public.orders;
CREATE POLICY "Admins view all" ON public.orders 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Customers insert own" ON public.orders;
CREATE POLICY "Customers insert own" ON public.orders 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Customers view own" ON public.orders;
CREATE POLICY "Customers view own" ON public.orders 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Merchants view assigned" ON public.orders;
CREATE POLICY "Merchants view assigned" ON public.orders 
FOR SELECT USING (
    auth.uid() = merchant_id 
    OR 
    (merchant_id IS NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'merchant'))
);

DROP POLICY IF EXISTS "Merchants update assigned" ON public.orders;
CREATE POLICY "Merchants update assigned" ON public.orders 
FOR UPDATE USING (auth.uid() = merchant_id);


-- B. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- C. PLATFORM SERVICES
ALTER TABLE public.platform_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read services" ON public.platform_services;
CREATE POLICY "Public read services" ON public.platform_services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage services" ON public.platform_services;
CREATE POLICY "Admin manage services" ON public.platform_services FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- D. SITE SETTINGS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage settings" ON public.site_settings;
CREATE POLICY "Admin manage settings" ON public.site_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- 5. Indexing
CREATE INDEX IF NOT EXISTS idx_orders_merchant ON public.orders(merchant_id);
