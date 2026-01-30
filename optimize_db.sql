-- Optimasi Database untuk Order Cepat
-- Jalankan script ini di Supabase SQL Editor

-- 1. Indexing (Agar load history ngebut)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 2. Pastikan kolom user_id ada dan index
-- (Sudah tercover di atas)

-- 3. Policy Check (Memastikan user bisa insert ordernya sendiri)
-- DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
-- CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
