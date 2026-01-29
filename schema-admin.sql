-- Site Settings Table for Admin Panel
create table if not exists public.site_settings (
  id text primary key default 'main',
  hero_title text default 'Cuci Bersih, Wangi Sempurna',
  hero_subtitle text default 'Platform laundry paling canggih dengan deteksi lokasi otomatis',
  promo_text text default 'Diskon 20% untuk Member Baru!',
  promo_enabled boolean default true,
  primary_color text default '#3b82f6',
  accent_color text default '#8b5cf6',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Default Laundry Services (Platform-wide)
create table if not exists public.platform_services (
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

-- Allow public read for site settings
alter table public.site_settings enable row level security;
create policy "Site settings are publicly readable" on public.site_settings for select using (true);

-- Allow public read for platform services
alter table public.platform_services enable row level security;
create policy "Platform services are publicly readable" on public.platform_services for select using (true);

-- Insert default settings
insert into public.site_settings (id) values ('main') on conflict (id) do nothing;

-- Insert default services
insert into public.platform_services (name, icon, price, unit_type, category, sort_order) values
  ('Kemeja/Baju', '👕', 5000, 'pcs', 'regular', 1),
  ('Celana', '👖', 5000, 'pcs', 'regular', 2),
  ('Kaos', '🎽', 4000, 'pcs', 'regular', 3),
  ('Pakaian Dalam', '🩲', 3000, 'pcs', 'regular', 4),
  ('Kaos Kaki (pair)', '🧦', 2000, 'pcs', 'regular', 5),
  ('Jaket/Sweater', '🧥', 15000, 'pcs', 'premium', 6),
  ('Dress/Gaun', '👗', 20000, 'pcs', 'premium', 7),
  ('Sprei', '🛏️', 25000, 'pcs', 'bedding', 8),
  ('Selimut', '🛋️', 30000, 'pcs', 'bedding', 9),
  ('Handuk', '🏊', 8000, 'pcs', 'regular', 10)
on conflict do nothing;
