-- =========================================================
-- SET ADMIN ROLES (HANYA 2 USER INI)
-- =========================================================

-- 1. Reset semua user ke customer
UPDATE public.profiles SET role = 'customer';

-- 2. Set admin hanya untuk email tertentu
UPDATE public.profiles SET role = 'admin' WHERE email = 'iinyiska@gmail.com';
UPDATE public.profiles SET role = 'admin' WHERE email = 'yoswicaksono@gmail.com';

-- Verifikasi
SELECT email, role FROM public.profiles ORDER BY role;
