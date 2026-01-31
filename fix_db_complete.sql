-- PERBAIKAN TOTAL DATABASE (Jalankan ini di Supabase SQL Editor)

-- 1. Tambahkan kolom user_id yang hilang (PENTING!)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Buat Index agar aplikasi NGEBUT
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 3. Izinkan User membuat & melihat order mereka sendiri (RLS Policy)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders 
FOR SELECT USING (auth.uid() = user_id);

-- 4. Izinkan Merchant/Admin melihat semua order (Opsional, jaga-jaga)
DROP POLICY IF EXISTS "Merchant view all" ON public.orders;
CREATE POLICY "Merchant view all" ON public.orders 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'merchant' OR profiles.role = 'admin')
    )
);
