-- Extended Site Settings for Super Admin Panel
-- Run this in Supabase SQL Editor

-- Drop and recreate site_settings with more fields
drop table if exists public.site_settings;

create table public.site_settings (
  id text primary key default 'main',
  -- Hero Section
  hero_title text default 'Cuci Bersih, Wangi Sempurna',
  hero_subtitle text default 'Platform laundry paling canggih dengan deteksi lokasi otomatis, antar-jemput gratis, dan diskon hingga 20% untuk member.',
  -- Promo
  promo_text text default 'Diskon 20% untuk Member Baru!',
  promo_enabled boolean default true,
  promo_description text default 'Daftar sekarang dan nikmati potongan harga untuk setiap transaksi pertama.',
  -- Colors
  primary_color text default '#3b82f6',
  accent_color text default '#8b5cf6',
  -- Dashboard
  dashboard_title text default 'Pilih Outlet Terdekat',
  dashboard_merchant_prefix text default 'Laundry Terdekat',
  -- Features
  feature_1_title text default 'Terdekat',
  feature_1_desc text default 'Outlet resmi di sekitarmu',
  feature_2_title text default 'Antar Jemput',
  feature_2_desc text default 'Gratis ongkir hingga 5km',
  feature_3_title text default 'Cepat',
  feature_3_desc text default 'Estimasi 24 jam selesai',
  feature_4_title text default 'Aman',
  feature_4_desc text default 'Garansi cucian hilang',
  -- Service Types
  regular_label text default 'Reguler (24 Jam)',
  regular_price_per_kg numeric default 7000,
  regular_eta text default '24 jam',
  express_label text default 'Express (8 Jam)',
  express_price_per_kg numeric default 15000,
  express_eta text default '8 jam',
  express_enabled boolean default true,
  -- Metadata
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Platform Services Table
drop table if exists public.platform_services;

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

-- RLS Policies
alter table public.site_settings enable row level security;
create policy "Site settings are publicly readable" on public.site_settings for select using (true);
create policy "Site settings are updatable" on public.site_settings for update using (true);
create policy "Site settings are insertable" on public.site_settings for insert with check (true);

alter table public.platform_services enable row level security;
create policy "Platform services readable" on public.platform_services for select using (true);
create policy "Platform services insertable" on public.platform_services for insert with check (true);
create policy "Platform services updatable" on public.platform_services for update using (true);
create policy "Platform services deletable" on public.platform_services for delete using (true);

-- Insert default settings
insert into public.site_settings (id) values ('main') on conflict (id) do nothing;

-- Insert default services
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
  ('Handuk', '🏊', 8000, 'pcs', 10);
