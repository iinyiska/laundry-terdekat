-- Laundry Terdekat Complete Schema
-- Run this in Supabase SQL Editor

-- Enable UUID
create extension if not exists "uuid-ossp";

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================
drop table if exists public.site_settings cascade;

create table public.site_settings (
  id text primary key default 'main',
  hero_title text default 'Cuci Bersih, Wangi Sempurna',
  hero_subtitle text default 'Platform laundry paling canggih dengan deteksi lokasi otomatis, antar-jemput gratis, dan diskon hingga 20% untuk member.',
  promo_text text default 'Diskon 20% untuk Member Baru!',
  promo_enabled boolean default true,
  promo_description text default 'Daftar sekarang dan nikmati potongan harga.',
  primary_color text default '#3b82f6',
  accent_color text default '#8b5cf6',
  dashboard_title text default 'Pilih Outlet Terdekat',
  dashboard_merchant_prefix text default 'Laundry Terdekat',
  feature_1_title text default 'Terdekat',
  feature_1_desc text default 'Outlet resmi di sekitarmu',
  feature_2_title text default 'Antar Jemput',
  feature_2_desc text default 'Gratis ongkir hingga 5km',
  feature_3_title text default 'Cepat',
  feature_3_desc text default 'Estimasi 24 jam selesai',
  feature_4_title text default 'Aman',
  feature_4_desc text default 'Garansi cucian hilang',
  regular_label text default 'Reguler (24 Jam)',
  regular_price_per_kg numeric default 7000,
  regular_eta text default '24 jam',
  express_label text default 'Express (8 Jam)',
  express_price_per_kg numeric default 15000,
  express_eta text default '8 jam',
  express_enabled boolean default true,
  bg_theme text default 'gradient',
  custom_bg_url text default '',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ============================================
-- PLATFORM SERVICES TABLE
-- ============================================
drop table if exists public.platform_services cascade;

create table public.platform_services (
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

-- ============================================
-- USERS/CUSTOMERS TABLE
-- ============================================
drop table if exists public.customers cascade;

create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  auth_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique,
  phone text,
  whatsapp text,
  address text,
  kelurahan text,
  city text,
  latitude numeric,
  longitude numeric,
  is_member boolean default false,
  member_discount numeric default 0,
  total_orders integer default 0,
  total_spent numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ============================================
-- ORDERS TABLE
-- ============================================
drop table if exists public.orders cascade;

create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text unique not null,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  customer_whatsapp text not null,
  
  -- Location
  pickup_address text not null,
  pickup_kelurahan text,
  pickup_city text,
  pickup_latitude numeric,
  pickup_longitude numeric,
  
  -- Order Type
  order_type text not null check (order_type in ('satuan', 'kiloan')),
  service_speed text not null check (service_speed in ('regular', 'express')),
  
  -- For Kiloan
  weight_kg numeric,
  items_detail jsonb, -- {"baju": 5, "celana": 3, ...}
  
  -- For Satuan
  items jsonb, -- [{"name": "Kemeja", "qty": 2, "price": 5000}, ...]
  
  -- Pricing
  subtotal numeric not null,
  discount numeric default 0,
  delivery_fee numeric default 0,
  total numeric not null,
  
  -- Status
  status text default 'pending' check (status in ('pending', 'confirmed', 'pickup', 'washing', 'drying', 'ironing', 'ready', 'delivery', 'completed', 'cancelled')),
  payment_status text default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  payment_method text,
  
  -- Timestamps
  order_date timestamp with time zone default timezone('utc'::text, now()),
  pickup_date timestamp with time zone,
  estimated_done timestamp with time zone,
  completed_date timestamp with time zone,
  
  -- Notes
  notes text,
  admin_notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ============================================
-- ORDER STATUS HISTORY
-- ============================================
drop table if exists public.order_status_history cascade;

create table public.order_status_history (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  status text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Site Settings: Anyone can read, any authenticated can write
alter table public.site_settings enable row level security;
drop policy if exists "site_settings_select" on public.site_settings;
drop policy if exists "site_settings_all" on public.site_settings;
create policy "site_settings_select" on public.site_settings for select using (true);
create policy "site_settings_all" on public.site_settings for all using (true) with check (true);

-- Platform Services
alter table public.platform_services enable row level security;
drop policy if exists "services_select" on public.platform_services;
drop policy if exists "services_all" on public.platform_services;
create policy "services_select" on public.platform_services for select using (true);
create policy "services_all" on public.platform_services for all using (true) with check (true);

-- Customers
alter table public.customers enable row level security;
drop policy if exists "customers_select" on public.customers;
drop policy if exists "customers_all" on public.customers;
create policy "customers_select" on public.customers for select using (true);
create policy "customers_all" on public.customers for all using (true) with check (true);

-- Orders
alter table public.orders enable row level security;
drop policy if exists "orders_select" on public.orders;
drop policy if exists "orders_all" on public.orders;
create policy "orders_select" on public.orders for select using (true);
create policy "orders_all" on public.orders for all using (true) with check (true);

-- Order Status History
alter table public.order_status_history enable row level security;
drop policy if exists "order_history_select" on public.order_status_history;
drop policy if exists "order_history_all" on public.order_status_history;
create policy "order_history_select" on public.order_status_history for select using (true);
create policy "order_history_all" on public.order_status_history for all using (true) with check (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate order number
create or replace function generate_order_number()
returns text as $$
begin
  return 'LT' || to_char(now(), 'YYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
end;
$$ language plpgsql;

-- ============================================
-- SEED DATA
-- ============================================

-- Settings
insert into public.site_settings (id) values ('main') on conflict (id) do nothing;

-- Services
insert into public.platform_services (name, icon, price, unit_type, sort_order) values
  ('Kemeja/Baju', '👕', 5000, 'pcs', 1),
  ('Celana', '👖', 5000, 'pcs', 2),
  ('Kaos', '🎽', 4000, 'pcs', 3),
  ('Pakaian Dalam', '🩲', 3000, 'pcs', 4),
  ('Kaos Kaki (pair)', '🧦', 2000, 'pcs', 5),
  ('Jaket/Sweater', '🧥', 15000, 'pcs', 6),
  ('Dress/Gaun', '👗', 20000, 'pcs', 7),
  ('Sprei', '🛏️', 25000, 'pcs', 8),
  ('Selimut', '🛋️', 30000, 'pcs', 9),
  ('Handuk', '🏊', 8000, 'pcs', 10)
on conflict do nothing;

-- ============================================
-- STORAGE BUCKET FOR BACKGROUNDS
-- ============================================
-- Run this separately in Supabase Dashboard > Storage
-- Create bucket: backgrounds (public)
