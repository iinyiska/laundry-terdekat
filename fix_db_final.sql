-- SCRIPT PERBAIKAN DATABASE SUPER FINAL
-- Jalankan script ini di Supabase SQL Editor (Hapus query lama dulu)

-- 1. Enable Extension (Wajib untuk UUID)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Perbaiki Tabel PROFILES (Tambah Role)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users not null primary key
);

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text;

-- 3. Perbaiki Tabel ORDERS (Tambah User ID)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now()
);

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- 4. OPTIMASI SPEED (Indexing)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 5. SECURITY & PERMISSIONS (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy untuk Order
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Merchant view all" ON public.orders;
CREATE POLICY "Merchant view all" ON public.orders 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('merchant', 'admin')
    )
);

-- Policy untuk Profile
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Selesai! Aplikasi Anda sekarang harusnya lancar jaya.
